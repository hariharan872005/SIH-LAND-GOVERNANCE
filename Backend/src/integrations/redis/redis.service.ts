import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD', '');

    try {
      this.client = new Redis({
        host,
        port,
        password: password || undefined,
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 100, 2000);
        },
        lazyConnect: true,
      });

      this.client.connect().then(() => {
        this.logger.log(`Connected to Redis Cache on ${host}:${port}`);
      }).catch((err) => {
        this.logger.warn(`Redis connection deferred (using memory fallback if offline): ${err.message}`);
      });
    } catch (err) {
      this.logger.warn(`Redis initialization warning: ${err.message}`);
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.client || this.client.status !== 'ready') return null;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      if (!this.client || this.client.status !== 'ready') return;
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Non-blocking caching
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.client || this.client.status !== 'ready') return;
      await this.client.del(key);
    } catch {
      // Non-blocking
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      if (!this.client || this.client.status !== 'ready') return;
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch {
      // Non-blocking
    }
  }
}
