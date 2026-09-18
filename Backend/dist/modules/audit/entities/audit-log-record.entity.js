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
exports.AuditLogRecord = void 0;
const typeorm_1 = require("typeorm");
let AuditLogRecord = class AuditLogRecord {
};
exports.AuditLogRecord = AuditLogRecord;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 64 }),
    __metadata("design:type", String)
], AuditLogRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AuditLogRecord.prototype, "actorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], AuditLogRecord.prototype, "actorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], AuditLogRecord.prototype, "actorRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AuditLogRecord.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AuditLogRecord.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AuditLogRecord.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditLogRecord.prototype, "previousValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditLogRecord.prototype, "newValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    __metadata("design:type", String)
], AuditLogRecord.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], AuditLogRecord.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    __metadata("design:type", String)
], AuditLogRecord.prototype, "requestId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 16, default: 'SUCCESS' }),
    __metadata("design:type", String)
], AuditLogRecord.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], AuditLogRecord.prototype, "timestamp", void 0);
exports.AuditLogRecord = AuditLogRecord = __decorate([
    (0, typeorm_1.Entity)('audit_logs')
], AuditLogRecord);
//# sourceMappingURL=audit-log-record.entity.js.map