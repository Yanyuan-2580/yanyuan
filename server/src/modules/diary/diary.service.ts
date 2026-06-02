import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { MoodDiary } from '@/database/entities';
import { DiaryStatus } from '@/types';
import { AiService } from '@/shared';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(MoodDiary)
    private moodDiaryRepository: Repository<MoodDiary>,
    private aiService: AiService
  ) {}

  async create(userId: number, dto: CreateDiaryDto): Promise<MoodDiary> {
    const diary = this.moodDiaryRepository.create({
      userId,
      ...dto,
      isPublic: dto.isPublic ? dto.isPublic as DiaryStatus : 0
    });

    if (dto.content) {
      diary.aiInsight = await this.aiService.generateDiaryInsight(dto.content);
    }

    return this.moodDiaryRepository.save(diary);
  }

  async findAll(userId: number, page: number, pageSize: number): Promise<{ list: MoodDiary[]; total: number }> {
    const [list, total] = await this.moodDiaryRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
    return { list, total };
  }

  async findOne(userId: number, id: number): Promise<MoodDiary> {
    const diary = await this.moodDiaryRepository.findOne({ where: { id, userId } });
    if (!diary) {
      throw new NotFoundException('日记不存在');
    }
    return diary;
  }

  async update(userId: number, id: number, dto: UpdateDiaryDto): Promise<MoodDiary> {
    const diary = await this.findOne(userId, id);
    
    if (dto.content && dto.content !== diary.content) {
      diary.aiInsight = await this.aiService.generateDiaryInsight(dto.content);
    }

    Object.assign(diary, dto);
    await this.moodDiaryRepository.save(diary);
    return this.findOne(userId, id);
  }

  async remove(userId: number, id: number): Promise<void> {
    const diary = await this.findOne(userId, id);
    await this.moodDiaryRepository.delete(id);
  }

  async getStats(userId: number, period: 'week' | 'month' | 'year' | 'all'): Promise<any> {
    const now = new Date();
    let startDate: Date | null = null;

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
      case 'all':
      default:
        // No date filter for 'all' - return all diaries
        break;
    }

    const whereCondition: any = { userId };
    if (startDate) {
      whereCondition.createdAt = MoreThanOrEqual(startDate);
    }

    const diaries = await this.moodDiaryRepository.find({
      where: whereCondition,
      select: ['moodScore', 'createdAt']
    });

    const total = diaries.length;
    const avgScore = total > 0 
      ? diaries.reduce((sum, d) => sum + d.moodScore, 0) / total 
      : 0;

    const scoreDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    diaries.forEach(d => {
      scoreDistribution[d.moodScore]++;
    });

    return {
      total,
      avgScore: avgScore.toFixed(2),
      scoreDistribution,
      period
    };
  }
}
