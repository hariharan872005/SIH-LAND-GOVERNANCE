"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const department_entity_1 = require("./entities/department.entity");
const designation_entity_1 = require("./entities/designation.entity");
const officer_entity_1 = require("./entities/officer.entity");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const state_entity_1 = require("../administrative-scope/entities/state.entity");
const district_entity_1 = require("../administrative-scope/entities/district.entity");
const taluk_entity_1 = require("../administrative-scope/entities/taluk.entity");
const village_entity_1 = require("../administrative-scope/entities/village.entity");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const audit_service_1 = require("../audit/audit.service");
const status_enum_1 = require("../../common/constants/status.enum");
let OrganizationService = class OrganizationService {
    constructor(deptRepo, desigRepo, officerRepo, roleRepo, permRepo, stateRepo, distRepo, talukRepo, vilRepo, auditService) {
        this.deptRepo = deptRepo;
        this.desigRepo = desigRepo;
        this.officerRepo = officerRepo;
        this.roleRepo = roleRepo;
        this.permRepo = permRepo;
        this.stateRepo = stateRepo;
        this.distRepo = distRepo;
        this.talukRepo = talukRepo;
        this.vilRepo = vilRepo;
        this.auditService = auditService;
    }
    async getDepartments() {
        return this.deptRepo.find({
            relations: ['designations'],
            order: { name: 'ASC' },
        });
    }
    async createDepartment(dto, actor) {
        const existing = await this.deptRepo.findOne({ where: [{ name: dto.name }, { code: dto.code.toUpperCase() }] });
        if (existing)
            throw new common_1.ConflictException('Department with this name or code already exists');
        const dept = this.deptRepo.create({
            id: `dept_${dto.code.toLowerCase()}_${Date.now()}`,
            name: dto.name,
            code: dto.code.toUpperCase(),
            description: dto.description,
            status: status_enum_1.DepartmentStatus.ACTIVE,
        });
        const saved = await this.deptRepo.save(dept);
        await this.auditService.logEvent({
            actorId: actor.id,
            actorName: actor.fullName,
            actorRole: actor.role,
            action: 'DEPARTMENT_CREATED',
            entityType: 'DEPARTMENT',
            entityId: saved.id,
            newValue: saved,
        });
        return saved;
    }
    async toggleDepartmentStatus(id, actor) {
        const dept = await this.deptRepo.findOne({ where: { id } });
        if (!dept)
            throw new common_1.NotFoundException('Department not found');
        const prev = dept.status;
        dept.status = dept.status === status_enum_1.DepartmentStatus.ACTIVE ? status_enum_1.DepartmentStatus.INACTIVE : status_enum_1.DepartmentStatus.ACTIVE;
        const saved = await this.deptRepo.save(dept);
        await this.auditService.logEvent({
            actorId: actor.id,
            actorName: actor.fullName,
            actorRole: actor.role,
            action: 'DEPARTMENT_UPDATED',
            entityType: 'DEPARTMENT',
            entityId: saved.id,
            previousValue: { status: prev },
            newValue: { status: saved.status },
        });
        return saved;
    }
    async getDesignations(departmentId) {
        const where = departmentId ? { departmentId } : {};
        return this.desigRepo.find({
            where,
            relations: ['department'],
            order: { title: 'ASC' },
        });
    }
    async createDesignation(dto, actor) {
        const desig = this.desigRepo.create({
            id: `desig_${dto.code.toLowerCase()}_${Date.now()}`,
            title: dto.title,
            code: dto.code.toUpperCase(),
            departmentId: dto.departmentId,
            status: status_enum_1.DesignationStatus.ACTIVE,
        });
        const saved = await this.desigRepo.save(desig);
        await this.auditService.logEvent({
            actorId: actor.id,
            actorName: actor.fullName,
            actorRole: actor.role,
            action: 'DESIGNATION_CREATED',
            entityType: 'DESIGNATION',
            entityId: saved.id,
            newValue: saved,
        });
        return saved;
    }
    async getOfficers(pagination, filters) {
        const qb = this.officerRepo.createQueryBuilder('officer')
            .leftJoinAndSelect('officer.department', 'department')
            .leftJoinAndSelect('officer.designation', 'designation')
            .leftJoinAndSelect('officer.role', 'role')
            .leftJoinAndSelect('officer.state', 'state')
            .leftJoinAndSelect('officer.district', 'district')
            .leftJoinAndSelect('officer.taluk', 'taluk')
            .leftJoinAndSelect('officer.village', 'village');
        if (filters?.departmentId) {
            qb.andWhere('officer.departmentId = :deptId', { deptId: filters.departmentId });
        }
        if (filters?.stateId) {
            qb.andWhere('officer.stateId = :stateId', { stateId: filters.stateId });
        }
        if (filters?.status) {
            qb.andWhere('officer.status = :status', { status: filters.status });
        }
        if (pagination.search) {
            qb.andWhere('(officer.fullName ILIKE :search OR officer.employeeId ILIKE :search OR officer.email ILIKE :search)', { search: `%${pagination.search}%` });
        }
        qb.orderBy('officer.createdAt', pagination.sortOrder || 'DESC');
        qb.skip(((pagination.page || 1) - 1) * (pagination.pageSize || 20));
        qb.take(pagination.pageSize || 20);
        const [items, total] = await qb.getManyAndCount();
        return new pagination_dto_1.PaginatedResult(items, total, pagination.page || 1, pagination.pageSize || 20);
    }
    async resolveScopeIds(dto) {
        let stateId = dto.stateId || dto.state;
        let districtId = dto.districtId || dto.district;
        let talukId = dto.talukId || dto.taluk;
        let villageId = dto.villageId || dto.village;
        if (dto.scope) {
            stateId = stateId || dto.scope.stateId || dto.scope.state;
            districtId = districtId || dto.scope.districtId || dto.scope.district;
            talukId = talukId || dto.scope.talukId || dto.scope.taluk;
            villageId = villageId || dto.scope.villageId || dto.scope.village;
        }
        if (stateId) {
            const stateObj = await this.stateRepo.findOne({
                where: [{ id: stateId }, { name: stateId }, { code: stateId }],
            });
            stateId = stateObj ? stateObj.id : null;
        }
        if (districtId) {
            const distObj = await this.distRepo.findOne({
                where: [{ id: districtId }, { name: districtId }],
            });
            districtId = distObj ? distObj.id : null;
        }
        if (talukId) {
            const talukObj = await this.talukRepo.findOne({
                where: [{ id: talukId }, { name: talukId }],
            });
            talukId = talukObj ? talukObj.id : null;
        }
        if (villageId) {
            const vilObj = await this.vilRepo.findOne({
                where: [{ id: villageId }, { name: villageId }],
            });
            villageId = vilObj ? vilObj.id : null;
        }
        return { stateId, districtId, talukId, villageId };
    }
    async createOfficer(dto, actor) {
        const cleanEmail = (dto.email || '').trim().toLowerCase();
        const cleanEmpId = (dto.employeeId || `GOV-${Math.floor(10000 + Math.random() * 90000)}`).trim();
        const existing = await this.officerRepo.findOne({
            where: [{ employeeId: cleanEmpId }, { email: cleanEmail }],
        });
        if (existing)
            throw new common_1.ConflictException('Officer with this employee ID or email already exists in database');
        const { stateId, districtId, talukId, villageId } = await this.resolveScopeIds(dto);
        let roleId = dto.roleId;
        if (!roleId || roleId.trim() === '') {
            if (dto.designationId) {
                const desig = await this.desigRepo.findOne({ where: { id: dto.designationId } });
                if (desig) {
                    const matchedRole = await this.roleRepo.findOne({ where: { name: desig.code } });
                    if (matchedRole)
                        roleId = matchedRole.id;
                }
            }
            if (!roleId) {
                const defaultRole = await this.roleRepo.findOne({ where: { isSystemRole: true } });
                roleId = defaultRole?.id || 'role_tahsildar';
            }
        }
        const officer = this.officerRepo.create({
            id: `off_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
            employeeId: cleanEmpId,
            fullName: (dto.fullName || 'Officer').trim(),
            email: cleanEmail,
            password: dto.password || 'Password@123',
            phone: dto.phone || '+91 94440 00000',
            departmentId: dto.departmentId,
            designationId: dto.designationId,
            roleId: roleId,
            stateId: stateId,
            districtId: districtId,
            talukId: talukId,
            villageId: villageId,
            status: dto.status === 'INACTIVE' ? status_enum_1.OfficerStatus.INACTIVE : status_enum_1.OfficerStatus.ACTIVE,
        });
        const saved = await this.officerRepo.save(officer);
        await this.auditService.logEvent({
            actorId: actor?.id || 'sys_admin',
            actorName: actor?.fullName || 'Super Admin',
            actorRole: actor?.role || 'SUPER_ADMIN',
            action: 'OFFICER_CREATED',
            entityType: 'OFFICER',
            entityId: saved.id,
            newValue: { fullName: saved.fullName, employeeId: saved.employeeId, email: saved.email, role: roleId },
        });
        return (await this.officerRepo.findOne({
            where: { id: saved.id },
            relations: ['department', 'designation', 'role', 'state', 'district', 'taluk', 'village'],
        })) || saved;
    }
    async updateOfficer(id, dto, actor) {
        const officer = await this.officerRepo.findOne({ where: { id } });
        if (!officer)
            throw new common_1.NotFoundException('Officer record not found');
        const prev = { ...officer };
        if (dto.fullName)
            officer.fullName = dto.fullName.trim();
        if (dto.email)
            officer.email = dto.email.trim().toLowerCase();
        if (dto.password)
            officer.password = dto.password;
        if (dto.phone)
            officer.phone = dto.phone.trim();
        if (dto.departmentId)
            officer.departmentId = dto.departmentId;
        if (dto.designationId)
            officer.designationId = dto.designationId;
        if (dto.roleId)
            officer.roleId = dto.roleId;
        if (dto.status)
            officer.status = dto.status;
        const { stateId, districtId, talukId, villageId } = await this.resolveScopeIds(dto);
        if (stateId !== undefined)
            officer.stateId = stateId;
        if (districtId !== undefined)
            officer.districtId = districtId;
        if (talukId !== undefined)
            officer.talukId = talukId;
        if (villageId !== undefined)
            officer.villageId = villageId;
        const saved = await this.officerRepo.save(officer);
        await this.auditService.logEvent({
            actorId: actor?.id || 'sys_admin',
            actorName: actor?.fullName || 'Super Admin',
            actorRole: actor?.role || 'SUPER_ADMIN',
            action: 'OFFICER_STATUS_CHANGED',
            entityType: 'OFFICER',
            entityId: saved.id,
            previousValue: prev,
            newValue: saved,
        });
        return (await this.officerRepo.findOne({
            where: { id: saved.id },
            relations: ['department', 'designation', 'role', 'state', 'district', 'taluk', 'village'],
        })) || saved;
    }
    async resetOfficerAccess(id, actor) {
        const officer = await this.officerRepo.findOne({ where: { id } });
        if (!officer)
            throw new common_1.NotFoundException('Officer not found');
        const tempPassword = `GovPass@${Math.floor(1000 + Math.random() * 9000)}`;
        officer.password = tempPassword;
        await this.officerRepo.save(officer);
        await this.auditService.logEvent({
            actorId: actor?.id || 'sys_admin',
            actorName: actor?.fullName || 'Super Admin',
            actorRole: actor?.role || 'SUPER_ADMIN',
            action: 'OFFICER_STATUS_CHANGED',
            entityType: 'OFFICER',
            entityId: id,
            newValue: { event: 'PASSWORD_RESET', email: officer.email },
        });
        return { success: true, message: `Access credentials reset for ${officer.fullName}. New temporary password: ${tempPassword}` };
    }
    async toggleOfficerStatus(id, actor) {
        const officer = await this.officerRepo.findOne({ where: { id } });
        if (!officer)
            throw new common_1.NotFoundException('Officer not found');
        const prev = officer.status;
        officer.status = officer.status === status_enum_1.OfficerStatus.ACTIVE ? status_enum_1.OfficerStatus.INACTIVE : status_enum_1.OfficerStatus.ACTIVE;
        const saved = await this.officerRepo.save(officer);
        await this.auditService.logEvent({
            actorId: actor?.id || 'sys_admin',
            actorName: actor?.fullName || 'Super Admin',
            actorRole: actor?.role || 'SUPER_ADMIN',
            action: 'OFFICER_STATUS_CHANGED',
            entityType: 'OFFICER',
            entityId: saved.id,
            previousValue: { status: prev },
            newValue: { status: saved.status },
        });
        return saved;
    }
    async deleteOfficer(id, actor) {
        const officer = await this.officerRepo.findOne({ where: { id } });
        if (!officer)
            throw new common_1.NotFoundException('Officer record not found in database');
        try {
            await this.officerRepo.manager.query(`UPDATE land_verifications SET "officerId" = NULL WHERE "officerId" = $1`, [id]);
            await this.officerRepo.manager.query(`UPDATE document_records SET "uploadedByOfficerId" = NULL WHERE "uploadedByOfficerId" = $1`, [id]);
            await this.officerRepo.manager.query(`UPDATE land_transfer_transactions SET "createdByOfficerId" = NULL WHERE "createdByOfficerId" = $1`, [id]);
            await this.officerRepo.manager.query(`UPDATE municipal_assessments SET "verifiedByOfficerId" = NULL WHERE "verifiedByOfficerId" = $1`, [id]);
            await this.officerRepo.manager.query(`UPDATE land_parcels SET "createdByOfficerId" = NULL WHERE "createdByOfficerId" = $1`, [id]);
        }
        catch (fkErr) {
            console.warn('Foreign key reference cleanup warning:', fkErr.message);
        }
        await this.officerRepo.remove(officer);
        await this.auditService.logEvent({
            actorId: actor?.id || 'sys_admin',
            actorName: actor?.fullName || 'Super Admin',
            actorRole: actor?.role || 'SUPER_ADMIN',
            action: 'OFFICER_STATUS_CHANGED',
            entityType: 'OFFICER',
            entityId: id,
            previousValue: { fullName: officer.fullName, email: officer.email, employeeId: officer.employeeId },
        });
        return { success: true, message: `Officer login ${officer.email} deleted successfully from database` };
    }
    async getRoles() {
        return this.roleRepo.find({ relations: ['permissions'] });
    }
    async getPermissions() {
        return this.permRepo.find({ order: { category: 'ASC', name: 'ASC' } });
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(1, (0, typeorm_1.InjectRepository)(designation_entity_1.Designation)),
    __param(2, (0, typeorm_1.InjectRepository)(officer_entity_1.Officer)),
    __param(3, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(4, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(5, (0, typeorm_1.InjectRepository)(state_entity_1.State)),
    __param(6, (0, typeorm_1.InjectRepository)(district_entity_1.District)),
    __param(7, (0, typeorm_1.InjectRepository)(taluk_entity_1.Taluk)),
    __param(8, (0, typeorm_1.InjectRepository)(village_entity_1.Village)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map