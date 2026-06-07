import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

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
  private smtpTransporter: Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initProviders();
  }

  private initProviders(): void {
    const smsProviderType = this.configService.get('SMS_PROVIDER', 'log');

    if (smsProviderType === 'aliyun') {
      this.initAliyunSms();
    } else if (smsProviderType === 'tencent') {
      this.initTencentSms();
    }

    const emailProviderType = this.configService.get('EMAIL_PROVIDER', 'log');
    if (emailProviderType === 'smtp') {
      this.initSmtpEmail();
    }
  }

  /**
   * 初始化阿里云短信服务
   * 使用 @alicloud/sms-sdk 或 @alicloud/pop-core 发送短信
   */
  private initAliyunSms(): void {
    const accessKeyId = this.configService.get('ALIYUN_ACCESS_KEY_ID', '');
    const accessKeySecret = this.configService.get('ALIYUN_ACCESS_KEY_SECRET', '');
    const signName = this.configService.get('ALIYUN_SMS_SIGN_NAME', '');
    const templateCode = this.configService.get('ALIYUN_SMS_TEMPLATE_CODE', '');

    if (!accessKeyId || !accessKeySecret) {
      this.logger.warn('阿里云短信配置不完整，降级为日志模式');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const SMSClient = require('@alicloud/sms-sdk');
      const client = new SMSClient({ accessKeyId, secretAccessKey: accessKeySecret });

      this.smsProvider = {
        send: async (phone: string, message: string) => {
          await client.sendSMS({
            PhoneNumbers: phone,
            SignName: signName,
            TemplateCode: templateCode,
            TemplateParam: JSON.stringify({ code: message }),
          });
          this.logger.log(`[Aliyun SMS] 发送成功 -> ${phone}`);
        },
      };
      this.logger.log('阿里云短信服务初始化成功');
    } catch (error) {
      this.logger.error(`阿里云短信初始化失败: ${error.message}，降级为日志模式`);
    }
  }

  /**
   * 初始化腾讯云短信服务
   * 使用 tencentcloud-sdk-nodejs 的 sms 模块发送短信
   */
  private initTencentSms(): void {
    const secretId = this.configService.get('TENCENT_SMS_SECRET_ID', '');
    const secretKey = this.configService.get('TENCENT_SMS_SECRET_KEY', '');
    const appId = this.configService.get('TENCENT_SMS_APP_ID', '');
    const signName = this.configService.get('TENCENT_SMS_SIGN_NAME', '');
    const templateId = this.configService.get('TENCENT_SMS_TEMPLATE_ID', '');

    if (!secretId || !secretKey || !appId) {
      this.logger.warn('腾讯云短信配置不完整，降级为日志模式');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const tencentcloud = require('tencentcloud-sdk-nodejs');
      const SmsClient = tencentcloud.sms.v20210111.Client;

      const client = new SmsClient({
        credential: {
          secretId,
          secretKey,
        },
        region: 'ap-guangzhou',
        profile: {
          httpProfile: {
            endpoint: 'sms.tencentcloudapi.com',
          },
        },
      });

      this.smsProvider = {
        send: async (phone: string, message: string) => {
          // 腾讯云短信需要 E.164 格式：+86 前缀
          const formattedPhone = phone.startsWith('+') ? phone : `+86${phone}`;
          await client.SendSms({
            SmsSdkAppId: appId,
            SignName: signName,
            TemplateId: templateId,
            TemplateParamSet: [message],
            PhoneNumberSet: [formattedPhone],
          });
          this.logger.log(`[Tencent SMS] 发送成功 -> ${phone}`);
        },
      };
      this.logger.log('腾讯云短信服务初始化成功');
    } catch (error) {
      this.logger.error(`腾讯云短信初始化失败: ${error.message}，降级为日志模式`);
    }
  }

  /**
   * 初始化 SMTP 邮件服务
   * 使用 nodemailer 创建可复用的 transporter 连接池
   */
  private initSmtpEmail(): void {
    const host = this.configService.get('SMTP_HOST', '');
    const port = parseInt(this.configService.get('SMTP_PORT', '587'), 10);
    const user = this.configService.get('SMTP_USER', '');
    const pass = this.configService.get('SMTP_PASS', '');
    const fromName = this.configService.get('SMTP_FROM_NAME', '心理健康助手');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP邮件配置不完整，降级为日志模式');
      return;
    }

    try {
      this.smtpTransporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      this.emailProvider = {
        send: async (email: string, subject: string, content: string) => {
          await this.smtpTransporter!.sendMail({
            from: `"${fromName}" <${user}>`,
            to: email,
            subject,
            html: content,
          });
          this.logger.log(`[SMTP Email] 发送成功 -> ${email}: ${subject}`);
        },
      };
      this.logger.log('SMTP邮件服务初始化成功');
    } catch (error) {
      this.logger.error(`SMTP邮件初始化失败: ${error.message}，降级为日志模式`);
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
