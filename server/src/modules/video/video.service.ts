import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { VideoSession } from '@/database/entities/VideoSession.entity';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoSession)
    private videoSessionRepository: Repository<VideoSession>
  ) {}

  async createRoom(userId: number): Promise<VideoSession> {
    const roomId = `room_${crypto.randomBytes(6).toString('hex')}`;
    const session = this.videoSessionRepository.create({
      userId,
      roomId,
      status: 'waiting'
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
      startedAt: new Date()
    });
    return this.videoSessionRepository.findOne({ where: { id: session.id } });
  }

  async endRoom(userId: number, roomId: string): Promise<void> {
    const session = await this.getRoom(roomId);
    await this.videoSessionRepository.update(session.id, {
      status: 'ended',
      endedAt: new Date()
    });
  }
}
