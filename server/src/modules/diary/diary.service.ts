import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { MoodDiary } from '@/database/entities';
import { DiaryStatus } from '@/types';
import { AiService, RiskControlService } from '@/shared';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';

@Injectable()
export class DiaryService {
  private readonly logger = new Logger(DiaryService.name);

  constructor(
    @InjectRepository(MoodDiary)
    private moodDiaryRepository: Repository<MoodDiary>,
    private aiService: AiService,
    private riskControlService: RiskControlService,
  ) {}

  async create(userId: number, dto: CreateDiaryDto): Promise<MoodDiary> {
    // 风险分析（优化5 — 日记接入风控）
    if (dto.content) {
      const riskLevel = this.riskControlService.analyzeRisk(dto.content);

      if (riskLevel > 0) {
        this.logger.warn(`日记风险检测: userId=${userId}, level=${riskLevel}`);

        await this.riskControlService.saveRiskRecord({
          userId,
          content: dto.content.slice(0, 500),
          riskLevel,
          source: 'diary',
          action: riskLevel === 2 ? 'crisis_blocked' : 'warned',
        });

        await this.riskControlService.trackRisk(userId, riskLevel, dto.content);
      }
    }

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

    const diaryCount = diaries.length;
    const total = new Set(diaries.map(d => {
      const date = d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt);
      return date.toDateString();
    })).size;
    const avgScore = diaryCount > 0
      ? diaries.reduce((sum, d) => sum + d.moodScore, 0) / diaryCount
      : 0;

    const scoreDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    diaries.forEach(d => {
      scoreDistribution[d.moodScore]++;
    });

    return {
      total,
      avgScore: avgScore.toFixed(2),
      scoreDistribution,
      period,
    };
  }

  /**
   * 获取公开日记（社区广场）
   * 只返回 isPublic=1 的日记，作者信息脱敏
   */
  async getPublicDiaries(
    page: number = 1,
    pageSize: number = 20,
    tag?: string,
  ): Promise<{ list: any[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const [list, total] = await this.moodDiaryRepository.findAndCount({
      where: { isPublic: 1 },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 作者信息脱敏
    const safeList = list.map((diary) => {
      const user = (diary as any).user;
      return {
        id: diary.id,
        moodScore: diary.moodScore,
        moodTags: diary.moodTags,
        content: diary.content?.substring(0, 500),
        aiInsight: diary.aiInsight?.substring(0, 200),
        author: user
          ? { id: user.id, nickname: user.nickname?.charAt(0) + '***', avatarUrl: user.avatarUrl }
          : null,
        createdAt: diary.createdAt,
      };
    });

    return { list: safeList, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
