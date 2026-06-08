import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect,
  MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VideoMatchService } from './video-match.service';
import { VideoService } from './video.service';
import { TextChatPersistenceService } from './text-chat.service';
import { RiskControlService } from '@/shared';

interface OnlineUser {
  userId: number;
  nickname: string;
  socketId: string;
}

@WebSocketGateway({
  namespace: '/video',
  cors: { origin: '*', credentials: true },
  pingInterval: 25000,
  pingTimeout: 60000,
})
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(VideoGateway.name);
  private onlineUsers = new Map<string, OnlineUser>();     // socketId → OnlineUser
  private userSockets = new Map<number, Set<string>>();    // userId → Set<socketId>
  private matchableUsers = new Set<number>();              // userId 开启了可匹配
  private blockedUsers = new Map<number, Set<number>>();   // userId → 被拉黑的 userId 集合
  private triedUsers = new Map<number, Set<number>>();     // inviter → 已尝试过的用户集合

  constructor(
    private matchService: VideoMatchService,
    private riskControl: RiskControlService,
    private jwtService: JwtService,
    private videoService: VideoService,
    private textChatPersistence: TextChatPersistenceService,
  ) {}

  /** 从 socket 握手信息中提取 JWT token */
  private extractToken(client: Socket): string | undefined {
    const auth = client.handshake.auth?.token || client.handshake.query?.token;
    if (auth && typeof auth === 'string') return auth;
    const header = client.handshake.headers?.authorization;
    if (header?.startsWith('Bearer ')) return header.slice(7);
    return undefined;
  }

  /** 从 token 解析 userId */
  private getUserId(client: Socket): number {
    const u = (client as any).userId;
    if (u) return u;
    const token = this.extractToken(client);
    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        (client as any).userId = payload.userId;
        return payload.userId;
      } catch { /* */ }
    }
    return 0;
  }

  // ========== 生命周期 ==========

  async handleConnection(client: Socket) {
    // 鉴权由 getUserId() 在各消息处理中完成
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.onlineUsers.get(client.id);
    if (user) {
      this.matchService.leaveQueue(user.userId);
      // 清理在线状态（不删除文字聊天室、不删除可匹配状态 — 用户可能只是刷新页面）
      const sockets = this.userSockets.get(user.userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(user.userId);
          this.broadcastOnlineUsers();
          // 保留 matchable 状态：用户可能刷新页面后马上回来
          // matchableUsers 不随着离线而删除
        }
      }
    }
    this.onlineUsers.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ========== 在线管理 ==========

  @SubscribeMessage('online:register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { nickname?: string },
  ) {
    const userId = this.getUserId(client);
    if (!userId) return { error: '请先登录' };
    const nickname = data?.nickname || `用户${userId}`;
    this.onlineUsers.set(client.id, { userId, nickname, socketId: client.id });

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    this.logger.log(`User ${userId} online (socket: ${client.id})`);
    this.broadcastOnlineUsers();
    return { success: true };
  }

  @SubscribeMessage('online:list')
  handleOnlineList(@ConnectedSocket() client: Socket) {
    const users: { userId: number; nickname: string }[] = [];
    const seen = new Set<number>();
    for (const u of this.onlineUsers.values()) {
      if (!seen.has(u.userId)) {
        seen.add(u.userId);
        users.push({ userId: u.userId, nickname: u.nickname });
      }
    }
    // 直接回复给请求方
    client.emit('online:list', users);
    return users;
  }

  private broadcastOnlineUsers() {
    const users: { userId: number; nickname: string }[] = [];
    const seen = new Set<number>();
    for (const u of this.onlineUsers.values()) {
      if (!seen.has(u.userId)) {
        seen.add(u.userId);
        users.push({ userId: u.userId, nickname: u.nickname });
      }
    }
    this.server.emit('user:online', users);
  }

  // ========== 可匹配开关 ==========

  @SubscribeMessage('match:toggle')
  handleMatchToggle(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { enabled: boolean },
  ) {
    const userId = this.getUserId(client);
    if (!userId) return { error: '请先登录' };
    if (data.enabled) {
      this.matchableUsers.add(userId);
    } else {
      this.matchableUsers.delete(userId);
      this.matchService.leaveQueue(userId);
    }
    this.logger.log(`User ${userId} matchable=${data.enabled}`);
    return { matchable: data.enabled };
  }

  @SubscribeMessage('match:status')
  handleMatchStatus(@ConnectedSocket() client: Socket) {
    const userId = this.getUserId(client);
    return { matchable: this.matchableUsers.has(userId) };
  }

  // ========== 拉黑 ==========

  @SubscribeMessage('block:add')
  handleBlock(@ConnectedSocket() client: Socket, @MessageBody() data: { targetId: number }) {
    const userId = this.getUserId(client);
    if (!userId || !data.targetId) return;
    if (!this.blockedUsers.has(userId)) this.blockedUsers.set(userId, new Set());
    this.blockedUsers.get(userId)!.add(data.targetId);
    this.logger.log(`User ${userId} blocked ${data.targetId}`);
    return { blocked: true };
  }

  @SubscribeMessage('block:remove')
  handleUnblock(@ConnectedSocket() client: Socket, @MessageBody() data: { targetId: number }) {
    const userId = this.getUserId(client);
    if (!userId) return;
    this.blockedUsers.get(userId)?.delete(data.targetId);
    return { blocked: false };
  }

  @SubscribeMessage('block:list')
  handleBlockList(@ConnectedSocket() client: Socket) {
    const userId = this.getUserId(client);
    return { blocked: Array.from(this.blockedUsers.get(userId) || []) };
  }

  // ========== 随机匹配 ==========

  @SubscribeMessage('match:join')
  async handleJoinMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { preference?: 'text' | 'video' | 'both' },
  ) {
    const userId = this.getUserId(client);
    if (!userId) return { error: '请先登录' };
    let user = this.onlineUsers.get(client.id);
    if (!user) {
      // 自动注册
      const nickname = `用户${userId}`;
      this.onlineUsers.set(client.id, { userId, nickname, socketId: client.id });
      user = this.onlineUsers.get(client.id)!;
    }

    const preference = data?.preference || 'both';
    const matched = this.matchService.joinQueue(user.userId, user.nickname, preference);

    if (matched) {
      // 匹配成功！通知双方
      const peerSocket = this.getSocketByUserId(matched.peerId);
      const roomId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      if (matched.preference === 'text') {
        // 文字聊天匹配
        this.matchService.createTextRoom(roomId, user.userId, matched.peerId);
        client.emit('match:found', {
          roomId, peerId: matched.peerId, peerNickname: matched.peerNickname,
          mode: 'text',
        });
        if (peerSocket) {
          peerSocket.emit('match:found', {
            roomId, peerId: user.userId, peerNickname: user.nickname,
            mode: 'text',
          });
        }
      } else {
        // 视频匹配 — 创建 TRTC 房间（数据库记录）
        const session = await this.videoService.createRoomForUsers(user.userId, matched.peerId, roomId);
        client.emit('match:found', {
          roomId: session.roomId, peerId: matched.peerId, peerNickname: matched.peerNickname,
          mode: 'video',
        });
        if (peerSocket) {
          peerSocket.emit('match:found', {
            roomId: session.roomId, peerId: user.userId, peerNickname: user.nickname,
            mode: 'video',
          });
        }
      }
      return { matched: true, roomId };
    }

    // 队列中无人匹配 → 尝试邀请可匹配用户
    this.tryInviteNext(client, user.userId, user.nickname, preference);
    return { inviting: true };
  }

  // ========== 被动邀请：尝试邀请下一个可用用户 ==========

  /** 为 inviter 寻找并邀请下一个可匹配用户 */
  private tryInviteNext(client: Socket, inviterId: number, inviterNickname: string, preference: string, skipId?: number) {
    if (!this.triedUsers.has(inviterId)) this.triedUsers.set(inviterId, new Set());
    const tried = this.triedUsers.get(inviterId)!;
    if (skipId) tried.add(skipId);

    const userBlocked = this.blockedUsers.get(inviterId) || new Set();
    const availableUsers = Array.from(this.matchableUsers).filter(
      uid => uid !== inviterId
        && this.userSockets.has(uid)
        && !tried.has(uid)
        && !userBlocked.has(uid)
        && !(this.blockedUsers.get(uid) || new Set()).has(inviterId)
    );

    if (availableUsers.length === 0) {
      // 所有用户都试过了，清理状态
      this.triedUsers.delete(inviterId);
      client.emit('match:noAvailable', { message: '暂无其他可匹配的用户，请稍后再试' });
      return;
    }

    const targetId = availableUsers[Math.floor(Math.random() * availableUsers.length)];
    tried.add(targetId);
    const targetSocket = this.getSocketByUserId(targetId);
    const roomId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    client.emit('match:inviting', { targetId, roomId, preference });
    if (targetSocket) {
      targetSocket.emit('match:invite', {
        fromUserId: inviterId,
        fromNickname: inviterNickname,
        roomId,
        preference,
      });
    }
    this.logger.log(`Match invite: ${inviterId} → ${targetId} (${preference})`);
  }

  // ========== 被动邀请响应 ==========

  @SubscribeMessage('match:inviteAccept')
  handleInviteAccept(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; fromUserId: number; preference: string },
  ) {
    const userId = this.getUserId(client);
    if (!userId) return;
    // 匹配成功，清理尝试记录
    this.triedUsers.delete(data.fromUserId);
    const peerSocket = this.getSocketByUserId(data.fromUserId);

    if (data.preference === 'text') {
      this.matchService.createTextRoom(data.roomId, userId, data.fromUserId);
      client.emit('match:found', { roomId: data.roomId, peerId: data.fromUserId, peerNickname: '倾诉伙伴', mode: 'text' });
      if (peerSocket) peerSocket.emit('match:found', { roomId: data.roomId, peerId: userId, peerNickname: '倾诉伙伴', mode: 'text' });
    } else {
      this.videoService.createRoomForUsers(data.fromUserId, userId, data.roomId).catch(() => {});
      client.emit('match:found', { roomId: data.roomId, peerId: data.fromUserId, peerNickname: '倾诉伙伴', mode: 'video' });
      if (peerSocket) peerSocket.emit('match:found', { roomId: data.roomId, peerId: userId, peerNickname: '倾诉伙伴', mode: 'video' });
    }
  }

  @SubscribeMessage('match:inviteReject')
  handleInviteReject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; fromUserId: number },
  ) {
    const inviterSocket = this.getSocketByUserId(data.fromUserId);
    if (inviterSocket) {
      const inviterNickname = this.onlineUsers.get(inviterSocket.id)?.nickname || '用户';
      // 通知主动方并自动找下一个
      inviterSocket.emit('match:retrying', { message: '对方拒绝，正在寻找下一位...' });
      this.tryInviteNext(inviterSocket, data.fromUserId, inviterNickname, 'text', this.getUserId(client));
    }
  }

  @SubscribeMessage('match:leave')
  handleLeaveMatch(@ConnectedSocket() client: Socket) {
    const userId = this.getUserId(client);
    if (userId) {
      this.matchService.leaveQueue(userId);
      this.triedUsers.delete(userId); // 清理尝试记录
    }
    return { success: true };
  }

  // ========== 文字聊天 ==========

  @SubscribeMessage('text:message')
  async handleTextMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string },
  ) {
    const userId = this.getUserId(client);
    if (!userId) return { error: '请先登录' };
    const user = this.onlineUsers.get(client.id);
    if (!user) return { error: '离线' };

    // 1. 先查内存中的文字房间，没有则查数据库（历史会话场景）
    let room = this.matchService.getTextRoom(user.userId);
    let peerId = room ? this.matchService.getPeerId(data.roomId, userId) : 0;

    if (!room || room !== data.roomId) {
      // 从数据库加载会话
      const dbPeerId = await this.textChatPersistence.getPeerId(data.roomId, userId);
      if (dbPeerId) {
        // 是有效的历史会话，重建内存中的房间
        this.matchService.createTextRoom(data.roomId, userId, dbPeerId);
        room = data.roomId;
        peerId = dbPeerId;
      }
    }

    if (!room || room !== data.roomId) {
      return { error: '房间不存在' };
    }

    // 如果 peerId 还是 0，从 DB 补充
    if (!peerId) {
      peerId = await this.textChatPersistence.getPeerId(data.roomId, userId) || 0;
    }
    if (!peerId) return { error: '找不到对方' };

    // 检查是否被拉黑
    if ((this.blockedUsers.get(userId)?.has(peerId)) || (this.blockedUsers.get(peerId)?.has(userId))) {
      return { error: '无法发送消息' };
    }

    // 风控检查
    if (this.riskControl.hasSensitiveContent(data.content)) {
      client.emit('text:message', {
        content: '⚠️ 消息未发送，请保持友善交流',
        timestamp: Date.now(),
        from: 'system',
      });
      return { error: '敏感内容' };
    }

    const peerSocket = this.getSocketByUserId(peerId);

    // 防刷屏
    const now = Date.now();
    const key = `text:rate:${user.userId}`;
    const recent = (client as any)._msgTimestamps || [];
    recent.push(now);
    (client as any)._msgTimestamps = recent.filter(t => now - t < 1000);
    if (recent.filter(t => now - t < 1000).length > 3) {
      client.emit('text:message', {
        content: '⚠️ 发送太快，请稍候',
        timestamp: now,
        from: 'system',
      });
      return { error: '频率限制' };
    }

    if (peerSocket) {
      peerSocket.emit('text:message', {
        content: data.content,
        timestamp: now,
        from: 'peer',
      });
    }

    // 持久化消息（同时确保会话记录存在）
    this.textChatPersistence.getOrCreateSession(data.roomId, user.userId, peerId).catch(() => {});
    this.textChatPersistence.saveMessage(data.roomId, user.userId, data.content).catch(() => {});

    return { success: true };
  }

  @SubscribeMessage('text:typing')

handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = this.onlineUsers.get(client.id);
    if (!user) return;
    const peerId = this.matchService.getPeerId(data.roomId, user.userId);
    const peerSocket = this.getSocketByUserId(peerId);
    if (peerSocket) {
      peerSocket.emit('text:typing', { roomId: data.roomId });
    }
  }

  @SubscribeMessage('text:leave')

handleTextLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = this.onlineUsers.get(client.id);
    if (!user) return;
    const peerId = this.matchService.getPeerId(data.roomId, user.userId);
    const peerSocket = this.getSocketByUserId(peerId);
    if (peerSocket) {
      peerSocket.emit('text:peerLeft', { roomId: data.roomId });
    }
    this.matchService.leaveTextRoom(data.roomId, user.userId);
    return { success: true };
  }

  @SubscribeMessage('text:upgrade')

handleUpgradeRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = this.onlineUsers.get(client.id);
    if (!user) return;
    const peerId = this.matchService.getPeerId(data.roomId, user.userId);
    const peerSocket = this.getSocketByUserId(peerId);
    if (peerSocket) {
      peerSocket.emit('text:upgradeRequest', {
        roomId: data.roomId,
        fromUserId: user.userId,
        fromNickname: user.nickname,
      });
    }
    return { success: true };
  }

  @SubscribeMessage('text:upgradeAccept')

handleUpgradeAccept(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    // 创建新的 TRTC 房间用于视频
    const videoRoomId = `upgrade_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const user = this.onlineUsers.get(client.id);
    if (!user) return;
    const peerId = this.matchService.getPeerId(data.roomId, user.userId);
    // 创建数据库房间记录
    this.videoService.createRoomForUsers(user.userId, peerId, videoRoomId).catch(() => {});
    const peerSocket = this.getSocketByUserId(peerId);

    client.emit('match:found', {
      roomId: videoRoomId, peerId, peerNickname: '倾诉伙伴',
      mode: 'video',
    });
    if (peerSocket) {
      peerSocket.emit('match:found', {
        roomId: videoRoomId, peerId: user.userId, peerNickname: user.nickname,
        mode: 'video',
      });
    }
    return { roomId: videoRoomId };
  }

  @SubscribeMessage('text:upgradeReject')

handleUpgradeReject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = this.getUserId(client);
    const peerId = this.matchService.getPeerId(data.roomId, userId);
    const peerSocket = this.getSocketByUserId(peerId);
    if (peerSocket) {
      peerSocket.emit('text:upgradeRejected', { roomId: data.roomId });
    }
    return { success: true };
  }

  // ========== 请求模式 ==========

  @SubscribeMessage('call:request')

handleCallRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { toUserId: number },
  ) {
    const user = this.onlineUsers.get(client.id);
    if (!user) return { error: '离线' };
    if (user.userId === data.toUserId) return { error: '不能呼叫自己' };

    const peerSocket = this.getSocketByUserId(data.toUserId);
    if (!peerSocket) return { error: '对方不在线' };

    peerSocket.emit('call:incoming', {
      fromUserId: user.userId,
      fromNickname: user.nickname,
      requestId: `${user.userId}_${data.toUserId}_${Date.now()}`,
    });
    return { success: true };
  }

  @SubscribeMessage('call:accept')

handleCallAccept(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string; fromUserId: number },
  ) {
    const user = this.onlineUsers.get(client.id);
    if (!user) return;
    const roomId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    // 创建数据库房间记录
    this.videoService.createRoomForUsers(data.fromUserId, user.userId, roomId).catch(() => {});
    const peerSocket = this.getSocketByUserId(data.fromUserId);

    client.emit('call:accepted', { roomId, peerId: data.fromUserId });
    if (peerSocket) {
      peerSocket.emit('call:accepted', { roomId, peerId: user.userId });
    }
    return { roomId };
  }

  @SubscribeMessage('call:reject')

handleCallReject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string; fromUserId: number },
  ) {
    const peerSocket = this.getSocketByUserId(data.fromUserId);
    if (peerSocket) {
      peerSocket.emit('call:rejected', { requestId: data.requestId });
    }
    return { success: true };
  }

  @SubscribeMessage('call:hangup')

handleHangup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; peerId: number },
  ) {
    const peerSocket = this.getSocketByUserId(data.peerId);
    if (peerSocket) {
      peerSocket.emit('call:peerHungUp', { roomId: data.roomId });
    }
    return { success: true };
  }

  // ========== 辅助方法 ==========

  private getSocketByUserId(userId: number): Socket | undefined {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds || socketIds.size === 0) return undefined;
    // 从 server 的所有连接中查找该用户的 socket
    for (const [id, socket] of (this.server.sockets as any) as Map<string, Socket>) {
      if (socketIds.has(id)) return socket;
    }
    return undefined;
  }
}
