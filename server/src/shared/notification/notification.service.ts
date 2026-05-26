import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendSms(phone: string, message: string): Promise<void> {
    this.logger.log(`Sending SMS to ${phone}: ${message}`);
  }

  async sendEmail(email: string, subject: string, content: string): Promise<void> {
    this.logger.log(`Sending email to ${email}: ${subject}`);
  }

  async sendSystemAlert(title: string, message: string, level: 'info' | 'warning' | 'critical' = 'info'): Promise<void> {
    this.logger.log(`[${level.toUpperCase()}] ${title}: ${message}`);
  }

  async notifyHighRiskUser(userId: number): Promise<void> {
    this.logger.log(`High risk user detected: ${userId}`);
    await this.sendSystemAlert('高危用户预警', `用户 ${userId} 触发高危内容检测`, 'critical');
  }

  async notifyCrisisIntervention(userId: number): Promise<void> {
    this.logger.log(`Crisis intervention triggered for user: ${userId}`);
    await this.sendSystemAlert('危机干预', `用户 ${userId} 需要紧急人工干预`, 'critical');
  }
}
