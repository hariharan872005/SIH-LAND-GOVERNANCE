"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireJurisdiction = exports.REQUIRE_JURISDICTION_KEY = exports.Public = exports.IS_PUBLIC_KEY = exports.RequireRoles = exports.ROLES_KEY = exports.RequirePermissions = exports.PERMISSIONS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSIONS_KEY = 'permissions';
const RequirePermissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.RequirePermissions = RequirePermissions;
exports.ROLES_KEY = 'roles';
const RequireRoles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.RequireRoles = RequireRoles;
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
exports.REQUIRE_JURISDICTION_KEY = 'requireJurisdiction';
const RequireJurisdiction = (entityField = 'landId') => (0, common_1.SetMetadata)(exports.REQUIRE_JURISDICTION_KEY, entityField);
exports.RequireJurisdiction = RequireJurisdiction;
//# sourceMappingURL=permissions.decorator.js.map