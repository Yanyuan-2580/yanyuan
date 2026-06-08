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

  async getDailyActiveUsers(days: number = 7): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const results = await this.behaviorLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
          page: { $not: /^\/api\/v1\/admin/ },
        },
      },
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
      {
        $match: {
          createdAt: { $gte: since },
          page: { $not: /^\/api\/v1\/admin/ },
        },
      },
      // 按模块归一化：合并同一资源下的子路径
      {
        $addFields: {
          normalizedPage: {
            $switch: {
              branches: [
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/video/ } }, then: '/api/v1/video' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/chat/ } }, then: '/api/v1/chat' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/diary|^\/api\/v1\/diaries/ } }, then: '/api/v1/diaries' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/users/ } }, then: '/api/v1/users' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/mood/ } }, then: '/api/v1/mood' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/meditation/ } }, then: '/api/v1/meditation' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/articles/ } }, then: '/api/v1/articles' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/questionnaires/ } }, then: '/api/v1/questionnaires' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/notifications/ } }, then: '/api/v1/notifications' },
              ],
              default: '$page',
            },
          },
        },
      },
      {
        $group: {
          _id: '$normalizedPage',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return results.map((r) => ({
      eventType: r._id,
      count: r.count,
      uniqueUsers: r.uniqueUsers.length,
    }));
  }

  // 同样更新 page-views 查询
  async getPageViewStats(days: number = 7): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const results = await this.behaviorLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
          page: { $not: /^\/api\/v1\/admin/ },
        },
      },
      // 归一化路径
      {
        $addFields: {
          normalizedPage: {
            $switch: {
              branches: [
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/video/ } }, then: '/api/v1/video' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/chat/ } }, then: '/api/v1/chat' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/diary|^\/api\/v1\/diaries/ } }, then: '/api/v1/diaries' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/users/ } }, then: '/api/v1/users' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/mood/ } }, then: '/api/v1/mood' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/meditation/ } }, then: '/api/v1/meditation' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/articles/ } }, then: '/api/v1/articles' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/questionnaires/ } }, then: '/api/v1/questionnaires' },
                { case: { $regexMatch: { input: '$page', regex: /^\/api\/v1\/notifications/ } }, then: '/api/v1/notifications' },
              ],
              default: '$page',
            },
          },
        },
      },
      { $group: { _id: '$normalizedPage', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    return results.map((r) => ({ page: r._id, count: r.count }));
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
