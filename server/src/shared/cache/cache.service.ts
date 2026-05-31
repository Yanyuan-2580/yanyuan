import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'redis';

@Injectable()
export class CacheService {
  private client: Redis.RedisClientType;
  private readonly logger = new Logger(CacheService.name);
  private memoryStorage: Map<string, string> = new Map();

  constructor(private configService: ConfigService) {
    this.connect();
  }

  private async connect() {
    try {
      this.client = Redis.createClient({
        url: `redis://${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}`,
        password: this.configService.get('REDIS_PASSWORD'),
        socket: {
          reconnectStrategy: (retries: number) => {
            if (retries > 3) return new Error('Max retries reached');
            return retries * 1000;
          }
        }
      });
      await this.client.connect();
      this.logger.log('Redis connected successfully');
    } catch (error) {
      this.logger.error(`Redis connection failed: ${error.message}`);
      this.client = null;
    }
  }

  private isConnected(): boolean {
    return this.client !== null;
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected()) {
      try {
        return await this.client.get(key);
      } catch {
        return this.memoryStorage.get(key) || null;
      }
    }
    return this.memoryStorage.get(key) || null;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    this.memoryStorage.set(key, value);
    if (this.isConnected()) {
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
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected()) return;
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error: ${error.message}`);
    }
  }

  async increment(key: string): Promise<number> {
    const currentValue = this.memoryStorage.get(key);
    const newValue = currentValue ? parseInt(currentValue) + 1 : 1;
    this.memoryStorage.set(key, newValue.toString());
    
    if (this.isConnected()) {
      try {
        return await this.client.incr(key);
      } catch {
        return newValue;
      }
    }
    return newValue;
  }

  async decrement(key: string): Promise<number> {
    if (!this.isConnected()) return 0;
    try {
      return await this.client.decr(key);
    } catch {
      return 0;
    }
  }

  private getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }

  async getWeeklyChatCount(userId: number): Promise<number> {
    const weekStart = this.getWeekStart(new Date());
    const key = `chat:count:${userId}:week:${weekStart}`;
    const count = await this.get(key);
    return count ? parseInt(count) : 0;
  }

  async incrementWeeklyChatCount(userId: number): Promise<number> {
    if (!this.isConnected()) return 0;
    const weekStart = this.getWeekStart(new Date());
    const key = `chat:count:${userId}:week:${weekStart}`;
    const count = await this.increment(key);
    try {
      await this.client.expire(key, 7 * 24 * 60 * 60);
    } catch {
      // ignore
    }
    return count;
  }

  async getDailyChatCount(userId: number): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `chat:count:${userId}:${today}`;
    const count = await this.get(key);
    return count ? parseInt(count) : 0;
  }

  async incrementDailyChatCount(userId: number): Promise<number> {
    if (!this.isConnected()) return 0;
    const today = new Date().toISOString().split('T')[0];
    const key = `chat:count:${userId}:${today}`;
    const count = await this.increment(key);
    try {
      await this.client.expire(key, 86400);
    } catch {
      // ignore
    }
    return count;
  }

  async getTotalChatCount(userId: number): Promise<number> {
    const key = `chat:count:${userId}:total`;
    const count = await this.get(key);
    return count ? parseInt(count) : 0;
  }

  async incrementTotalChatCount(userId: number): Promise<number> {
    if (!this.isConnected()) return 0;
    const key = `chat:count:${userId}:total`;
    return await this.increment(key);
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
