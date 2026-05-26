import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meditation, MeditationHistory } from '@/database/entities';

@Injectable()
export class MeditationService {
  constructor(
    @InjectRepository(Meditation)
    private meditationRepository: Repository<Meditation>,
    @InjectRepository(MeditationHistory)
    private meditationHistoryRepository: Repository<MeditationHistory>
  ) {}

  async getAllMeditations() {
    return this.meditationRepository.find({
      where: { status: 1 },
      order: { category: 'ASC', duration: 'ASC' }
    });
  }

  async getMeditationById(id: number) {
    const meditation = await this.meditationRepository.findOne({ where: { id, status: 1 } });
    if (!meditation) {
      throw new NotFoundException('冥想课程不存在');
    }
    return meditation;
  }

  async getMeditationsByCategory(category: string) {
    return this.meditationRepository.find({
      where: { status: 1, category },
      order: { duration: 'ASC' }
    });
  }

  async recordMeditation(userId: number, meditationId: number, duration: number) {
    const meditation = await this.getMeditationById(meditationId);
    
    const history = this.meditationHistoryRepository.create({
      userId,
      meditationId,
      duration,
      completed: duration >= meditation.duration * 0.8
    });
    
    return this.meditationHistoryRepository.save(history);
  }

  async getMeditationHistory(userId: number, page: number, pageSize: number) {
    const [list, total] = await this.meditationHistoryRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['meditation']
    });
    
    return { list, total };
  }

  async getMeditationStats(userId: number) {
    const history = await this.meditationHistoryRepository.find({
      where: { userId },
      select: ['duration', 'completed', 'createdAt']
    });

    const totalDuration = history.reduce((sum, h) => sum + h.duration, 0);
    const completedCount = history.filter(h => h.completed).length;
    const totalSessions = history.length;

    return {
      totalDuration,
      completedCount,
      totalSessions,
      avgDuration: totalSessions > 0 ? (totalDuration / totalSessions).toFixed(2) : '0'
    };
  }
}