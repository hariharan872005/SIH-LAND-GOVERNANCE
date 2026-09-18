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
export declare const CurrentUser: (...dataOrPipes: (keyof AuthenticatedUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
