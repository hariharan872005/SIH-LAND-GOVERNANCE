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
exports.District = void 0;
const typeorm_1 = require("typeorm");
const state_entity_1 = require("./state.entity");
const taluk_entity_1 = require("./taluk.entity");
let District = class District {
};
exports.District = District;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 64 }),
    __metadata("design:type", String)
], District.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], District.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], District.prototype, "stateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => state_entity_1.State, (state) => state.districts, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'stateId' }),
    __metadata("design:type", state_entity_1.State)
], District.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => taluk_entity_1.Taluk, (taluk) => taluk.district),
    __metadata("design:type", Array)
], District.prototype, "taluks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], District.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], District.prototype, "updatedAt", void 0);
exports.District = District = __decorate([
    (0, typeorm_1.Entity)('districts')
], District);
//# sourceMappingURL=district.entity.js.map