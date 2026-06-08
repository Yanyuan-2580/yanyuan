import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextChatSession, TextChatMessage } from '@/database/entities';

@Injectable()
export class TextChatPersistenceService {
  constructor(
    @InjectRepository(TextChatSession)
    private sessionRepo: Repository<TextChatSession>,
    @InjectRepository(TextChatMessage)
    private messageRepo: Repository<TextChatMessage>,
  ) {}

  /** 创建或获取聊天会话 */
  async getOrCreateSession(roomId: string, userAId: number, userBId: number): Promise<TextChatSession> {
    let session = await this.sessionRepo.findOne({ where: { roomId } });
    if (!session) {
      session = this.sessionRepo.create({ roomId, userAId, userBId });
      await this.sessionRepo.save(session);
    }
    return session;
  }

  /** 保存一条消息 */
  async saveMessage(roomId: string, senderId: number, content: string): Promise<TextChatMessage> {
    const msg = this.messageRepo.create({ roomId, senderId, content });
    await this.messageRepo.save(msg);

    // 更新会话计数和最后消息
    await this.sessionRepo.update({ roomId }, {
      messageCount: () => 'messageCount + 1',
      lastMessage: content.slice(0, 200),
    });

    return msg;
  }

  /** 获取聊天消息历史 */
  async getMessages(roomId: string, userId: number, page = 1, pageSize = 50): Promise<{ list: TextChatMessage[]; total: number }> {
    // 验证用户属于此会话
    const session = await this.sessionRepo.findOne({ where: { roomId } });
    if (!session || (session.userAId !== userId && session.userBId !== userId)) {
      return { list: [], total: 0 };
    }

    const [list, total] = await this.messageRepo.findAndCount({
      where: { roomId },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total };
  }

  /** 获取用户的所有聊天会话列表（含对方信息） */
  async getMySessions(userId: number): Promise<any[]> {
    const sessions = await this.sessionRepo.find({
      where: [
        { userAId: userId },
        { userBId: userId },
      ],
      order: { updatedAt: 'DESC' },
      take: 50,
    });

    return sessions.map(s => ({
      roomId: s.roomId,
      peerId: s.userAId === userId ? s.userBId : s.userAId,
      lastMessage: s.lastMessage,
      messageCount: s.messageCount,
      status: s.status,
      updatedAt: s.updatedAt,
    }));
  }

  /** 获取对方的 userId */
  getPeerId(roomId: string, userId: number): Promise<number | null> {
    return this.sessionRepo.findOne({ where: { roomId } }).then(s => {
      if (!s) return null;
      return s.userAId === userId ? s.userBId : s.userAId;
    });
  }

  /** 结束会话 */
  async endSession(roomId: string): Promise<void> {
    await this.sessionRepo.update({ roomId }, { status: 'ended' });
  }

  /** 删除会话及所有消息 */
  async deleteSession(roomId: string, userId: number): Promise<{ success: boolean }> {
    const session = await this.sessionRepo.findOne({ where: { roomId } });
    if (!session || (session.userAId !== userId && session.userBId !== userId)) {
      return { success: false };
    }
    await this.messageRepo.delete({ roomId });
    await this.sessionRepo.delete({ roomId });
    return { success: true };
  }
}
