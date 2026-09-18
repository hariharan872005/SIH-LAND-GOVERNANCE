import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  departmentId: string;
  departmentCode: string;
  designationId: string;
  designationTitle: string;
  role: string;
  permissions: string[];
  scope: {
    stateId?: string;
    districtId?: string;
    talukId?: string;
    villageId?: string;
    stateName?: string;
    districtName?: string;
    talukName?: string;
    villageName?: string;
  };
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
