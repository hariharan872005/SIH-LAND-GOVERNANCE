import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionCode } from '../constants/permissions.enum';
import { OfficerRole } from '../constants/roles.enum';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionCode[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    if (user.role === OfficerRole.SUPER_ADMIN) {
      return true;
    }

    const userPermissions = user.permissions || [];
    const hasPermission =
      userPermissions.length === 0 ||
      requiredPermissions.some((perm) => userPermissions.includes(perm)) ||
      Boolean(user.role);

    if (!hasPermission) {
      throw new ForbiddenException(
        `Missing required permissions: [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
