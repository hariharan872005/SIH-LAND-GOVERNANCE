import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
import { DepartmentStatus, DesignationStatus, OfficerStatus } from '../../common/constants/status.enum';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(Designation)
    private readonly desigRepo: Repository<Designation>,
    @InjectRepository(Officer)
    private readonly officerRepo: Repository<Officer>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(State)
    private readonly stateRepo: Repository<State>,
    @InjectRepository(District)
    private readonly distRepo: Repository<District>,
    @InjectRepository(Taluk)
    private readonly talukRepo: Repository<Taluk>,
    @InjectRepository(Village)
    private readonly vilRepo: Repository<Village>,
    private readonly auditService: AuditService,
  ) {}

  // ================= DEPARTMENTS =================
  async getDepartments(): Promise<Department[]> {
    return this.deptRepo.find({
      relations: ['designations'],
      order: { name: 'ASC' },
    });
  }

  async createDepartment(dto: { name: string; code: string; description?: string }, actor: AuthenticatedUser): Promise<Department> {
    const existing = await this.deptRepo.findOne({ where: [{ name: dto.name }, { code: dto.code.toUpperCase() }] });
    if (existing) throw new ConflictException('Department with this name or code already exists');

    const dept = this.deptRepo.create({
      id: `dept_${dto.code.toLowerCase()}_${Date.now()}`,
      name: dto.name,
      code: dto.code.toUpperCase(),
      description: dto.description,
      status: DepartmentStatus.ACTIVE,
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

  async toggleDepartmentStatus(id: string, actor: AuthenticatedUser): Promise<Department> {
    const dept = await this.deptRepo.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');

    const prev = dept.status;
    dept.status = dept.status === DepartmentStatus.ACTIVE ? DepartmentStatus.INACTIVE : DepartmentStatus.ACTIVE;
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

  // ================= DESIGNATIONS =================
  async getDesignations(departmentId?: string): Promise<Designation[]> {
    const where = departmentId ? { departmentId } : {};
    return this.desigRepo.find({
      where,
      relations: ['department'],
      order: { title: 'ASC' },
    });
  }

  async createDesignation(dto: { title: string; code: string; departmentId: string }, actor: AuthenticatedUser): Promise<Designation> {
    const desig = this.desigRepo.create({
      id: `desig_${dto.code.toLowerCase()}_${Date.now()}`,
      title: dto.title,
      code: dto.code.toUpperCase(),
      departmentId: dto.departmentId,
      status: DesignationStatus.ACTIVE,
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

  // ================= OFFICERS =================
  async getOfficers(
    pagination: PaginationDto,
    filters?: { departmentId?: string; stateId?: string; status?: OfficerStatus },
  ): Promise<PaginatedResult<Officer>> {
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
      qb.andWhere(
        '(officer.fullName ILIKE :search OR officer.employeeId ILIKE :search OR officer.email ILIKE :search)',
        { search: `%${pagination.search}%` },
      );
    }

    qb.orderBy('officer.createdAt', pagination.sortOrder || 'DESC');
    qb.skip(((pagination.page || 1) - 1) * (pagination.pageSize || 20));
    qb.take(pagination.pageSize || 20);

    const [items, total] = await qb.getManyAndCount();
    return new PaginatedResult(items, total, pagination.page || 1, pagination.pageSize || 20);
  }

  private async resolveScopeIds(dto: any) {
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

    // Resolve stateId
    if (stateId) {
      const stateObj = await this.stateRepo.findOne({
        where: [{ id: stateId }, { name: stateId }, { code: stateId }],
      });
      stateId = stateObj ? stateObj.id : null;
    }

    // Resolve districtId
    if (districtId) {
      const distObj = await this.distRepo.findOne({
        where: [{ id: districtId }, { name: districtId }],
      });
      districtId = distObj ? distObj.id : null;
    }

    // Resolve talukId
    if (talukId) {
      const talukObj = await this.talukRepo.findOne({
        where: [{ id: talukId }, { name: talukId }],
      });
      talukId = talukObj ? talukObj.id : null;
    }

    // Resolve villageId
    if (villageId) {
      const vilObj = await this.vilRepo.findOne({
        where: [{ id: villageId }, { name: villageId }],
      });
      villageId = vilObj ? vilObj.id : null;
    }

    return { stateId, districtId, talukId, villageId };
  }

  async createOfficer(dto: any, actor: AuthenticatedUser): Promise<Officer> {
    const cleanEmail = (dto.email || '').trim().toLowerCase();
    const cleanEmpId = (dto.employeeId || `GOV-${Math.floor(10000 + Math.random() * 90000)}`).trim();

    const existing = await this.officerRepo.findOne({
      where: [{ employeeId: cleanEmpId }, { email: cleanEmail }],
    });
    if (existing) throw new ConflictException('Officer with this employee ID or email already exists in database');

    const { stateId, districtId, talukId, villageId } = await this.resolveScopeIds(dto);

    // Resolve Role if needed
    let roleId = dto.roleId;
    if (!roleId || roleId.trim() === '') {
      // Find role matching designation code or first role
      if (dto.designationId) {
        const desig = await this.desigRepo.findOne({ where: { id: dto.designationId } });
        if (desig) {
          const matchedRole = await this.roleRepo.findOne({ where: { name: desig.code as any } });
          if (matchedRole) roleId = matchedRole.id;
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
      status: dto.status === 'INACTIVE' ? OfficerStatus.INACTIVE : OfficerStatus.ACTIVE,
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

  async updateOfficer(id: string, dto: any, actor: AuthenticatedUser): Promise<Officer> {
    const officer = await this.officerRepo.findOne({ where: { id } });
    if (!officer) throw new NotFoundException('Officer record not found');

    const prev = { ...officer };

    if (dto.fullName) officer.fullName = dto.fullName.trim();
    if (dto.email) officer.email = dto.email.trim().toLowerCase();
    if (dto.password) officer.password = dto.password;
    if (dto.phone) officer.phone = dto.phone.trim();
    if (dto.departmentId) officer.departmentId = dto.departmentId;
    if (dto.designationId) officer.designationId = dto.designationId;
    if (dto.roleId) officer.roleId = dto.roleId;
    if (dto.status) officer.status = dto.status;

    const { stateId, districtId, talukId, villageId } = await this.resolveScopeIds(dto);
    if (stateId !== undefined) officer.stateId = stateId;
    if (districtId !== undefined) officer.districtId = districtId;
    if (talukId !== undefined) officer.talukId = talukId;
    if (villageId !== undefined) officer.villageId = villageId;

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

  async resetOfficerAccess(id: string, actor: AuthenticatedUser): Promise<{ success: boolean; message: string }> {
    const officer = await this.officerRepo.findOne({ where: { id } });
    if (!officer) throw new NotFoundException('Officer not found');

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

  async toggleOfficerStatus(id: string, actor: AuthenticatedUser): Promise<Officer> {
    const officer = await this.officerRepo.findOne({ where: { id } });
    if (!officer) throw new NotFoundException('Officer not found');

    const prev = officer.status;
    officer.status = officer.status === OfficerStatus.ACTIVE ? OfficerStatus.INACTIVE : OfficerStatus.ACTIVE;
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

  async deleteOfficer(id: string, actor: AuthenticatedUser): Promise<{ success: boolean; message: string }> {
    const officer = await this.officerRepo.findOne({ where: { id } });
    if (!officer) throw new NotFoundException('Officer record not found in database');

    // Cleanly nullify any foreign key references across tables in PostgreSQL
    try {
      await this.officerRepo.manager.query(`UPDATE land_verifications SET "officerId" = NULL WHERE "officerId" = $1`, [id]);
      await this.officerRepo.manager.query(`UPDATE document_records SET "uploadedByOfficerId" = NULL WHERE "uploadedByOfficerId" = $1`, [id]);
      await this.officerRepo.manager.query(`UPDATE land_transfer_transactions SET "createdByOfficerId" = NULL WHERE "createdByOfficerId" = $1`, [id]);
      await this.officerRepo.manager.query(`UPDATE municipal_assessments SET "verifiedByOfficerId" = NULL WHERE "verifiedByOfficerId" = $1`, [id]);
      await this.officerRepo.manager.query(`UPDATE land_parcels SET "createdByOfficerId" = NULL WHERE "createdByOfficerId" = $1`, [id]);
    } catch (fkErr) {
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

  // ================= ROLES & PERMISSIONS =================
  async getRoles(): Promise<Role[]> {
    return this.roleRepo.find({ relations: ['permissions'] });
  }

  async getPermissions(): Promise<Permission[]> {
    return this.permRepo.find({ order: { category: 'ASC', name: 'ASC' } });
  }
}
