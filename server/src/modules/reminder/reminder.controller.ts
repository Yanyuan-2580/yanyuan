import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common';
import { JwtPayload } from '@/types';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class ReminderController {
  constructor(private reminderService: ReminderService) {}

  @Get()
  getReminders(@CurrentUser() user: JwtPayload) {
    return this.reminderService.getReminders(user.userId);
  }

  @Post()
  createReminder(@CurrentUser() user: JwtPayload, @Body() body: {
    type: string; title: string; description?: string;
    time: string; daysOfWeek?: number[];
  }) {
    return this.reminderService.createReminder(user.userId, body);
  }

  @Put(':id')
  updateReminder(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: any) {
    return this.reminderService.updateReminder(user.userId, parseInt(id), body);
  }

  @Delete(':id')
  deleteReminder(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.reminderService.deleteReminder(user.userId, parseInt(id));
  }
}
