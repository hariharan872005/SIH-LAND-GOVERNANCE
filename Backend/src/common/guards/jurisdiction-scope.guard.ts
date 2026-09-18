import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_JURISDICTION_KEY } from '../decorators/permissions.decorator';
import { OfficerRole } from '../constants/roles.enum';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

export function validateLandJurisdiction(
  user: AuthenticatedUser,
  land: { stateId?: string; districtId?: string; talukId?: string; villageId?: string },
): void {
  if (!user) {
    throw new ForbiddenException('User is not authenticated');
  }

  // Super Admin has national scope
  if (user.role === OfficerRole.SUPER_ADMIN) {
    return;
  }

  const userScope = user.scope || {};

  if (userScope.stateId && land.stateId && userScope.stateId !== land.stateId) {
    throw new ForbiddenException({
      success: false,
      statusCode: 403,
      code: 'JURISDICTION_ACCESS_DENIED',
      message: `You are not authorized to operate on land parcels outside your state jurisdiction (${userScope.stateName || userScope.stateId}).`,
    });
  }

  if (userScope.districtId && land.districtId && userScope.districtId !== land.districtId) {
    throw new ForbiddenException({
      success: false,
      statusCode: 403,
      code: 'JURISDICTION_ACCESS_DENIED',
      message: `You are not authorized to operate on land parcels outside your district jurisdiction (${userScope.districtName || userScope.districtId}).`,
    });
  }

  if (userScope.talukId && land.talukId && userScope.talukId !== land.talukId) {
    throw new ForbiddenException({
      success: false,
      statusCode: 403,
      code: 'JURISDICTION_ACCESS_DENIED',
      message: `You are not authorized to operate on land parcels outside your taluk jurisdiction (${userScope.talukName || userScope.talukId}).`,
    });
  }

  if (userScope.villageId && land.villageId && userScope.villageId !== land.villageId) {
    throw new ForbiddenException({
      success: false,
      statusCode: 403,
      code: 'JURISDICTION_ACCESS_DENIED',
      message: `You are not authorized to operate on land parcels outside your village jurisdiction (${userScope.villageName || userScope.villageId}).`,
    });
  }
}

@Injectable()
export class JurisdictionScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const entityField = this.reflector.getAllAndOverride<string>(
      REQUIRE_JURISDICTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!entityField) {
      return true; // No explicit jurisdiction requirement on this endpoint
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
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
}
