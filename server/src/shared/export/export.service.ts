import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, MoodDiary, MoodRecord, AiSession, MeditationHistory } from '@/database/entities';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(MoodDiary)
    private diaryRepository: Repository<MoodDiary>,
    @InjectRepository(MoodRecord)
    private moodRecordRepository: Repository<MoodRecord>,
    @InjectRepository(AiSession)
    private sessionRepository: Repository<AiSession>,
    @InjectRepository(MeditationHistory)
    private meditationHistoryRepository: Repository<MeditationHistory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async exportUserReport(userId: number): Promise<any> {
    const [diaries, moodRecords, sessions, meditationHistory] = await Promise.all([
      this.diaryRepository.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 30 }),
      this.moodRecordRepository.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 30 }),
      this.sessionRepository.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 30 }),
      this.meditationHistoryRepository.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 30 }),
    ]);

    const avgMoodScore = diaries.length > 0
      ? (diaries.reduce((sum, d) => sum + d.moodScore, 0) / diaries.length).toFixed(1)
      : '0';

    const totalSessions = sessions.length;
    const totalMeditationMinutes = meditationHistory
      .reduce((sum, h) => sum + h.duration, 0);

    const moodDistribution: Record<string, number> = {};
    diaries.forEach(d => {
      const tag = d.moodTags?.[0] || '未标签';
      moodDistribution[tag] = (moodDistribution[tag] || 0) + 1;
    });

    return {
      generatedAt: new Date().toISOString(),
      period: '近30天',
      summary: {
        totalDiaries: diaries.length,
        avgMoodScore: parseFloat(avgMoodScore),
        totalChatSessions: totalSessions,
        totalMeditationMinutes,
        moodDistribution,
      },
      diaries: diaries.map(d => ({
        date: d.createdAt,
        moodScore: d.moodScore,
        moodTags: d.moodTags,
        content: d.content?.substring(0, 200),
        aiInsight: d.aiInsight,
      })),
      moodRecords: moodRecords.map(m => ({
        date: m.createdAt,
        moodType: m.moodType,
        moodScore: m.moodScore,
        suggestion: m.aiSuggestion,
      })),
      sessions: sessions.map(s => ({
        date: s.createdAt,
        title: s.title,
        messageCount: s.messageCount,
        moodTag: s.moodTag,
      })),
      meditation: meditationHistory.map(m => ({
        date: m.createdAt,
        duration: m.duration,
        completed: m.completed,
      })),
    };
  }

  /**
   * 管理端数据导出
   * 支持类型: users / diaries / mood-records / sessions / statistics
   */
  async exportAdminData(
    type: string,
    params?: { startDate?: string; endDate?: string; page?: number; pageSize?: number },
  ): Promise<any> {
    switch (type) {
      case 'users': {
        const users = await this.userRepository.find({
          select: ['id', 'username', 'nickname', 'phone', 'email', 'status', 'riskLevel', 'createdAt'],
          order: { createdAt: 'DESC' },
          take: 5000,
        });
        return {
          exportType: 'users',
          generatedAt: new Date().toISOString(),
          total: users.length,
          data: users,
        };
      }
      case 'diaries': {
        const diaries = await this.diaryRepository.find({
          order: { createdAt: 'DESC' },
          take: 5000,
          relations: ['user'],
        });
        return {
          exportType: 'diaries',
          generatedAt: new Date().toISOString(),
          total: diaries.length,
          data: diaries.map(d => ({
            id: d.id,
            userId: d.userId,
            username: (d as any).user?.username,
            moodScore: d.moodScore,
            moodTags: d.moodTags,
            content: d.content?.substring(0, 500),
            isPublic: d.isPublic,
            createdAt: d.createdAt,
          })),
        };
      }
      case 'mood-records': {
        const records = await this.moodRecordRepository.find({
          order: { createdAt: 'DESC' },
          take: 5000,
        });
        return {
          exportType: 'mood-records',
          generatedAt: new Date().toISOString(),
          total: records.length,
          data: records,
        };
      }
      case 'sessions': {
        const sessions = await this.sessionRepository.find({
          order: { createdAt: 'DESC' },
          take: 5000,
        });
        return {
          exportType: 'sessions',
          generatedAt: new Date().toISOString(),
          total: sessions.length,
          data: sessions.map(s => ({
            id: s.id,
            userId: s.userId,
            title: s.title,
            messageCount: s.messageCount,
            riskFlag: s.riskFlag,
            moodTag: s.moodTag,
            createdAt: s.createdAt,
          })),
        };
      }
      case 'statistics': {
        const [userCount, diaryCount, sessionCount] = await Promise.all([
          this.userRepository.count(),
          this.diaryRepository.count(),
          this.sessionRepository.count(),
        ]);
        return {
          exportType: 'statistics',
          generatedAt: new Date().toISOString(),
          data: {
            totalUsers: userCount,
            totalDiaries: diaryCount,
            totalSessions: sessionCount,
          },
        };
      }
      default:
        return { message: '导出类型不支持，可用类型: users / diaries / mood-records / sessions / statistics' };
    }
  }
}
