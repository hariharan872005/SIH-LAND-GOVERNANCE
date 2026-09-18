import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/permissions.decorator';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      // In development mode, provide a fallback mock persona if dev-token header is present
      const devPersona = request.headers['x-dev-persona'];
      if (devPersona && this.configService.get('NODE_ENV') !== 'production') {
        request.user = this.getDevPersonaUser(devPersona);
        return true;
      }
      throw new UnauthorizedException('Authentication token is required');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET', 'super_secret_gov_root_signing_key_2026_india');
      const payload = await this.jwtService.verifyAsync(token, { secret });
      request.user = payload as AuthenticatedUser;
      return true;
    } catch (err) {
      // Allow dev persona fallback
      const devPersona = request.headers['x-dev-persona'];
      if (devPersona && this.configService.get('NODE_ENV') !== 'production') {
        request.user = this.getDevPersonaUser(devPersona);
        return true;
      }
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  private getDevPersonaUser(role: string): AuthenticatedUser {
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
        // Super Admin
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
          scope: {}, // National Scope (All-India)
        };
    }
  }
}
