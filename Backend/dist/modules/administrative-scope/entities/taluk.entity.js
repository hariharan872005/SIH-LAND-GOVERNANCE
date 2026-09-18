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
exports.Taluk = void 0;
const typeorm_1 = require("typeorm");
const district_entity_1 = require("./district.entity");
const village_entity_1 = require("./village.entity");
let Taluk = class Taluk {
};
exports.Taluk = Taluk;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 64 }),
    __metadata("design:type", String)
], Taluk.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], Taluk.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Taluk.prototype, "districtId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => district_entity_1.District, (district) => district.taluks, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'districtId' }),
    __metadata("design:type", district_entity_1.District)
], Taluk.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => village_entity_1.Village, (village) => village.taluk),
    __metadata("design:type", Array)
], Taluk.prototype, "villages", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Taluk.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Taluk.prototype, "updatedAt", void 0);
exports.Taluk = Taluk = __decorate([
    (0, typeorm_1.Entity)('taluks')
], Taluk);
//# sourceMappingURL=taluk.entity.js.map