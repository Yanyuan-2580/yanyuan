import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { MoodRecord, MoodDiary, AiSession } from '@/database/entities';
import { RecordMoodDto } from './dto/record-mood.dto';
import { AiService } from '@/shared';

@Injectable()
export class MoodService {
  constructor(
    @InjectRepository(MoodRecord)
    private moodRecordRepository: Repository<MoodRecord>,
    @InjectRepository(MoodDiary)
    private diaryRepository: Repository<MoodDiary>,
    @InjectRepository(AiSession)
    private sessionRepository: Repository<AiSession>,
    private aiService: AiService,
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
      select: ['moodScore', 'moodType', 'createdAt'],
      order: { createdAt: 'ASC' }
    });

    const recordCount = records.length;
    const total = new Set(records.map(r => {
      const d = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
      return d.toDateString();
    })).size;
    const avgScore = recordCount > 0
      ? records.reduce((sum, r) => sum + r.moodScore, 0) / recordCount
      : 0;

    const moodDistribution: Record<string, number> = {};
    const scoreDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    records.forEach(r => {
      moodDistribution[r.moodType] = (moodDistribution[r.moodType] || 0) + 1;
      if (scoreDistribution[r.moodScore] !== undefined) {
        scoreDistribution[r.moodScore]++;
      }
    });

    return {
      total,
      avgScore: avgScore.toFixed(2),
      moodDistribution,
      scoreDistribution,
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

  // ========== AI 增强辅助方法 ==========

  async getWeeklyData(userId: number) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [moodRecords, diaries, sessions] = await Promise.all([
      this.moodRecordRepository.find({
        where: { userId, createdAt: MoreThanOrEqual(weekAgo) },
        order: { createdAt: 'DESC' },
      }),
      this.diaryRepository.find({
        where: { userId, createdAt: MoreThanOrEqual(weekAgo) },
        select: ['moodScore', 'moodTags', 'content'],
      }),
      this.sessionRepository.find({
        where: { userId, createdAt: MoreThanOrEqual(weekAgo) },
        select: ['title', 'messageCount'],
      }),
    ]);

    return { moodRecords, diaries, sessions };
  }

  async getRecentMood(userId: number): Promise<string | undefined> {
    const recent = await this.moodRecordRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
      select: ['moodType'],
    });
    return recent?.moodType;
  }

  async getRecentMoodHistory(
    userId: number,
    days: number = 14,
  ): Promise<Array<{ moodType: string }>> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.moodRecordRepository.find({
      where: { userId, createdAt: MoreThanOrEqual(since) },
      select: ['moodType'],
      order: { createdAt: 'DESC' },
    });
  }
}