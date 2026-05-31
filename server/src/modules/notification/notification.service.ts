import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@/database/entities';

@Injectable()
export class UserNotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>
  ) {}

  async createNotification(
    userId: number,
    data: { type: string; title: string; content: string; referenceType?: string; referenceId?: number }
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type: data.type,
      title: data.title,
      content: data.content,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      isRead: false
    });
    return this.notificationRepository.save(notification);
  }

  async getNotifications(
    userId: number,
    page: number = 1,
    pageSize: number = 20,
    unreadOnly?: boolean
  ): Promise<{ list: Notification[]; total: number }> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (unreadOnly) {
      query.andWhere('notification.isRead = 0');
    }

    const [list, total] = await query
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async markAsRead(userId: number, notificationId: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId }
    });
    if (!notification) {
      throw new NotFoundException('通知不存在');
    }
    await this.notificationRepository.update(notificationId, { isRead: true });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true }
    );
  }

  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { userId, isRead: false }
    });
    return { count };
  }
}
