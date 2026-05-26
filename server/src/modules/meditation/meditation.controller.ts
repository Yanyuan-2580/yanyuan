import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { MeditationService } from './meditation.service';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('meditation')
export class MeditationController {
  constructor(private meditationService: MeditationService) {}

  @Get()
  getAllMeditations(@Query('category') category?: string) {
    if (category) {
      return this.meditationService.getMeditationsByCategory(category);
    }
    return this.meditationService.getAllMeditations();
  }

  @Get(':id')
  getMeditationById(@Param('id') id: number) {
    return this.meditationService.getMeditationById(id);
  }

  @Post('record')
  @UseGuards(JwtAuthGuard)
  recordMeditation(
    @CurrentUser('id') userId: number,
    @Body() body: { meditationId: number; duration: number }
  ) {
    return this.meditationService.recordMeditation(userId, body.meditationId, body.duration);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  getMeditationHistory(
    @CurrentUser('id') userId: number,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ) {
    return this.meditationService.getMeditationHistory(userId, page, pageSize);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getMeditationStats(@CurrentUser('id') userId: number) {
    return this.meditationService.getMeditationStats(userId);
  }
}