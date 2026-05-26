import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common';
import { JwtPayload } from '@/types';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';

@Controller('diaries')
export class DiaryController {
  constructor(private diaryService: DiaryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDiaryDto) {
    return this.diaryService.create(user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20'
  ) {
    return this.diaryService.findAll(user.userId, parseInt(page), parseInt(pageSize));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.diaryService.findOne(user.userId, parseInt(id));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateDiaryDto) {
    return this.diaryService.update(user.userId, parseInt(id), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.diaryService.remove(user.userId, parseInt(id));
  }

  @Get('stats/:period')
  @UseGuards(JwtAuthGuard)
  getStats(@CurrentUser() user: JwtPayload, @Param('period') period: 'week' | 'month' | 'year') {
    return this.diaryService.getStats(user.userId, period);
  }
}
