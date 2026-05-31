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
    private meditationHistoryRepository: Repository<MeditationHistory>
  ) {}

  async exportUserReport(userId: number): Promise<any> {
    const [diaries, moodRecords, sessions, meditationHistory] = await Promise.all([
      this.diaryRepository.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 30 }),
      this.moodRecordRepository.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 30 }),
      this.sessionRepository.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 30 }),
      this.meditationHistoryRepository.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 30 })
    ]);

    // Calculate stats
    const avgMoodScore = diaries.length > 0
      ? (diaries.reduce((sum, d) => sum + d.moodScore, 0) / diaries.length).toFixed(1)
      : '0';

    const totalSessions = sessions.length;
    const totalMeditationMinutes = meditationHistory
      .reduce((sum, h) => sum + h.duration, 0);

    // Mood distribution
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
        moodDistribution
      },
      diaries: diaries.map(d => ({
        date: d.createdAt,
        moodScore: d.moodScore,
        moodTags: d.moodTags,
        content: d.content?.substring(0, 200),
        aiInsight: d.aiInsight
      })),
      moodRecords: moodRecords.map(m => ({
        date: m.createdAt,
        moodType: m.moodType,
        moodScore: m.moodScore,
        suggestion: m.aiSuggestion
      })),
      sessions: sessions.map(s => ({
        date: s.createdAt,
        title: s.title,
        messageCount: s.messageCount,
        moodTag: s.moodTag
      })),
      meditation: meditationHistory.map(m => ({
        date: m.createdAt,
        duration: m.duration,
        completed: m.completed
      }))
    };
  }

  async exportAdminData(type: string): Promise<any> {
    switch (type) {
      case 'stats': {
        return { exportType: 'statistics', generatedAt: new Date().toISOString() };
      }
      default:
        return { message: '导出类型不支持' };
    }
  }
}
