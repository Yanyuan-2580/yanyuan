import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BehaviorLogService } from './behavior-log.service';
import { JwtAuthGuard, RolesGuard, Roles } from '@/common';

@Controller('admin/behavior')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class BehaviorLogController {
  constructor(private behaviorLogService: BehaviorLogService) {}

  @Get('overview')
  getOverview() {
    return this.behaviorLogService.getOverview();
  }

  @Get('page-views')
  getPageViews(@Query('days') days: string = '7') {
    return this.behaviorLogService.getPageViewStats(parseInt(days));
  }

  @Get('daily-active')
  getDailyActive(@Query('days') days: string = '7') {
    return this.behaviorLogService.getDailyActiveUsers(parseInt(days));
  }

  @Get('event-distribution')
  getEventDistribution(@Query('days') days: string = '7') {
    return this.behaviorLogService.getEventDistribution(parseInt(days));
  }
}
