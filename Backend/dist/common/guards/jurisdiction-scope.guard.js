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
exports.JurisdictionScopeGuard = void 0;
exports.validateLandJurisdiction = validateLandJurisdiction;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
const roles_enum_1 = require("../constants/roles.enum");
function validateLandJurisdiction(user, land) {
    if (!user) {
        throw new common_1.ForbiddenException('User is not authenticated');
    }
    if (user.role === roles_enum_1.OfficerRole.SUPER_ADMIN) {
        return;
    }
    const userScope = user.scope || {};
    if (userScope.stateId && land.stateId && userScope.stateId !== land.stateId) {
        throw new common_1.ForbiddenException({
            success: false,
            statusCode: 403,
            code: 'JURISDICTION_ACCESS_DENIED',
            message: `You are not authorized to operate on land parcels outside your state jurisdiction (${userScope.stateName || userScope.stateId}).`,
        });
    }
    if (userScope.districtId && land.districtId && userScope.districtId !== land.districtId) {
        throw new common_1.ForbiddenException({
            success: false,
            statusCode: 403,
            code: 'JURISDICTION_ACCESS_DENIED',
            message: `You are not authorized to operate on land parcels outside your district jurisdiction (${userScope.districtName || userScope.districtId}).`,
        });
    }
    if (userScope.talukId && land.talukId && userScope.talukId !== land.talukId) {
        throw new common_1.ForbiddenException({
            success: false,
            statusCode: 403,
            code: 'JURISDICTION_ACCESS_DENIED',
            message: `You are not authorized to operate on land parcels outside your taluk jurisdiction (${userScope.talukName || userScope.talukId}).`,
        });
    }
    if (userScope.villageId && land.villageId && userScope.villageId !== land.villageId) {
        throw new common_1.ForbiddenException({
            success: false,
            statusCode: 403,
            code: 'JURISDICTION_ACCESS_DENIED',
            message: `You are not authorized to operate on land parcels outside your village jurisdiction (${userScope.villageName || userScope.villageId}).`,
        });
    }
}
let JurisdictionScopeGuard = class JurisdictionScopeGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const entityField = this.reflector.getAllAndOverride(permissions_decorator_1.REQUIRE_JURISDICTION_KEY, [context.getHandler(), context.getClass()]);
        if (!entityField) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User is not authenticated');
        }
        const body = request.body || {};
        const query = request.query || {};
        const params = request.params || {};
        const targetLand = {
            stateId: body.stateId || query.stateId || params.stateId,
            districtId: body.districtId || query.districtId || params.districtId,
            talukId: body.talukId || query.talukId || params.talukId,
            villageId: body.villageId || query.villageId || params.villageId,
        };
        validateLandJurisdiction(user, targetLand);
        return true;
    }
};
exports.JurisdictionScopeGuard = JurisdictionScopeGuard;
exports.JurisdictionScopeGuard = JurisdictionScopeGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], JurisdictionScopeGuard);
//# sourceMappingURL=jurisdiction-scope.guard.js.map