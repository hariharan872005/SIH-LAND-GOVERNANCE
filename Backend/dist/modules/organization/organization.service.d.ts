import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import { Officer } from './entities/officer.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { State } from '../administrative-scope/entities/state.entity';
import { District } from '../administrative-scope/entities/district.entity';
import { Taluk } from '../administrative-scope/entities/taluk.entity';
import { Village } from '../administrative-scope/entities/village.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { OfficerStatus } from '../../common/constants/status.enum';
export declare class OrganizationService {
    private readonly deptRepo;
    private readonly desigRepo;
    private readonly officerRepo;
    private readonly roleRepo;
    private readonly permRepo;
    private readonly stateRepo;
    private readonly distRepo;
    private readonly talukRepo;
    private readonly vilRepo;
    private readonly auditService;
    constructor(deptRepo: Repository<Department>, desigRepo: Repository<Designation>, officerRepo: Repository<Officer>, roleRepo: Repository<Role>, permRepo: Repository<Permission>, stateRepo: Repository<State>, distRepo: Repository<District>, talukRepo: Repository<Taluk>, vilRepo: Repository<Village>, auditService: AuditService);
    getDepartments(): Promise<Department[]>;
    createDepartment(dto: {
        name: string;
        code: string;
        description?: string;
    }, actor: AuthenticatedUser): Promise<Department>;
    toggleDepartmentStatus(id: string, actor: AuthenticatedUser): Promise<Department>;
    getDesignations(departmentId?: string): Promise<Designation[]>;
    createDesignation(dto: {
        title: string;
        code: string;
        departmentId: string;
    }, actor: AuthenticatedUser): Promise<Designation>;
    getOfficers(pagination: PaginationDto, filters?: {
        departmentId?: string;
        stateId?: string;
        status?: OfficerStatus;
    }): Promise<PaginatedResult<Officer>>;
    private resolveScopeIds;
    createOfficer(dto: any, actor: AuthenticatedUser): Promise<Officer>;
    updateOfficer(id: string, dto: any, actor: AuthenticatedUser): Promise<Officer>;
    resetOfficerAccess(id: string, actor: AuthenticatedUser): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleOfficerStatus(id: string, actor: AuthenticatedUser): Promise<Officer>;
    deleteOfficer(id: string, actor: AuthenticatedUser): Promise<{
        success: boolean;
        message: string;
    }>;
    getRoles(): Promise<Role[]>;
    getPermissions(): Promise<Permission[]>;
}
