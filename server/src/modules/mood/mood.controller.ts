import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { MoodService } from './mood.service';
import { AiService } from '@/shared/ai/ai.service';
import { RecordMoodDto } from './dto/record-mood.dto';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('mood')
@UseGuards(JwtAuthGuard)
export class MoodController {
  constructor(
    private moodService: MoodService,
    private aiService: AiService,
  ) {}

  @Post('record')
  recordMood(@CurrentUser('id') userId: number, @Body() dto: RecordMoodDto) {
    return this.moodService.recordMood(userId, dto);
  }

  @Get('history')
  getMoodHistory(
    @CurrentUser('id') userId: number,
    @Query('period') period: 'week' | 'month' | 'year' = 'week',
  ) {
    return this.moodService.getMoodHistory(userId, period);
  }

  @Get('stats')
  getMoodStats(@CurrentUser('id') userId: number) {
    return this.moodService.getMoodStats(userId);
  }

  @Get('weekly-report')
  async getWeeklyReport(@CurrentUser('id') userId: number) {
    const weekData = await this.moodService.getWeeklyData(userId);
    return this.aiService.generateWeeklyReport(userId, weekData);
  }

  @Get('daily-greeting')
  async getDailyGreeting(
    @CurrentUser('id') userId: number,
    @Query('nickname') nickname?: string,
  ) {
    const recentMood = await this.moodService.getRecentMood(userId);
    return {
      greeting: this.aiService.generateDailyGreeting(nickname || '朋友', recentMood),
    };
  }

  @Get('recommendations')
  async getRecommendations(@CurrentUser('id') userId: number) {
    const moodHistory = await this.moodService.getRecentMoodHistory(userId, 14);
    return this.aiService.generatePersonalizedRecommendations(moodHistory);
  }
}