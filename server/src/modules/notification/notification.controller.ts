import { Controller, Get, Put, Param, Query, UseGuards } from '@nestjs/common';
import { UserNotificationService } from './notification.service';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common';
import { JwtPayload } from '@/types';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: UserNotificationService) {}

  @Get()
  getNotifications(
    @CurrentUser() user: JwtPayload,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('unreadOnly') unreadOnly?: string
  ) {
    return this.notificationService.getNotifications(
      user.userId,
      parseInt(page),
      parseInt(pageSize),
      unreadOnly === 'true'
    );
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.notificationService.getUnreadCount(user.userId);
  }

  @Put(':id/read')
  markAsRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationService.markAsRead(user.userId, parseInt(id));
  }

  @Put('read-all')
  markAllAsRead(@CurrentUser() user: JwtPayload) {
    return this.notificationService.markAllAsRead(user.userId);
  }
}
