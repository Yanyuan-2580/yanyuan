import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'redis';

@Injectable()
export class CacheService {
  private client: Redis.RedisClientType;
  private readonly logger = new Logger(CacheService.name);

  constructor(private configService: ConfigService) {
    this.connect();
  }

  private async connect() {
    try {
      this.client = Redis.createClient({
        url: `redis://${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}`,
        password: this.configService.get('REDIS_PASSWORD')
      });
      await this.client.connect();
      this.logger.log('Redis connected successfully');
    } catch (error) {
      this.logger.error(`Redis connection failed: ${error.message}`);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Cache set error: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error: ${error.message}`);
    }
  }

  async increment(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch {
      return 0;
    }
  }

  async decrement(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch {
      return 0;
    }
  }

  async getDailyChatCount(userId: number): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `chat:count:${userId}:${today}`;
    const count = await this.get(key);
    return count ? parseInt(count) : 0;
  }

  async incrementDailyChatCount(userId: number): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `chat:count:${userId}:${today}`;
    const count = await this.increment(key);
    await this.client.expire(key, 86400);
    return count;
  }

  async setUserToken(userId: number, token: string): Promise<void> {
    await this.set(`token:${userId}`, token, 7 * 24 * 60 * 60);
  }

  async getUserToken(userId: number): Promise<string | null> {
    return await this.get(`token:${userId}`);
  }

  async deleteUserToken(userId: number): Promise<void> {
    await this.del(`token:${userId}`);
  }
}
