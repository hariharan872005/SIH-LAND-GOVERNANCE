import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/permissions.decorator';
import { OfficerRole } from '../constants/roles.enum';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<OfficerRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
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

    const hasRole = requiredRoles.includes(user.role as OfficerRole);
    if (!hasRole) {
      throw new ForbiddenException(
        `Role '${user.role}' is not authorized. Required: [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
