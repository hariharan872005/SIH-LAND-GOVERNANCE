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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const typeorm_1 = require("typeorm");
let HealthController = class HealthController {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    health() {
        return {
            status: 'UP',
            timestamp: new Date().toISOString(),
            service: 'India-wide GIS Land Governance Backend (NestJS)',
            version: '1.0.0',
        };
    }
    live() {
        return { status: 'OK', uptime: process.uptime() };
    }
    async ready() {
        let dbConnected = false;
        try {
            await this.dataSource.query('SELECT 1');
            dbConnected = true;
        }
        catch {
            dbConnected = false;
        }
        return {
            status: dbConnected ? 'UP' : 'DEGRADED',
            database: dbConnected ? 'CONNECTED' : 'DISCONNECTED',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, permissions_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'General health check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "health", null);
__decorate([
    (0, permissions_decorator_1.Public)(),
    (0, common_1.Get)('live'),
    (0, swagger_1.ApiOperation)({ summary: 'Kubernetes Liveness probe' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "live", null);
__decorate([
    (0, permissions_decorator_1.Public)(),
    (0, common_1.Get)('ready'),
    (0, swagger_1.ApiOperation)({ summary: 'Kubernetes Readiness probe (Validates Database & Dependencies)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "ready", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('System Health & Readiness'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], HealthController);
//# sourceMappingURL=health.controller.js.map