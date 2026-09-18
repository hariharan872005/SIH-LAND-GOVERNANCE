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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(reflector, jwtService, configService) {
        this.reflector = reflector;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(permissions_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            const devPersona = request.headers['x-dev-persona'];
            if (devPersona && this.configService.get('NODE_ENV') !== 'production') {
                request.user = this.getDevPersonaUser(devPersona);
                return true;
            }
            throw new common_1.UnauthorizedException('Authentication token is required');
        }
        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
            throw new common_1.UnauthorizedException('Invalid authorization header format');
        }
        try {
            const secret = this.configService.get('JWT_SECRET', 'super_secret_gov_root_signing_key_2026_india');
            const payload = await this.jwtService.verifyAsync(token, { secret });
            request.user = payload;
            return true;
        }
        catch (err) {
            const devPersona = request.headers['x-dev-persona'];
            if (devPersona && this.configService.get('NODE_ENV') !== 'production') {
                request.user = this.getDevPersonaUser(devPersona);
                return true;
            }
            throw new common_1.UnauthorizedException('Invalid or expired authentication token');
        }
    }
    getDevPersonaUser(role) {
        const defaultScope = {
            stateId: 'state_tn',
            districtId: 'dist_che',
            talukId: 'taluk_amb',
            villageId: 'vil_amb_ot',
            stateName: 'Tamil Nadu',
            districtName: 'Chennai',
            talukName: 'Ambattur',
        };
        switch (role.toUpperCase()) {
            case 'TAHSILDAR':
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
                    permissions: [
                        'VIEW_LAND',
                        'CREATE_LAND',
                        'UPDATE_LAND',
                        'VIEW_GIS',
                        'VERIFY_OWNERSHIP',
                        'APPROVE_MUTATION',
                        'VIEW_TRANSFER_HISTORY',
                        'VIEW_DOCUMENTS',
                        'VIEW_DIGITAL_TWINS',
                    ],
                    scope: defaultScope,
                };
            case 'SURVEYOR':
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
                    permissions: [
                        'VIEW_LAND',
                        'VIEW_GIS',
                        'CREATE_SURVEY',
                        'UPDATE_SURVEY',
                        'UPDATE_PROPOSED_BOUNDARY',
                        'UPLOAD_SURVEY_DOCUMENT',
                        'SUBMIT_SURVEY_VERIFICATION',
                        'VIEW_DOCUMENTS',
                        'VIEW_DIGITAL_TWINS',
                    ],
                    scope: defaultScope,
                };
            case 'SUB_REGISTRAR':
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
                    permissions: [
                        'VIEW_LAND',
                        'VIEW_OWNERSHIP',
                        'VERIFY_REGISTRATION',
                        'CREATE_TRANSFER',
                        'UPLOAD_REGISTRATION_DOCUMENT',
                        'VIEW_TRANSFER_HISTORY',
                        'VIEW_DOCUMENTS',
                        'VIEW_DIGITAL_TWINS',
                    ],
                    scope: defaultScope,
                };
            case 'REVENUE_OFFICER':
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
                    permissions: [
                        'VIEW_LAND',
                        'VIEW_PROPERTY',
                        'VERIFY_PROPERTY',
                        'VERIFY_TAX',
                        'UPLOAD_PROPERTY_DOCUMENT',
                        'VIEW_DOCUMENTS',
                        'VIEW_DIGITAL_TWINS',
                    ],
                    scope: defaultScope,
                };
            default:
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
                        'MANAGE_DEPARTMENTS',
                        'MANAGE_DESIGNATIONS',
                        'MANAGE_USERS',
                        'MANAGE_ROLES',
                        'MANAGE_PERMISSIONS',
                        'MANAGE_SCOPE',
                        'VIEW_ALL_LANDS',
                        'VIEW_ALL_VERIFICATIONS',
                        'VIEW_AUDIT_LOGS',
                        'VIEW_DIGITAL_TWINS',
                        'VIEW_LAND',
                        'VIEW_GIS',
                        'VIEW_DOCUMENTS',
                        'VIEW_OWNERSHIP',
                        'VIEW_TRANSFER_HISTORY',
                    ],
                    scope: {},
                };
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        jwt_1.JwtService,
        config_1.ConfigService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map