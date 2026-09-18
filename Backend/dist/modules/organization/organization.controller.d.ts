import { OrganizationService } from './organization.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
export declare class OrganizationController {
    private readonly orgService;
    constructor(orgService: OrganizationService);
    getDepartments(): Promise<import("./entities/department.entity").Department[]>;
    createDepartment(body: any, user: AuthenticatedUser): Promise<import("./entities/department.entity").Department>;
    toggleDepartmentStatus(id: string, user: AuthenticatedUser): Promise<import("./entities/department.entity").Department>;
    getDesignations(departmentId?: string): Promise<import("./entities/designation.entity").Designation[]>;
    createDesignation(body: any, user: AuthenticatedUser): Promise<import("./entities/designation.entity").Designation>;
    getOfficers(pagination: PaginationDto, departmentId?: string, stateId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/officer.entity").Officer>>;
    createOfficer(body: any, user: AuthenticatedUser): Promise<import("./entities/officer.entity").Officer>;
    updateOfficerPut(id: string, body: any, user: AuthenticatedUser): Promise<import("./entities/officer.entity").Officer>;
    updateOfficerPatch(id: string, body: any, user: AuthenticatedUser): Promise<import("./entities/officer.entity").Officer>;
    resetOfficerAccess(id: string, user: AuthenticatedUser): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleOfficerStatus(id: string, user: AuthenticatedUser): Promise<import("./entities/officer.entity").Officer>;
    deleteOfficer(id: string, user: AuthenticatedUser): Promise<{
        success: boolean;
        message: string;
    }>;
    getRoles(): Promise<import("./entities/role.entity").Role[]>;
    getPermissions(): Promise<import("./entities/permission.entity").Permission[]>;
}
