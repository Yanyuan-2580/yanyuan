import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReminderService } from './reminder.service';
import { UserNotificationService } from '@/modules/notification/notification.service';
import { NotificationService } from '@/shared/notification/notification.service';
import { User } from '@/database/entities/User.entity';

@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger(ReminderScheduler.name);

  constructor(
    private reminderService: ReminderService,
    private userNotificationService: UserNotificationService,
    private notificationService: NotificationService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

          // 推送短信/邮件外发提醒
          await this.pushExternalReminder(reminder);

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

  /**
   * 推送外发提醒（短信/邮件）
   * 根据用户绑定的联系方式，将提醒推送到手机或邮箱
   */
  private async pushExternalReminder(reminder: any): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: reminder.userId },
        select: ['id', 'phone', 'email', 'nickname'],
      });

      if (!user) return;

      const message = `【心理健康助手】⏰ ${reminder.title} — ${
        reminder.description || '该进行记录啦，保持好习惯哦~'
      }`;

      // 短信推送
      if (user.phone) {
        await this.notificationService.sendSms(user.phone, message);
      }

      // 邮件推送
      if (user.email) {
        const htmlContent = `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #6C9BD2;">⏰ 提醒通知</h2>
            <p style="font-size: 16px;">Hi ${user.nickname || '用户'}，</p>
            <p style="font-size: 16px;">${reminder.description || `该进行「${reminder.title}」了~`}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px;">此邮件由心理健康助手自动发送，如不需要可在App中关闭提醒。</p>
          </div>
        `;
        await this.notificationService.sendEmail(
          user.email,
          `⏰ ${reminder.title} — 心理健康助手`,
          htmlContent,
        );
      }
    } catch (error) {
      // 外发推送失败不影响主流程
      this.logger.warn(
        `External reminder push failed for userId=${reminder.userId}: ${error.message}`,
      );
    }
  }
}
