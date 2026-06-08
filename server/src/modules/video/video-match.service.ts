import { Injectable, Logger } from '@nestjs/common';

interface QueueEntry {
  userId: number;
  nickname: string;
  preference: 'text' | 'video' | 'both';
  joinedAt: number;
}

interface TextRoom {
  roomId: string;
  users: number[]; // [userA, userB]
  createdAt: number;
}

@Injectable()
export class VideoMatchService {
  private readonly logger = new Logger(VideoMatchService.name);
  private queue: QueueEntry[] = [];
  private textRooms = new Map<string, TextRoom>();     // roomId → TextRoom
  private userTextRoom = new Map<number, string>();    // userId → roomId

  /** 加入匹配队列，如果配对成功返回配对信息 */
  joinQueue(
    userId: number,
    nickname: string,
    preference: 'text' | 'video' | 'both',
  ): { peerId: number; peerNickname: string; preference: string } | null {
    // 检查是否已在队列
    const existing = this.queue.findIndex(e => e.userId === userId);
    if (existing >= 0) {
      this.queue.splice(existing, 1);
    }

    // 查找可配对的用户（preference 兼容）
    const matchIdx = this.queue.findIndex(e => this.isPreferenceCompatible(e, preference));
    if (matchIdx >= 0) {
      const peer = this.queue.splice(matchIdx, 1)[0];
      const resolvedPreference = this.resolvePreference(peer.preference, preference);
      this.logger.log(`Matched: ${userId}(${preference}) <-> ${peer.userId}(${peer.preference}) → ${resolvedPreference}`);
      return {
        peerId: peer.userId,
        peerNickname: peer.nickname,
        preference: resolvedPreference,
      };
    }

    // 加入队列等待
    this.queue.push({ userId, nickname, preference, joinedAt: Date.now() });
    this.logger.log(`Queue join: userId=${userId} pref=${preference} queueSize=${this.queue.length}`);
    return null;
  }

  /** 退出匹配队列 */
  leaveQueue(userId: number): void {
    this.queue = this.queue.filter(e => e.userId !== userId);
  }

  /** 获取队列大小 */
  getQueueSize(preference?: string): number {
    if (!preference || preference === 'both') return this.queue.length;
    return this.queue.filter(e => e.preference === preference || e.preference === 'both').length;
  }

  /** 创建文字聊天房间 */
  createTextRoom(roomId: string, userA: number, userB: number): void {
    this.textRooms.set(roomId, {
      roomId,
      users: [userA, userB],
      createdAt: Date.now(),
    });
    this.userTextRoom.set(userA, roomId);
    this.userTextRoom.set(userB, roomId);
  }

  /** 获取用户所在文字房间 */
  getTextRoom(userId: number): string | undefined {
    return this.userTextRoom.get(userId);
  }

  /** 获取房间中对方的 userId */
  getPeerId(roomId: string, userId: number): number {
    const room = this.textRooms.get(roomId);
    if (!room) return 0;
    return room.users.find(u => u !== userId) || 0;
  }

  /** 离开文字聊天房间 */
  leaveTextRoom(roomId: string, userId: number): void {
    const room = this.textRooms.get(roomId);
    if (room) {
      room.users = room.users.filter(u => u !== userId);
      if (room.users.length === 0) {
        this.textRooms.delete(roomId);
      }
    }
    this.userTextRoom.delete(userId);
  }

  /** 检查两个 preference 是否兼容 */
  private isPreferenceCompatible(entry: QueueEntry, preference: string): boolean {
    if (entry.userId === 0) return false;
    if (preference === 'both' || entry.preference === 'both') return true;
    return entry.preference === preference;
  }

  /** 解析最终沟通方式（双方都both → text优先，因为无需TRTC） */
  private resolvePreference(a: string, b: string): string {
    if (a === 'text' && b === 'text') return 'text';
    if (a === 'video' && b === 'video') return 'video';
    if (a === 'both' && b === 'both') return 'text';  // both+both → text
    if (a === 'both') return b;
    if (b === 'both') return a;
    return 'text'; // fallback
  }
}
