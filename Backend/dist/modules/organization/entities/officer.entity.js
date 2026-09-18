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
exports.Officer = void 0;
const typeorm_1 = require("typeorm");
const status_enum_1 = require("../../../common/constants/status.enum");
const department_entity_1 = require("./department.entity");
const designation_entity_1 = require("./designation.entity");
const role_entity_1 = require("./role.entity");
const state_entity_1 = require("../../administrative-scope/entities/state.entity");
const district_entity_1 = require("../../administrative-scope/entities/district.entity");
const taluk_entity_1 = require("../../administrative-scope/entities/taluk.entity");
const village_entity_1 = require("../../administrative-scope/entities/village.entity");
let Officer = class Officer {
};
exports.Officer = Officer;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 64 }),
    __metadata("design:type", String)
], Officer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, unique: true }),
    __metadata("design:type", String)
], Officer.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], Officer.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128, unique: true }),
    __metadata("design:type", String)
], Officer.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Officer.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 24, nullable: true }),
    __metadata("design:type", String)
], Officer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Officer.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department, (dept) => dept.officers),
    (0, typeorm_1.JoinColumn)({ name: 'departmentId' }),
    __metadata("design:type", department_entity_1.Department)
], Officer.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Officer.prototype, "designationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => designation_entity_1.Designation, (desig) => desig.officers),
    (0, typeorm_1.JoinColumn)({ name: 'designationId' }),
    __metadata("design:type", designation_entity_1.Designation)
], Officer.prototype, "designation", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Officer.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, (role) => role.officers),
    (0, typeorm_1.JoinColumn)({ name: 'roleId' }),
    __metadata("design:type", role_entity_1.Role)
], Officer.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Officer.prototype, "stateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => state_entity_1.State, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'stateId' }),
    __metadata("design:type", state_entity_1.State)
], Officer.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Officer.prototype, "districtId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => district_entity_1.District, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'districtId' }),
    __metadata("design:type", district_entity_1.District)
], Officer.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Officer.prototype, "talukId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taluk_entity_1.Taluk, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'talukId' }),
    __metadata("design:type", taluk_entity_1.Taluk)
], Officer.prototype, "taluk", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Officer.prototype, "villageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => village_entity_1.Village, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'villageId' }),
    __metadata("design:type", village_entity_1.Village)
], Officer.prototype, "village", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: status_enum_1.OfficerStatus, default: status_enum_1.OfficerStatus.ACTIVE }),
    __metadata("design:type", String)
], Officer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Officer.prototype, "lastLoginAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Officer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Officer.prototype, "updatedAt", void 0);
exports.Officer = Officer = __decorate([
    (0, typeorm_1.Entity)('officers')
], Officer);
//# sourceMappingURL=officer.entity.js.map