import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { MeditationService } from './meditation.service';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtPayload } from '@/types';

@Controller('meditation')
export class MeditationController {
  constructor(private meditationService: MeditationService) {}

  // 静态路由必须在 :id 之前

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getMeditationStats(@CurrentUser() user: JwtPayload) {
    return this.meditationService.getMeditationStats(user.userId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  getMeditationHistory(
    @CurrentUser() user: JwtPayload,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ) {
    return this.meditationService.getMeditationHistory(user.userId, page, pageSize);
  }

  @Post('record')
  @UseGuards(JwtAuthGuard)
  recordMeditation(
    @CurrentUser() user: JwtPayload,
    @Body() body: { meditationId: number; duration: number }
  ) {
    return this.meditationService.recordMeditation(user.userId, body.meditationId, body.duration);
  }

  @Get()
  getAllMeditations(@Query('category') category?: string) {
    if (category) {
      return this.meditationService.getMeditationsByCategory(category);
    }
    return this.meditationService.getAllMeditations();
  }

  // 动态路由放在最后
  @Get(':id')
  getMeditationById(@Param('id') id: string) {
    return this.meditationService.getMeditationById(parseInt(id));
  }
}
