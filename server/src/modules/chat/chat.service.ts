import { Injectable, NotFoundException, ForbiddenException, Logger, Inject, HttpException, HttpStatus, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as mongoose from 'mongoose';
import { AiSession } from '@/database/entities';
import { ChatMessageDocument } from '@/database/schemas';
import { AiService, RiskControlService, CacheService, NotificationService } from '@/shared';
import { RiskLevel, MessageRole } from '@/types';
import { SendMessageDto } from './dto/send-message.dto';

interface MemoryMessage {
  _id: string;
  sessionId: string;
  userId: number;
  role: MessageRole;
  content: string;
  moodTag: string;
  riskLevel: RiskLevel;
  createdAt: Date;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private memoryMessages: MemoryMessage[] = [];

  constructor(
    @InjectRepository(AiSession)
    private aiSessionRepository: Repository<AiSession>,
    private aiService: AiService,
    private riskControlService: RiskControlService,
    private cacheService: CacheService,
    private notificationService: NotificationService,
    @Optional() @Inject('ChatMessageModel')
    private chatMessageModel?: mongoose.Model<ChatMessageDocument>
  ) {}

  async createSession(userId: number): Promise<AiSession> {
    const session = this.aiSessionRepository.create({
      userId,
      title: '新会话',
      messageCount: 0
    });
    return this.aiSessionRepository.save(session);
  }

  async getSessions(userId: number): Promise<AiSession[]> {
    return this.aiSessionRepository.find({
      where: { userId, status: 1 },
      order: { updatedAt: 'DESC' }
    });
  }

  async getSessionById(userId: number, sessionId: number): Promise<AiSession> {
    const session = await this.aiSessionRepository.findOne({ where: { id: sessionId, userId } });
    if (!session) {
      throw new NotFoundException('会话不存在');
    }
    return session;
  }

  async endSession(userId: number, sessionId: number): Promise<void> {
    const session = await this.getSessionById(userId, sessionId);
    await this.aiSessionRepository.update(sessionId, { status: 0 });
  }

  async getMessages(sessionId: string): Promise<ChatMessageDocument[]> {
    if (this.chatMessageModel) {
      return this.chatMessageModel
        .find({ sessionId })
        .sort({ createdAt: 'asc' })
        .exec();
    } else {
      return this.memoryMessages
        .filter(m => m.sessionId === sessionId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) as unknown as ChatMessageDocument[];
    }
  }

  async getWeeklyChatCount(userId: number): Promise<{ weeklyCount: number; weeklyLimit: number; totalCount: number }> {
    const weeklyCount = await this.cacheService.getWeeklyChatCount(userId);
    const totalCount = await this.cacheService.getTotalChatCount(userId);
    console.log(`[DEBUG] getWeeklyChatCount - userId: ${userId}, weeklyCount: ${weeklyCount}, totalCount: ${totalCount}`);
    return { weeklyCount, weeklyLimit: 50, totalCount };
  }

  async sendMessage(userId: number, dto: SendMessageDto): Promise<{ session: AiSession; message: ChatMessageDocument }> {
    if (this.riskControlService.hasSensitiveContent(dto.content)) {
      throw new ForbiddenException('检测到敏感内容，已拦截');
    }

    let session: AiSession;
    if (dto.sessionId) {
      session = await this.getSessionById(userId, parseInt(dto.sessionId));
    } else {
      session = await this.createSession(userId);
    }

    const riskLevel = this.riskControlService.analyzeRisk(dto.content);
    
    if (riskLevel === 2) {
      await this.handleHighRisk(userId, session.id, dto.content);
      const crisisMessage = this.riskControlService.getCrisisInterventionMessage();
      const message = await this.saveMessage(session.id.toString(), userId, 'assistant', crisisMessage, 'crisis', riskLevel);
      await this.updateSession(session.id, riskLevel);
      return { session, message };
    }

    const moodResult = await this.aiService.analyzeMood(dto.content);
    await this.saveMessage(session.id.toString(), userId, 'user', dto.content, moodResult.mood, riskLevel);

    const weeklyCount = await this.cacheService.incrementWeeklyChatCount(userId);
    const totalCount = await this.cacheService.incrementTotalChatCount(userId);
    console.log(`[DEBUG] sendMessage - userId: ${userId}, weeklyCount: ${weeklyCount}, totalCount: ${totalCount}`);

    const history = await this.getMessages(session.id.toString());
    const historyMessages = history.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    const aiResponse = await this.aiService.generateResponse(
      session.id.toString(),
      userId,
      dto.content,
      historyMessages
    );

    const responseMood = await this.aiService.analyzeMood(aiResponse);
    const responseMessage = await this.saveMessage(
      session.id.toString(),
      userId,
      'assistant',
      aiResponse,
      responseMood.mood,
      0
    );

    await this.updateSession(session.id, riskLevel);

    if (riskLevel === 1) {
      await this.notificationService.notifyHighRiskUser(userId);
    }

    return { session, message: responseMessage };
  }

  private async handleHighRisk(userId: number, sessionId: number, content: string): Promise<void> {
    await this.notificationService.notifyCrisisIntervention(userId);
    await this.aiSessionRepository.update(sessionId, { riskFlag: 2 });
  }

  private async saveMessage(
    sessionId: string,
    userId: number,
    role: MessageRole,
    content: string,
    moodTag: string,
    riskLevel: RiskLevel
  ): Promise<ChatMessageDocument> {
    if (this.chatMessageModel) {
      const message = new this.chatMessageModel({
        sessionId,
        userId,
        role,
        content,
        moodTag,
        riskLevel,
        createdAt: new Date()
      });
      return message.save();
    } else {
      const memoryMessage: MemoryMessage = {
        _id: Date.now().toString(),
        sessionId,
        userId,
        role,
        content,
        moodTag,
        riskLevel,
        createdAt: new Date()
      };
      this.memoryMessages.push(memoryMessage);
      return memoryMessage as unknown as ChatMessageDocument;
    }
  }

  private async updateSession(sessionId: number, riskLevel: RiskLevel): Promise<void> {
    const updateData: Partial<AiSession> = {
      updatedAt: new Date()
    };

    if (riskLevel === 2) {
      updateData.riskFlag = 2;
    } else if (riskLevel === 1) {
      updateData.riskFlag = 1;
    }

    await this.aiSessionRepository.increment({ id: sessionId }, 'messageCount', 1);
    await this.aiSessionRepository.update(sessionId, updateData);
  }
}
