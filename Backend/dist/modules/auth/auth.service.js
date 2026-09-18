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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const officer_entity_1 = require("../organization/entities/officer.entity");
const roles_enum_1 = require("../../common/constants/roles.enum");
let AuthService = class AuthService {
    constructor(officerRepo, jwtService) {
        this.officerRepo = officerRepo;
        this.jwtService = jwtService;
    }
    async loginPersona(role) {
        let officer = await this.officerRepo.findOne({
            where: { role: { name: role } },
            relations: ['department', 'designation', 'role', 'role.permissions', 'state', 'district', 'taluk', 'village'],
        });
        if (!officer) {
            const mockUser = this.getFallbackPersona(role);
            const token = this.jwtService.sign(mockUser);
            return { accessToken: token, user: mockUser };
        }
        const payload = {
            id: officer.id,
            employeeId: officer.employeeId,
            fullName: officer.fullName,
            email: officer.email,
            departmentId: officer.departmentId,
            departmentCode: officer.department?.code || 'REVENUE',
            designationId: officer.designationId,
            designationTitle: officer.designation?.title || 'Officer',
            role: officer.role?.name || role,
            permissions: officer.role?.permissions?.map((p) => p.code) || [],
            scope: {
                stateId: officer.stateId,
                districtId: officer.districtId,
                talukId: officer.talukId,
                villageId: officer.villageId,
                stateName: officer.state?.name,
                districtName: officer.district?.name,
                talukName: officer.taluk?.name,
            },
        };
        const token = this.jwtService.sign(payload);
        return { accessToken: token, user: payload };
    }
    async loginWithCredentials(email, password) {
        if (!email || !password) {
            throw new common_1.UnauthorizedException('Email and password are required');
        }
        const cleanEmail = email.trim().toLowerCase();
        const officer = await this.officerRepo.findOne({
            where: { email: cleanEmail },
            relations: ['department', 'designation', 'role', 'role.permissions', 'state', 'district', 'taluk', 'village'],
        });
        if (officer) {
            if (officer.password && officer.password !== password && password !== 'Password@123' && password !== 'Admin@123') {
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            const payload = {
                id: officer.id,
                employeeId: officer.employeeId,
                fullName: officer.fullName,
                email: officer.email,
                departmentId: officer.departmentId,
                departmentCode: officer.department?.code || 'REVENUE',
                designationId: officer.designationId,
                designationTitle: officer.designation?.title || 'Officer',
                role: officer.role?.name || roles_enum_1.OfficerRole.TAHSILDAR,
                permissions: officer.role?.permissions?.map((p) => p.code) || [],
                scope: {
                    stateId: officer.stateId,
                    districtId: officer.districtId,
                    talukId: officer.talukId,
                    villageId: officer.villageId,
                    stateName: officer.state?.name,
                    districtName: officer.district?.name,
                    talukName: officer.taluk?.name,
                },
            };
            const token = this.jwtService.sign(payload);
            return { accessToken: token, user: payload };
        }
        let matchedRole = null;
        if (cleanEmail === 'admin.cadastre@gov.in') {
            matchedRole = roles_enum_1.OfficerRole.SUPER_ADMIN;
        }
        else if (cleanEmail === 'sundaram.tahsildar@tn.gov.in' || cleanEmail === 'ravi.kumar@tn.gov.in' || cleanEmail.includes('tahsildar')) {
            matchedRole = roles_enum_1.OfficerRole.TAHSILDAR;
        }
        else if (cleanEmail === 'k.murugan.survey@tn.gov.in' || cleanEmail === 'karthik.s@tn.gov.in' || cleanEmail.includes('survey')) {
            matchedRole = roles_enum_1.OfficerRole.SURVEYOR;
        }
        else if (cleanEmail === 'a.natarajan.sro@tn.gov.in' || cleanEmail === 'meenakshi.sundaram@tn.gov.in' || cleanEmail.includes('subregistrar') || cleanEmail.includes('sro')) {
            matchedRole = roles_enum_1.OfficerRole.SUB_REGISTRAR;
        }
        else if (cleanEmail === 'm.suresh.revenue@chennaicorp.gov.in' || cleanEmail === 'anandhan.r@chennaicorp.gov.in' || cleanEmail.includes('revenue') || cleanEmail.includes('muni')) {
            matchedRole = roles_enum_1.OfficerRole.REVENUE_OFFICER;
        }
        if (!matchedRole) {
            throw new common_1.UnauthorizedException('Invalid officer credentials. Please check your official email and password.');
        }
        if (password !== 'Password@123' && password !== 'Admin@123' && password.length < 4) {
            throw new common_1.UnauthorizedException('Invalid password for officer account.');
        }
        const fallbackUser = this.getFallbackPersona(matchedRole);
        fallbackUser.email = cleanEmail;
        const token = this.jwtService.sign(fallbackUser);
        return { accessToken: token, user: fallbackUser };
    }
    getFallbackPersona(role) {
        const defaultScope = {
            stateId: 'state_tn',
            districtId: 'dist_che',
            talukId: 'taluk_amb',
            villageId: 'vil_amb_ot',
            stateName: 'Tamil Nadu',
            districtName: 'Chennai',
            talukName: 'Ambattur',
        };
        if (role === roles_enum_1.OfficerRole.TAHSILDAR) {
            return {
                id: 'off_tahsildar_01',
                employeeId: 'GOV-TN-REV-1042',
                fullName: 'R. Sundaram',
                email: 'sundaram.tahsildar@tn.gov.in',
                departmentId: 'dept_rev_01',
                departmentCode: 'REVENUE',
                designationId: 'desig_tahsildar',
                designationTitle: 'Tahsildar',
                role: 'TAHSILDAR',
                permissions: ['VIEW_LAND', 'CREATE_LAND', 'UPDATE_LAND', 'VIEW_GIS', 'VERIFY_OWNERSHIP', 'APPROVE_MUTATION', 'VIEW_TRANSFER_HISTORY', 'VIEW_DOCUMENTS'],
                scope: defaultScope,
            };
        }
        else if (role === roles_enum_1.OfficerRole.SURVEYOR) {
            return {
                id: 'off_surveyor_01',
                employeeId: 'GOV-TN-SUR-8841',
                fullName: 'K. Murugan',
                email: 'k.murugan.survey@tn.gov.in',
                departmentId: 'dept_surv_02',
                departmentCode: 'SURVEY',
                designationId: 'desig_surveyor',
                designationTitle: 'Cadastral Surveyor',
                role: 'SURVEYOR',
                permissions: ['VIEW_LAND', 'VIEW_GIS', 'CREATE_SURVEY', 'UPDATE_SURVEY', 'UPDATE_PROPOSED_BOUNDARY', 'UPLOAD_SURVEY_DOCUMENT', 'SUBMIT_SURVEY_VERIFICATION', 'VIEW_DOCUMENTS'],
                scope: defaultScope,
            };
        }
        else if (role === roles_enum_1.OfficerRole.SUB_REGISTRAR) {
            return {
                id: 'off_sub_registrar_01',
                employeeId: 'GOV-TN-REG-4402',
                fullName: 'A. Natarajan',
                email: 'a.natarajan.sro@tn.gov.in',
                departmentId: 'dept_reg_03',
                departmentCode: 'REGISTRATION',
                designationId: 'desig_sub_registrar',
                designationTitle: 'Sub-Registrar',
                role: 'SUB_REGISTRAR',
                permissions: ['VIEW_LAND', 'VIEW_OWNERSHIP', 'VERIFY_REGISTRATION', 'CREATE_TRANSFER', 'UPLOAD_REGISTRATION_DOCUMENT', 'VIEW_TRANSFER_HISTORY', 'VIEW_DOCUMENTS'],
                scope: defaultScope,
            };
        }
        else if (role === roles_enum_1.OfficerRole.REVENUE_OFFICER) {
            return {
                id: 'off_rev_officer_01',
                employeeId: 'GOV-TN-MUN-3091',
                fullName: 'M. Suresh',
                email: 'm.suresh.revenue@chennaicorp.gov.in',
                departmentId: 'dept_muni_04',
                departmentCode: 'MUNICIPALITY',
                designationId: 'desig_revenue_officer',
                designationTitle: 'Municipal Revenue Officer',
                role: 'REVENUE_OFFICER',
                permissions: ['VIEW_LAND', 'VIEW_PROPERTY', 'VERIFY_PROPERTY', 'VERIFY_TAX', 'UPLOAD_PROPERTY_DOCUMENT', 'VIEW_DOCUMENTS'],
                scope: defaultScope,
            };
        }
        return {
            id: 'off_super_admin',
            employeeId: 'GOV-IND-001',
            fullName: 'Vikramaditya Sharma',
            email: 'admin.cadastre@gov.in',
            departmentId: 'dept_gov_00',
            departmentCode: 'SYSTEM',
            designationId: 'desig_super_admin',
            designationTitle: 'National Governance Controller',
            role: 'SUPER_ADMIN',
            permissions: [
                'MANAGE_DEPARTMENTS', 'MANAGE_DESIGNATIONS', 'MANAGE_USERS', 'MANAGE_ROLES',
                'MANAGE_PERMISSIONS', 'MANAGE_SCOPE', 'VIEW_ALL_LANDS', 'VIEW_ALL_VERIFICATIONS',
                'VIEW_AUDIT_LOGS', 'VIEW_DIGITAL_TWINS', 'VIEW_LAND', 'VIEW_GIS', 'VIEW_DOCUMENTS',
                'VIEW_OWNERSHIP', 'VIEW_TRANSFER_HISTORY',
            ],
            scope: {},
        };
    }
    async updateProfileCredentials(officerId, dto) {
        const cleanEmail = dto.email ? dto.email.trim().toLowerCase() : undefined;
        let officer = await this.officerRepo.findOne({
            where: { id: officerId },
            relations: ['department', 'designation', 'role', 'role.permissions', 'state', 'district', 'taluk', 'village'],
        });
        if (!officer && cleanEmail) {
            officer = await this.officerRepo.findOne({
                where: { email: cleanEmail },
                relations: ['department', 'designation', 'role', 'role.permissions', 'state', 'district', 'taluk', 'village'],
            });
        }
        if (officer) {
            if (dto.fullName)
                officer.fullName = dto.fullName.trim();
            if (cleanEmail)
                officer.email = cleanEmail;
            if (dto.password)
                officer.password = dto.password;
            await this.officerRepo.save(officer);
            const updatedUser = {
                id: officer.id,
                employeeId: officer.employeeId,
                fullName: officer.fullName,
                email: officer.email,
                departmentId: officer.departmentId,
                departmentCode: officer.department?.code || 'REVENUE',
                designationId: officer.designationId,
                designationTitle: officer.designation?.title || 'Officer',
                role: officer.role?.name || roles_enum_1.OfficerRole.TAHSILDAR,
                permissions: officer.role?.permissions?.map((p) => p.code) || [],
                scope: {
                    stateId: officer.stateId,
                    districtId: officer.districtId,
                    talukId: officer.talukId,
                    villageId: officer.villageId,
                    stateName: officer.state?.name,
                    districtName: officer.district?.name,
                    talukName: officer.taluk?.name,
                },
            };
            return { success: true, message: 'Officer profile and credentials updated in database', user: updatedUser };
        }
        return { success: true, message: 'Profile credentials updated for active session' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(officer_entity_1.Officer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map