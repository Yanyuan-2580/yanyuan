import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ReminderService } from './reminder.service';
import { UserNotificationService } from '@/modules/notification/notification.service';

@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger(ReminderScheduler.name);

  constructor(
    private reminderService: ReminderService,
    private userNotificationService: UserNotificationService,
  ) {}

  @Cron('*/1 * * * *')
  async handleReminders() {
    try {
      const dueReminders = await this.reminderService.getDueReminders();

      for (const reminder of dueReminders) {
        try {
          // 创建应用内通知
          await this.userNotificationService.createNotification(
            reminder.userId,
            {
              type: 'reminder',
              title: `⏰ ${reminder.title}`,
              content: reminder.description || `该进行「${reminder.title}」了~`,
              referenceType: 'reminder',
              referenceId: reminder.id,
            },
          );

          // 更新最后触发时间
          await this.reminderService.updateLastTriggered(reminder.id);

          this.logger.log(
            `Reminder triggered: userId=${reminder.userId}, type=${reminder.type}, title="${reminder.title}"`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to trigger reminder id=${reminder.id}: ${error.message}`,
          );
        }
      }

      if (dueReminders.length > 0) {
        this.logger.log(`Processed ${dueReminders.length} due reminder(s)`);
      }
    } catch (error) {
      this.logger.error(`Reminder scheduler error: ${error.message}`);
    }
  }
}
