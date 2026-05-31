import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { InjectConnection as InjectMongoConnection } from '@nestjs/mongoose';
import { Connection as MongoConnection } from 'mongoose';
import { createClient } from 'redis';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    @InjectConnection()
    private mysqlConnection: Connection,
    @InjectMongoConnection()
    private mongoConnection: MongoConnection | null,
  ) {}

  async check() {
    const [mysql, mongo, redis] = await Promise.all([
      this.checkMySQL(),
      this.checkMongoDB(),
      this.checkRedis(),
    ]);

    const allUp = mysql && mongo && redis;

    return {
      status: allUp ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services: {
        mysql,
        mongodb: mongo,
        redis,
      },
    };
  }

  private async checkMySQL(): Promise<boolean> {
    try {
      await this.mysqlConnection.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.warn(`MySQL health check failed: ${error.message}`);
      return false;
    }
  }

  private async checkMongoDB(): Promise<boolean> {
    try {
      if (!this.mongoConnection) {
        return false;
      }
      return this.mongoConnection.readyState === 1;
    } catch (error) {
      this.logger.warn(`MongoDB health check failed: ${error.message}`);
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const client = createClient({ url: redisUrl });
      await client.connect();
      const result = await client.ping();
      await client.disconnect();
      return result === 'PONG';
    } catch (error) {
      this.logger.warn(`Redis health check failed: ${error.message}`);
      return false;
    }
  }
}
