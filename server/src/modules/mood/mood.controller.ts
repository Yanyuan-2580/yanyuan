import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { MoodService } from './mood.service';
import { AiService } from '@/shared/ai/ai.service';
import { RecordMoodDto } from './dto/record-mood.dto';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtPayload } from '@/types';

@Controller('mood')
@UseGuards(JwtAuthGuard)
export class MoodController {
  constructor(
    private moodService: MoodService,
    private aiService: AiService,
  ) {}

  @Post('record')
  recordMood(@CurrentUser() user: JwtPayload, @Body() dto: RecordMoodDto) {
    return this.moodService.recordMood(user.userId, dto);
  }

  @Get('history')
  getMoodHistory(
    @CurrentUser() user: JwtPayload,
    @Query('period') period: 'week' | 'month' | 'year' = 'week',
  ) {
    return this.moodService.getMoodHistory(user.userId, period);
  }

  @Get('stats')
  getMoodStats(@CurrentUser() user: JwtPayload) {
    return this.moodService.getMoodStats(user.userId);
  }

  @Get('weekly-report')
  async getWeeklyReport(@CurrentUser() user: JwtPayload) {
    const weekData = await this.moodService.getWeeklyData(user.userId);
    return this.aiService.generateWeeklyReport(user.userId, weekData);
  }

  @Get('daily-greeting')
  async getDailyGreeting(
    @CurrentUser() user: JwtPayload,
    @Query('nickname') nickname?: string,
  ) {
    const recentMood = await this.moodService.getRecentMood(user.userId);
    return {
      greeting: this.aiService.generateDailyGreeting(nickname || '朋友', recentMood),
    };
  }

  @Get('recommendations')
  async getRecommendations(@CurrentUser() user: JwtPayload) {
    const moodHistory = await this.moodService.getRecentMoodHistory(user.userId, 14);
    return this.aiService.generatePersonalizedRecommendations(moodHistory);
  }
}