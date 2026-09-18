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
exports.IdempotencyRecord = void 0;
const typeorm_1 = require("typeorm");
let IdempotencyRecord = class IdempotencyRecord {
};
exports.IdempotencyRecord = IdempotencyRecord;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 128 }),
    __metadata("design:type", String)
], IdempotencyRecord.prototype, "idempotencyKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], IdempotencyRecord.prototype, "requestPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], IdempotencyRecord.prototype, "responseStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], IdempotencyRecord.prototype, "responseBody", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], IdempotencyRecord.prototype, "createdAt", void 0);
exports.IdempotencyRecord = IdempotencyRecord = __decorate([
    (0, typeorm_1.Entity)('idempotency_records')
], IdempotencyRecord);
//# sourceMappingURL=idempotency-record.entity.js.map