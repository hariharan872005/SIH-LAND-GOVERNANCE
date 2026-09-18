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
exports.State = void 0;
const typeorm_1 = require("typeorm");
const district_entity_1 = require("./district.entity");
let State = class State {
};
exports.State = State;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 64 }),
    __metadata("design:type", String)
], State.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128, unique: true }),
    __metadata("design:type", String)
], State.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 8, unique: true }),
    __metadata("design:type", String)
], State.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => district_entity_1.District, (district) => district.state),
    __metadata("design:type", Array)
], State.prototype, "districts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], State.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], State.prototype, "updatedAt", void 0);
exports.State = State = __decorate([
    (0, typeorm_1.Entity)('states')
], State);
//# sourceMappingURL=state.entity.js.map