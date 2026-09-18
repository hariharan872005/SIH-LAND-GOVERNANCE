import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../decorators/current-user.decorator';
export declare function validateLandJurisdiction(user: AuthenticatedUser, land: {
    stateId?: string;
    districtId?: string;
    talukId?: string;
    villageId?: string;
}): void;
export declare class JurisdictionScopeGuard implements CanActivate {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
