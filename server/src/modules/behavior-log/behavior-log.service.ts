import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserBehaviorLogDocument } from '@/database/schemas';

@Injectable()
export class BehaviorLogService {
  private readonly logger = new Logger(BehaviorLogService.name);

  constructor(
    @InjectModel('UserBehaviorLog')
    private behaviorLogModel: Model<UserBehaviorLogDocument>,
  ) {}

  async log(data: {
    userId: number;
    eventType: string;
    page: string;
    duration?: number;
    extra?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.behaviorLogModel.create({
        userId: data.userId,
        eventType: data.eventType,
        page: data.page,
        duration: data.duration || 0,
        extra: data.extra || {},
      });
    } catch (error) {
      this.logger.warn(`Failed to log behavior: ${error.message}`);
    }
  }

  async getPageViewStats(days: number = 7): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const results = await this.behaviorLogModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$page', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    return results.map((r) => ({ page: r._id, count: r.count }));
  }

  async getDailyActiveUsers(days: number = 7): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const results = await this.behaviorLogModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            userId: '$userId',
          },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          activeUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return results.map((r) => ({ date: r._id, activeUsers: r.activeUsers }));
  }

  async getEventDistribution(days: number = 7): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const results = await this.behaviorLogModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return results.map((r) => ({ eventType: r._id, count: r.count }));
  }

  async getOverview(): Promise<any> {
    const [pageViews, dailyActive, eventDist] = await Promise.all([
      this.getPageViewStats(7),
      this.getDailyActiveUsers(7),
      this.getEventDistribution(7),
    ]);

    return {
      pageViews,
      dailyActiveUsers: dailyActive,
      eventDistribution: eventDist,
    };
  }
}
