import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SmsProvider {
  send(phone: string, message: string): Promise<void>;
}

export interface EmailProvider {
  send(email: string, subject: string, content: string): Promise<void>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private smsProvider: SmsProvider | null = null;
  private emailProvider: EmailProvider | null = null;

  constructor(private configService: ConfigService) {
    this.initProviders();
  }

  private initProviders(): void {
    // 初始化短信服务商（可根据配置切换）
    const smsProviderType = this.configService.get('SMS_PROVIDER', 'log');

    if (smsProviderType === 'aliyun') {
      // 阿里云短信服务
      this.smsProvider = {
        send: async (phone: string, message: string) => {
          this.logger.log(`[Aliyun SMS] Sending to ${phone}: ${message}`);
          // TODO: 集成阿里云短信SDK
          // const Client = require('@alicloud/sms-sdk');
          // const client = new Client({ accessKeyId, secretAccessKey });
          // await client.sendSMS({ PhoneNumbers: phone, SignName, TemplateCode, TemplateParam });
        }
      };
    } else if (smsProviderType === 'tencent') {
      // 腾讯云短信服务
      this.smsProvider = {
        send: async (phone: string, message: string) => {
          this.logger.log(`[Tencent SMS] Sending to ${phone}: ${message}`);
          // TODO: 集成腾讯云短信SDK
        }
      };
    }

    const emailProviderType = this.configService.get('EMAIL_PROVIDER', 'log');
    if (emailProviderType === 'smtp') {
      this.emailProvider = {
        send: async (email: string, subject: string, content: string) => {
          this.logger.log(`[SMTP Email] Sending to ${email}: ${subject}`);
          // TODO: 集成 nodemailer SMTP 发送
        }
      };
    }
  }

  async sendSms(phone: string, message: string): Promise<void> {
    if (this.smsProvider) {
      try {
        await this.smsProvider.send(phone, message);
      } catch (error) {
        this.logger.error(`SMS send failed: ${error.message}`);
        // 降级：记录日志
        this.logger.log(`[SMS Fallback] To: ${phone}, Message: ${message}`);
      }
    } else {
      this.logger.log(`[SMS Log] To: ${phone}, Message: ${message}`);
    }
  }

  async sendEmail(email: string, subject: string, content: string): Promise<void> {
    if (this.emailProvider) {
      try {
        await this.emailProvider.send(email, subject, content);
      } catch (error) {
        this.logger.error(`Email send failed: ${error.message}`);
        this.logger.log(`[Email Fallback] To: ${email}, Subject: ${subject}`);
      }
    } else {
      this.logger.log(`[Email Log] To: ${email}, Subject: ${subject}`);
    }
  }

  async sendSystemAlert(title: string, message: string, level: 'info' | 'warning' | 'critical' = 'info'): Promise<void> {
    this.logger.log(`[${level.toUpperCase()}] ${title}: ${message}`);

    // 高危告警时尝试发送短信通知管理员
    if (level === 'critical') {
      const adminPhone = this.configService.get('ADMIN_ALERT_PHONE');
      if (adminPhone) {
        await this.sendSms(adminPhone, `[紧急] ${title}: ${message}`);
      }
      const adminEmail = this.configService.get('ADMIN_ALERT_EMAIL');
      if (adminEmail) {
        await this.sendEmail(adminEmail, `[紧急] ${title}`, message);
      }
    }
  }

  async notifyHighRiskUser(userId: number): Promise<void> {
    this.logger.log(`High risk user detected: ${userId}`);
    await this.sendSystemAlert('高危用户预警', `用户 ${userId} 触发高危内容检测，请及时关注`, 'critical');
  }

  async notifyCrisisIntervention(userId: number): Promise<void> {
    this.logger.log(`Crisis intervention triggered for user: ${userId}`);
    await this.sendSystemAlert('危机干预', `用户 ${userId} 需要紧急人工干预`, 'critical');
  }

  /**
   * 发送验证码（具体实现取决于短信服务商）
   */
  async sendVerificationCode(phone: string, code: string): Promise<void> {
    const message = `【心理健康助手】您的验证码是：${code}，5分钟内有效。请勿将验证码透露给他人。`;
    await this.sendSms(phone, message);
  }

  /**
   * 发送密码重置验证码
   */
  async sendPasswordResetCode(phone: string, code: string): Promise<void> {
    const message = `【心理健康助手】您正在重置密码，验证码：${code}，5分钟内有效。如非本人操作，请忽略此短信。`;
    await this.sendSms(phone, message);
  }

  /**
   * 发送情绪提醒
   */
  async sendMoodReminder(phone: string, nickname: string): Promise<void> {
    const message = `【心理健康助手】嗨${nickname}，今天的你心情怎么样？记得来记录一下你的情绪哦~`;
    await this.sendSms(phone, message);
  }

  /**
   * 发送高危用户关怀消息
   */
  async sendCareMessage(phone: string): Promise<void> {
    const message = `【心理健康助手】我们关心你的状态，如果你需要倾诉，请拨打全国心理援助热线：400-161-9995。我们一直在你身边。`;
    await this.sendSms(phone, message);
  }
}
