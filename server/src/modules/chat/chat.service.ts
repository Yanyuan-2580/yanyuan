import { Injectable, NotFoundException, ForbiddenException, Logger, Inject, HttpException, HttpStatus, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as mongoose from 'mongoose';
import { Observable } from 'rxjs';
import { AiSession } from '@/database/entities';
import { ChatMessageDocument } from '@/database/schemas';
import { AiService, RiskControlService, CacheService, NotificationService } from '@/shared';
import { UserNotificationService } from '@/modules/notification/notification.service';
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
    @Optional() @Inject('ChatMessage')
    private chatMessageModel?: mongoose.Model<ChatMessageDocument>,
    @Optional() private userNotificationService?: UserNotificationService
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
    }
    // MongoDB 未连接时仅用于降级开发，生产环境应确保 MongoDB 已配置
    this.logger.warn('ChatMessageModel 未注入，使用内存存储（重启丢失，仅限开发）');
    return this.memoryMessages
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) as unknown as ChatMessageDocument[];
  }

  async getWeeklyChatCount(userId: number): Promise<{ weeklyCount: number; weeklyLimit: number; totalCount: number }> {
    const weeklyCount = await this.cacheService.getWeeklyChatCount(userId);
    const totalCount = await this.cacheService.getTotalChatCount(userId);
    this.logger.debug(`getWeeklyChatCount - userId: ${userId}, weeklyCount: ${weeklyCount}, totalCount: ${totalCount}`);
    return { weeklyCount, weeklyLimit: 50, totalCount };
  }

  /**
   * 公共预处理：敏感词检测 + 获取/创建会话 + 风险分析 + 持久化
   * sendMessage 和 sendMessageStream 共用
   */
  private async preprocessMessage(
    userId: number,
    content: string,
    sessionId?: string
  ): Promise<{ session: AiSession; riskLevel: RiskLevel; aiCrisis: { isCrisis: boolean; message: string; keywords: string[] }; repeatHighCount: number }> {
    // 1. 敏感内容检测
    if (this.riskControlService.hasSensitiveContent(content)) {
      throw new ForbiddenException('检测到敏感内容，已拦截');
    }

    // 2. 获取或创建会话
    let session: AiSession;
    if (sessionId) {
      session = await this.getSessionById(userId, parseInt(sessionId));
    } else {
      session = await this.createSession(userId);
    }

    // 3. 风险分析
    let riskLevel = this.riskControlService.analyzeRisk(content);

    // 4. AI 危机检测
    const aiCrisis = this.aiService.detectCrisisInContent(content);
    if (aiCrisis.isCrisis && riskLevel < 2) {
      this.logger.warn(`AI crisis detected for userId=${userId}: keywords=${aiCrisis.keywords.join(', ')}`);
      riskLevel = 2;
    }

    // 5. 风险追踪 + 时间衰减
    if (riskLevel > 0) {
      const trackedLevel = await this.riskControlService.trackRisk(userId, riskLevel, content);
      if (trackedLevel > riskLevel) {
        this.logger.warn(`用户 ${userId} 风险等级升级: ${riskLevel} → ${trackedLevel}`);
        riskLevel = trackedLevel;
      }
    }

    // 6. 持久化风险记录
    if (riskLevel > 0) {
      await this.riskControlService.saveRiskRecord({
        userId,
        sessionId: session.id,
        content: content.slice(0, 500),
        riskLevel,
        source: 'chat',
        action: riskLevel === 2 ? 'crisis_blocked' : 'warned',
      });
    }

    // 7. 重复高危统计
    const riskStats = riskLevel > 0 ? await this.riskControlService.getRiskStats(userId) : null;
    const repeatHighCount = riskStats?.recentHighCount || 0;

    return { session, riskLevel: riskLevel as RiskLevel, aiCrisis, repeatHighCount };
  }

  async sendMessage(userId: number, dto: SendMessageDto): Promise<{ session: AiSession; message: ChatMessageDocument }> {
    const { session, riskLevel, aiCrisis, repeatHighCount } =
      await this.preprocessMessage(userId, dto.content, dto.sessionId);

    // ===== 高危处理 =====
    if (riskLevel === 2) {
      await this.handleHighRisk(userId, session.id, dto.content);
      const crisisMessage = aiCrisis.isCrisis
        ? aiCrisis.message
        : this.riskControlService.getInterventionMessage(2, repeatHighCount);
      const message = await this.saveMessage(session.id.toString(), userId, 'assistant', crisisMessage, 'crisis', riskLevel);
      await this.updateSession(session.id, riskLevel);
      return { session, message };
    }

    const moodResult = await this.aiService.analyzeMood(dto.content);
    await this.saveMessage(session.id.toString(), userId, 'user', dto.content, moodResult.mood, riskLevel);

    const weeklyCount = await this.cacheService.incrementWeeklyChatCount(userId);
    const totalCount = await this.cacheService.incrementTotalChatCount(userId);
    this.logger.debug(`sendMessage - userId: ${userId}, weeklyCount: ${weeklyCount}, totalCount: ${totalCount}`);

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

    // 中危时追加温和关怀提示（优化7）
    const finalResponse = riskLevel === 1
      ? aiResponse + this.riskControlService.getGentlePrompt()
      : aiResponse;

    const responseMood = await this.aiService.analyzeMood(finalResponse);
    const responseMessage = await this.saveMessage(
      session.id.toString(),
      userId,
      'assistant',
      finalResponse,
      responseMood.mood,
      0
    );

    await this.updateSession(session.id, riskLevel);

    if (riskLevel === 1) {
      await this.notificationService.notifyHighRiskUser(userId);
      // 推送温和提示通知（优化7）
      if (this.userNotificationService) {
        await this.userNotificationService.createNotification(userId, {
          type: 'risk',
          title: '关心你自己',
          content: '最近可能有些辛苦吧？需要的话，我随时可以陪你聊聊。',
          referenceType: 'session',
          referenceId: session.id,
        });
      }
    }

    return { session, message: responseMessage };
  }

  sendMessageStream(userId: number, dto: SendMessageDto): Observable<{ type: 'start' | 'chunk' | 'complete' | 'error'; data?: any }> {
    return new Observable(subscriber => {
      (async () => {
        try {
          // 复用公共预处理（敏感词 + 会话 + 风险分析 + AI危机检测 + 持久化）
          let session: AiSession;
          let riskLevel: RiskLevel;
          let aiCrisis: { isCrisis: boolean; message: string; keywords: string[] };
          try {
            const pre = await this.preprocessMessage(userId, dto.content, dto.sessionId);
            session = pre.session;
            riskLevel = pre.riskLevel;
            aiCrisis = pre.aiCrisis;
          } catch (err) {
            if (err instanceof ForbiddenException) {
              subscriber.next({ type: 'error', data: { message: '检测到敏感内容，已拦截' } });
            } else {
              subscriber.next({ type: 'error', data: { message: err.message || '服务器错误' } });
            }
            subscriber.complete();
            return;
          }

          // High risk - crisis intervention
          if (riskLevel === 2) {
            await this.handleHighRisk(userId, session.id, dto.content);
            if (this.userNotificationService) {
              await this.userNotificationService.createNotification(userId, {
                type: 'risk',
                title: '危机干预提醒',
                content: '系统检测到高危内容，已提供危机干预热线。请关注您的心理状态。',
                referenceType: 'session',
                referenceId: session.id
              });
            }
            const crisisMessage = aiCrisis.isCrisis
              ? aiCrisis.message
              : this.riskControlService.getCrisisInterventionMessage();
            subscriber.next({ type: 'start', data: { sessionId: session.id, riskLevel: 2 } });
            for (const char of crisisMessage) {
              subscriber.next({ type: 'chunk', data: { content: char } });
              await this.delay(30);
            }
            await this.saveMessage(session.id.toString(), userId, 'assistant', crisisMessage, 'crisis', riskLevel);
            await this.saveMessage(session.id.toString(), userId, 'user', dto.content, 'crisis', riskLevel);
            await this.updateSession(session.id, riskLevel);
            subscriber.next({ type: 'complete', data: { sessionId: session.id } });
            subscriber.complete();
            return;
          }

          // Normal flow: analyze mood and save user message
          const moodResult = await this.aiService.analyzeMood(dto.content);
          await this.saveMessage(session.id.toString(), userId, 'user', dto.content, moodResult.mood, riskLevel);

          // Increment counts
          await this.cacheService.incrementWeeklyChatCount(userId);
          await this.cacheService.incrementTotalChatCount(userId);

          // Get history
          const history = await this.getMessages(session.id.toString());
          const historyMessages = history.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }));

          // Send start event
          subscriber.next({ type: 'start', data: { sessionId: session.id, riskLevel } });

          // Stream AI response
          let fullResponse = '';
          const aiStream = this.aiService.generateResponseStream(
            session.id.toString(),
            userId,
            dto.content,
            historyMessages
          );

          aiStream.subscribe({
            next: (chunk: string) => {
              fullResponse += chunk;
              subscriber.next({ type: 'chunk', data: { content: chunk } });
            },
            error: async (err: Error) => {
              this.logger.error(`Stream error: ${err.message}`);
              subscriber.next({ type: 'error', data: { message: 'AI服务暂时不可用' } });
              subscriber.complete();
            },
            complete: async () => {
              // Save complete response
              const responseMood = await this.aiService.analyzeMood(fullResponse);
              await this.saveMessage(
                session.id.toString(),
                userId,
                'assistant',
                fullResponse,
                responseMood.mood,
                0
              );

              await this.updateSession(session.id, riskLevel);

              if (riskLevel === 1) {
                await this.notificationService.notifyHighRiskUser(userId);
                if (this.userNotificationService) {
                  await this.userNotificationService.createNotification(userId, {
                    type: 'risk',
                    title: '情绪关注提醒',
                    content: '我们关注到您最近的情绪状态，如果需要倾诉，我们随时在这里倾听。',
                    referenceType: 'session',
                    referenceId: session.id
                  });
                }
              }

              subscriber.next({ type: 'complete', data: { sessionId: session.id, moodTag: responseMood.mood } });
              subscriber.complete();
            }
          });
        } catch (error) {
          this.logger.error(`sendMessageStream error: ${error.message}`);
          subscriber.next({ type: 'error', data: { message: error.message || '服务器错误' } });
          subscriber.complete();
        }
      })();
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
