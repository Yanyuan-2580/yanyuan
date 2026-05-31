import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'redis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private client: Redis.RedisClientType | null = null;
  private readonly logger = new Logger(CacheService.name);
  private memoryStorage: Map<string, { value: string; expiresAt: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private configService: ConfigService) {
    this.connect();
    // 每5分钟清理过期内存缓存
    this.cleanupInterval = setInterval(() => this.cleanExpired(), 5 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.client) {
      this.client.disconnect().catch(() => {});
    }
  }

  private async connect() {
    try {
      this.client = Redis.createClient({
        url: `redis://${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}`,
        password: this.configService.get('REDIS_PASSWORD') || undefined,
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
    return this.client !== null && this.client.isOpen;
  }

  private cleanExpired() {
    const now = Date.now();
    for (const [key, entry] of this.memoryStorage) {
      if (entry.expiresAt > 0 && entry.expiresAt < now) {
        this.memoryStorage.delete(key);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected()) {
      try {
        return await this.client!.get(key);
      } catch {
        const entry = this.memoryStorage.get(key);
        return entry ? entry.value : null;
      }
    }
    const entry = this.memoryStorage.get(key);
    if (!entry) return null;
    if (entry.expiresAt > 0 && entry.expiresAt < Date.now()) {
      this.memoryStorage.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    // Memory: store with optional TTL
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0;
    this.memoryStorage.set(key, { value, expiresAt });

    // Redis: primary storage
    if (this.isConnected()) {
      try {
        if (ttlSeconds) {
          await this.client!.setEx(key, ttlSeconds, value);
        } else {
          await this.client!.set(key, value);
        }
      } catch (error) {
        this.logger.error(`Cache set error: ${error.message}`);
      }
    }
  }

  async del(key: string): Promise<void> {
    this.memoryStorage.delete(key);
    if (!this.isConnected()) return;
    try {
      await this.client!.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error: ${error.message}`);
    }
  }

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    if (this.isConnected()) {
      try {
        // Redis为主，先递增Redis再同步内存
        const newValue = await this.client!.incr(key);
        if (ttlSeconds) {
          await this.client!.expire(key, ttlSeconds).catch(() => {});
        }
        // 同步到内存（仅作缓存）
        this.memoryStorage.set(key, { value: newValue.toString(), expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0 });
        return newValue;
      } catch (error) {
        this.logger.warn(`Redis increment failed for ${key}, falling back to memory`);
      }
    }
    // Redis不可用，使用内存
    const entry = this.memoryStorage.get(key);
    const currentValue = entry ? parseInt(entry.value) : 0;
    const newValue = currentValue + 1;
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0;
    this.memoryStorage.set(key, { value: newValue.toString(), expiresAt });
    return newValue;
  }

  async decrement(key: string): Promise<number> {
    if (this.isConnected()) {
      try {
        const newValue = await this.client!.decr(key);
        this.memoryStorage.set(key, { value: newValue.toString(), expiresAt: 0 });
        return newValue;
      } catch {
        return 0;
      }
    }
    const entry = this.memoryStorage.get(key);
    const currentValue = entry ? parseInt(entry.value) : 0;
    const newValue = Math.max(0, currentValue - 1);
    this.memoryStorage.set(key, { value: newValue.toString(), expiresAt: 0 });
    return newValue;
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
    const weekStart = this.getWeekStart(new Date());
    const key = `chat:count:${userId}:week:${weekStart}`;
    return this.increment(key, 7 * 24 * 60 * 60);
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
    return this.increment(key, 86400);
  }

  async getTotalChatCount(userId: number): Promise<number> {
    const key = `chat:count:${userId}:total`;
    const count = await this.get(key);
    return count ? parseInt(count) : 0;
  }

  async incrementTotalChatCount(userId: number): Promise<number> {
    const key = `chat:count:${userId}:total`;
    return this.increment(key);
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

  // 风险历史持久化（Redis List）
  async pushRiskRecord(userId: number, record: any): Promise<void> {
    const key = `risk:history:${userId}`;
    const json = JSON.stringify(record);
    if (this.isConnected()) {
      try {
        await this.client!.lPush(key, json);
        await this.client!.lTrim(key, 0, 9); // 保留最近10条
        await this.client!.expire(key, 30 * 24 * 60 * 60); // 30天过期
      } catch {
        // Redis不可用，内存降级
        const entry = this.memoryStorage.get(key);
        const list: any[] = entry ? JSON.parse(entry.value) : [];
        list.unshift(record);
        this.memoryStorage.set(key, { value: JSON.stringify(list.slice(0, 10)), expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });
      }
    } else {
      const entry = this.memoryStorage.get(key);
      const list: any[] = entry ? JSON.parse(entry.value) : [];
      list.unshift(record);
      this.memoryStorage.set(key, { value: JSON.stringify(list.slice(0, 10)), expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });
    }
  }

  async getRiskHistory(userId: number): Promise<any[]> {
    const key = `risk:history:${userId}`;
    if (this.isConnected()) {
      try {
        const items = await this.client!.lRange(key, 0, -1);
        return items.map(item => JSON.parse(item));
      } catch {
        // fallback to memory
      }
    }
    const entry = this.memoryStorage.get(key);
    return entry ? JSON.parse(entry.value) : [];
  }
}
