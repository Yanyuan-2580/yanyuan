import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { MoodRecord } from '@/database/entities';
import { RecordMoodDto } from './dto/record-mood.dto';
import { AiService } from '@/shared';

@Injectable()
export class MoodService {
  constructor(
    @InjectRepository(MoodRecord)
    private moodRecordRepository: Repository<MoodRecord>,
    private aiService: AiService
  ) {}

  async recordMood(userId: number, dto: RecordMoodDto) {
    const record = this.moodRecordRepository.create({
      userId,
      moodScore: dto.moodScore,
      moodType: dto.moodType,
      reason: dto.reason
    });
    
    const savedRecord = await this.moodRecordRepository.save(record);
    
    if (dto.reason) {
      savedRecord.aiSuggestion = await this.aiService.generateMoodSuggestion(dto.moodType, dto.reason);
      await this.moodRecordRepository.save(savedRecord);
    }
    
    return savedRecord;
  }

  async getMoodHistory(userId: number, period: 'week' | 'month' | 'year') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    return this.moodRecordRepository.find({
      where: { userId, createdAt: MoreThanOrEqual(startDate) },
      order: { createdAt: 'DESC' }
    });
  }

  async getMoodStats(userId: number) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const records = await this.moodRecordRepository.find({
      where: { userId, createdAt: MoreThanOrEqual(weekAgo) },
      select: ['moodScore', 'moodType']
    });

    const total = records.length;
    const avgScore = total > 0
      ? records.reduce((sum, r) => sum + r.moodScore, 0) / total
      : 0;

    const moodDistribution: Record<string, number> = {};
    records.forEach(r => {
      moodDistribution[r.moodType] = (moodDistribution[r.moodType] || 0) + 1;
    });

    return {
      total,
      avgScore: avgScore.toFixed(2),
      moodDistribution,
      trend: this.calculateTrend(records)
    };
  }

  private calculateTrend(records: { moodScore: number; createdAt: Date }[]) {
    if (records.length < 2) return 'stable';
    
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const firstWeek = sortedRecords.slice(0, Math.floor(sortedRecords.length / 2));
    const lastWeek = sortedRecords.slice(Math.floor(sortedRecords.length / 2));
    
    const firstAvg = firstWeek.reduce((sum, r) => sum + r.moodScore, 0) / firstWeek.length;
    const lastAvg = lastWeek.reduce((sum, r) => sum + r.moodScore, 0) / lastWeek.length;
    
    if (lastAvg > firstAvg + 0.5) return 'up';
    if (lastAvg < firstAvg - 0.5) return 'down';
    return 'stable';
  }
}