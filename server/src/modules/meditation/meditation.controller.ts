import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { MeditationService } from './meditation.service';
import { JwtAuthGuard, RolesGuard, Roles } from '@/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtPayload } from '@/types';

@Controller('meditation')
export class MeditationController {
  constructor(private meditationService: MeditationService) {}

  // ========== 用户端 ==========

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
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.meditationService.getMeditationHistory(user.userId, page, pageSize);
  }

  @Post('record')
  @UseGuards(JwtAuthGuard)
  recordMeditation(
    @CurrentUser() user: JwtPayload,
    @Body() body: { meditationId: number; duration: number },
  ) {
    return this.meditationService.recordMeditation(user.userId, body.meditationId, body.duration);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAllMeditationsAdmin() {
    return this.meditationService.getAllMeditationsAdmin();
  }

  @Get()
  getAllMeditations(@Query('category') category?: string) {
    if (category) {
      return this.meditationService.getMeditationsByCategory(category);
    }
    return this.meditationService.getAllMeditations();
  }

  @Get(':id')
  getMeditationById(@Param('id') id: string) {
    return this.meditationService.getMeditationById(parseInt(id));
  }

  // ========== 管理端（复用同一路由，通过角色守卫区分）==========

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createMeditation(@Body() body) {
    return this.meditationService.createMeditation(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateMeditation(@Param('id') id: string, @Body() body) {
    return this.meditationService.updateMeditation(parseInt(id), body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deleteMeditation(@Param('id') id: string) {
    return this.meditationService.deleteMeditation(parseInt(id));
  }
}
