import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import { VideoSession } from '@/database/entities/VideoSession.entity';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    @InjectRepository(VideoSession)
    private videoSessionRepository: Repository<VideoSession>,
    private configService: ConfigService,
  ) {}

  async createRoom(userId: number): Promise<VideoSession> {
    const roomId = `room_${crypto.randomBytes(6).toString('hex')}`;
    const session = this.videoSessionRepository.create({
      userId,
      roomId,
      status: 'waiting',
    });
    return this.videoSessionRepository.save(session);
  }

  async getRoom(roomId: string): Promise<VideoSession> {
    const session = await this.videoSessionRepository.findOne({ where: { roomId } });
    if (!session) throw new NotFoundException('房间不存在');
    return session;
  }

  async joinRoom(userId: number, roomId: string): Promise<VideoSession> {
    const session = await this.getRoom(roomId);
    await this.videoSessionRepository.update(session.id, {
      status: 'active',
      startedAt: new Date(),
    });
    return this.videoSessionRepository.findOne({ where: { id: session.id } }) as Promise<VideoSession>;
  }

  async endRoom(userId: number, roomId: string): Promise<void> {
    const session = await this.getRoom(roomId);
    await this.videoSessionRepository.update(session.id, {
      status: 'ended',
      endedAt: new Date(),
    });
  }

  /**
   * 生成 TRTC UserSig
   * 使用 HMAC-SHA256 签名 + zlib 压缩 + base64 编码
   */
  generateUserSig(userId: string, roomId: string): { userSig: string; sdkAppId: number } {
    const sdkAppId = parseInt(this.configService.get('TRTC_SDK_APP_ID', '0'), 10);
    const secretKey = this.configService.get('TRTC_SECRET_KEY', '');

    if (!sdkAppId || !secretKey) {
      throw new Error('TRTC 未配置 (TRTC_SDK_APP_ID / TRTC_SECRET_KEY)');
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expireTime = currentTime + 86400; // 24小时有效

    // 构造签名内容
    const sigContent = {
      'TLS.ver': '2.0',
      'TLS.identifier': userId,
      'TLS.sdkappid': sdkAppId,
      'TLS.expire': expireTime,
      'TLS.time': currentTime,
    };

    // HMAC-SHA256 签名
    const contentStr = JSON.stringify(sigContent);
    const compressed = zlib.deflateSync(Buffer.from(contentStr, 'utf8'));
    const base64Compressed = compressed.toString('base64');

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(base64Compressed);
    const signature = hmac.digest('base64');

    // 最终 userSig 格式: base64(zlib(JSON)) + ":" + base64(HMAC-SHA256(secretKey, compressed))
    const userSig = `${base64Compressed}:${signature}`;

    this.logger.log(`Generated UserSig for userId=${userId}, roomId=${roomId}`);
    return { userSig, sdkAppId };
  }

  /**
   * 获取 TRTC 进入房间所需的凭证
   */
  async getRoomCredentials(userId: number, roomId: string): Promise<{
    sdkAppId: number;
    userSig: string;
    userId: string;
    roomId: string;
  }> {
    await this.getRoom(roomId); // 验证房间存在
    const userIdStr = `user_${userId}`;
    const { userSig, sdkAppId } = this.generateUserSig(userIdStr, roomId);

    return {
      sdkAppId,
      userSig,
      userId: userIdStr,
      roomId,
    };
  }
}
