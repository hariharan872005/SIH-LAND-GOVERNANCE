import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandVerification } from './entities/land-verification.entity';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { LandStatus, VerificationStatus } from '../../common/constants/status.enum';
import { OfficerRole } from '../../common/constants/roles.enum';
import { AuditService } from '../audit/audit.service';
import { validateLandJurisdiction } from '../../common/guards/jurisdiction-scope.guard';
import { VerifyRegistrationDto } from './dto/verify-registration.dto';
import { ReopenVerificationDto } from './dto/reopen-verification.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  private readonly REGISTRATION_DEPT_ID = 'dept_reg_03';

  constructor(
    @InjectRepository(LandVerification)
    private readonly verificationRepo: Repository<LandVerification>,
    @InjectRepository(LandParcel)
    private readonly landRepo: Repository<LandParcel>,
    private readonly auditService: AuditService,
  ) {}

  async getVerificationsByLand(landId: string): Promise<LandVerification[]> {
    return this.verificationRepo.find({
      where: [{ landId }, { land: { landId: landId.toUpperCase() } }],
      relations: ['department', 'officer'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Verify an existing registration record (Sub-Registrar workflow)
   * Section 3 & 13
   */
  async verifyRegistration(
    dto: VerifyRegistrationDto,
    officer: AuthenticatedUser,
  ) {
    // 1. Authenticate Officer (handy role check safety)
    if (
      officer.role !== OfficerRole.SUB_REGISTRAR &&
      officer.role !== OfficerRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only Sub-Registrar or Super Admin is authorized to verify land registration.',
      );
    }

    // 2. Load current land parcel
    const land = await this.landRepo.findOne({
      where: [{ id: dto.landId }, { landId: dto.landId.toUpperCase() }],
      relations: ['state', 'district', 'taluk', 'village'],
    });

    if (!land) {
      throw new NotFoundException(`Land parcel '${dto.landId}' not found.`);
    }

    // 3. Verify geographical jurisdiction
    validateLandJurisdiction(officer, land);

    // 3.5 Mandatory Pre-Requisite Check: Survey Department Verification must be VERIFIED
    const surveyVerification = await this.verificationRepo.findOne({
      where: { landId: land.id, departmentId: 'dept_surv_02' },
    });

    if (!surveyVerification || surveyVerification.status !== VerificationStatus.VERIFIED) {
      throw new BadRequestException({
        success: false,
        code: 'SURVEY_VERIFICATION_REQUIRED',
        message: `Survey Verification Required: Land parcel '${land.landId}' must be verified by the Survey Department before Sub-Registrar registration verification can proceed.`,
      });
    }

    // 4. Load current registration verification record
    let verification = await this.verificationRepo.findOne({
      where: { landId: land.id, departmentId: this.REGISTRATION_DEPT_ID },
    });

    // 5. Confirm it is NOT already VERIFIED (Section 3 & 13)
    if (verification && verification.status === VerificationStatus.VERIFIED) {
      this.logger.warn(
        `Duplicate registration verification attempted for land ${land.landId} by ${officer.fullName}`,
      );
      throw new ConflictException({
        success: false,
        code: 'REGISTRATION_ALREADY_VERIFIED',
        message: 'Registration has already been verified.',
      });
    }

    // 6. Create or update verification record
    if (!verification) {
      verification = this.verificationRepo.create({
        id: `ver_reg_${Date.now()}_${uuidv4().slice(0, 8)}`,
        landId: land.id,
        departmentId: this.REGISTRATION_DEPT_ID,
      });
    }

    verification.status = VerificationStatus.VERIFIED;
    verification.remarks =
      dto.remarks || 'Registration ledger & deed ownership verified by Sub-Registrar.';
    verification.officerId = officer.id;
    verification.verifiedAt = new Date();

    const savedVerification = await this.verificationRepo.save(verification);

    // 7. Update Land status to REGISTRATION_VERIFIED
    land.status = LandStatus.REGISTRATION_VERIFIED;
    await this.landRepo.save(land);

    // 8. Create immutable Audit log
    await this.auditService.logEvent({
      actorId: officer.id,
      actorName: officer.fullName,
      actorRole: officer.role,
      action: 'OWNER_VERIFICATION_COMPLETED',
      entityType: 'VERIFICATION',
      entityId: land.landId,
      newValue: {
        status: VerificationStatus.VERIFIED,
        departmentId: this.REGISTRATION_DEPT_ID,
        remarks: verification.remarks,
        verifiedAt: verification.verifiedAt,
      },
    });

    // 9. Return standardized success response (Section 19)
    return {
      success: true,
      status: VerificationStatus.VERIFIED,
      verifiedBy: {
        id: officer.id,
        fullName: officer.fullName,
        role: officer.role,
        departmentId: officer.departmentId,
      },
      verifiedAt: savedVerification.verifiedAt,
    };
  }

  /**
   * Reopen a verified record for correction (Section 14 & Rule 8)
   */
  async reopenVerification(
    dto: ReopenVerificationDto,
    officer: AuthenticatedUser,
  ) {
    const departmentId = dto.departmentId || this.REGISTRATION_DEPT_ID;

    const land = await this.landRepo.findOne({
      where: [{ id: dto.landId }, { landId: dto.landId.toUpperCase() }],
      relations: ['state', 'district', 'taluk', 'village'],
    });

    if (!land) {
      throw new NotFoundException(`Land parcel '${dto.landId}' not found.`);
    }

    validateLandJurisdiction(officer, land);

    const verification = await this.verificationRepo.findOne({
      where: { landId: land.id, departmentId },
    });

    if (!verification) {
      throw new NotFoundException(
        `Verification record for department ${departmentId} not found on land ${dto.landId}.`,
      );
    }

    const previousStatus = verification.status;
    verification.status = VerificationStatus.REQUIRES_CORRECTION;
    verification.remarks = `[REOPENED FOR CORRECTION] ${dto.reason}`;
    verification.officerId = officer.id;

    const saved = await this.verificationRepo.save(verification);

    land.status = LandStatus.REQUIRES_CORRECTION;
    await this.landRepo.save(land);

    // Audit Event: VERIFICATION_REOPENED
    await this.auditService.logEvent({
      actorId: officer.id,
      actorName: officer.fullName,
      actorRole: officer.role,
      action: 'VERIFICATION_REOPENED',
      entityType: 'VERIFICATION',
      entityId: land.landId,
      previousValue: { status: previousStatus },
      newValue: {
        status: VerificationStatus.REQUIRES_CORRECTION,
        reason: dto.reason,
        reopenedBy: officer.fullName,
        reopenedAt: new Date(),
      },
    });

    return {
      success: true,
      status: saved.status,
      previousStatus,
      reopenedBy: officer.fullName,
      reason: dto.reason,
      reopenedAt: new Date(),
    };
  }

  async flagCorrectionOrReject(
    landId: string,
    departmentId: string,
    action: 'REQUIRES_CORRECTION' | 'REJECTED',
    reason: string,
    officer: AuthenticatedUser,
  ): Promise<LandVerification> {
    const land = await this.landRepo.findOne({
      where: [{ id: landId }, { landId: landId.toUpperCase() }],
    });

    if (!land) {
      throw new NotFoundException(`Land parcel ${landId} not found.`);
    }

    validateLandJurisdiction(officer, land);

    let verification = await this.verificationRepo.findOne({
      where: { landId: land.id, departmentId },
    });

    if (!verification) {
      verification = this.verificationRepo.create({
        id: `ver_${Date.now()}_${uuidv4().slice(0, 8)}`,
        landId: land.id,
        departmentId,
      });
    }

    verification.status =
      action === 'REJECTED'
        ? VerificationStatus.REJECTED
        : VerificationStatus.REQUIRES_CORRECTION;
    verification.remarks = `[${action}] ${reason}`;
    verification.officerId = officer.id;
    if (action === 'REJECTED') {
      verification.rejectedAt = new Date();
    }
    const saved = await this.verificationRepo.save(verification);

    land.status =
      action === 'REJECTED'
        ? LandStatus.REJECTED
        : LandStatus.REQUIRES_CORRECTION;
    if (action === 'REJECTED') {
      land.isDisputed = true;
      land.disputeDetails = reason;
    }
    await this.landRepo.save(land);

    await this.auditService.logEvent({
      actorId: officer.id,
      actorName: officer.fullName,
      actorRole: officer.role,
      action: action === 'REJECTED' ? 'VERIFICATION_REJECTED' : 'REQUIRES_CORRECTION',
      entityType: 'VERIFICATION',
      entityId: land.landId,
      newValue: { action, reason, departmentId },
    });

    return saved;
  }
}
