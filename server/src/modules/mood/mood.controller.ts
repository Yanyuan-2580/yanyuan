import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { MoodService } from './mood.service';
import { RecordMoodDto } from './dto/record-mood.dto';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('mood')
@UseGuards(JwtAuthGuard)
export class MoodController {
  constructor(private moodService: MoodService) {}

  @Post('record')
  recordMood(@CurrentUser('id') userId: number, @Body() dto: RecordMoodDto) {
    return this.moodService.recordMood(userId, dto);
  }

  @Get('history')
  getMoodHistory(
    @CurrentUser('id') userId: number,
    @Query('period') period: 'week' | 'month' | 'year' = 'week'
  ) {
    return this.moodService.getMoodHistory(userId, period);
  }

  @Get('stats')
  getMoodStats(@CurrentUser('id') userId: number) {
    return this.moodService.getMoodStats(userId);
  }
}