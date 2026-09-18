import { SetMetadata } from '@nestjs/common';
import { PermissionCode } from '../constants/permissions.enum';
import { OfficerRole } from '../constants/roles.enum';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: PermissionCode[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: OfficerRole[]) =>
  SetMetadata(ROLES_KEY, roles);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const REQUIRE_JURISDICTION_KEY = 'requireJurisdiction';
export const RequireJurisdiction = (entityField: string = 'landId') =>
  SetMetadata(REQUIRE_JURISDICTION_KEY, entityField);
