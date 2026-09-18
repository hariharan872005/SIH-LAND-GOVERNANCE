"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
    }
    onModuleInit() {
        const host = this.configService.get('REDIS_HOST', 'localhost');
        const port = this.configService.get('REDIS_PORT', 6379);
        const password = this.configService.get('REDIS_PASSWORD', '');
        try {
            this.client = new ioredis_1.default({
                host,
                port,
                password: password || undefined,
                retryStrategy: (times) => {
                    if (times > 3)
                        return null;
                    return Math.min(times * 100, 2000);
                },
                lazyConnect: true,
            });
            this.client.connect().then(() => {
                this.logger.log(`Connected to Redis Cache on ${host}:${port}`);
            }).catch((err) => {
                this.logger.warn(`Redis connection deferred (using memory fallback if offline): ${err.message}`);
            });
        }
        catch (err) {
            this.logger.warn(`Redis initialization warning: ${err.message}`);
        }
    }
    onModuleDestroy() {
        if (this.client) {
            this.client.disconnect();
        }
    }
    async get(key) {
        try {
            if (!this.client || this.client.status !== 'ready')
                return null;
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttlSeconds = 300) {
        try {
            if (!this.client || this.client.status !== 'ready')
                return;
            await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        }
        catch {
        }
    }
    async del(key) {
        try {
            if (!this.client || this.client.status !== 'ready')
                return;
            await this.client.del(key);
        }
        catch {
        }
    }
    async delByPattern(pattern) {
        try {
            if (!this.client || this.client.status !== 'ready')
                return;
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(...keys);
            }
        }
        catch {
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map