import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { LandVerification } from './entities/land-verification.entity';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { AuditService } from '../audit/audit.service';
import { VerificationStatus, LandStatus } from '../../common/constants/status.enum';
import { OfficerRole } from '../../common/constants/roles.enum';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

describe('VerificationService', () => {
  let service: VerificationService;
  let verificationRepo: any;
  let landRepo: any;
  let auditService: any;

  const mockSubRegistrar: AuthenticatedUser = {
    id: 'off_sub_reg_01',
    employeeId: 'GOV-TN-REG-4402',
    fullName: 'A. Natarajan',
    email: 'natarajan@tn.gov.in',
    departmentId: 'dept_reg_03',
    departmentCode: 'REGISTRATION',
    designationId: 'desig_sub_reg',
    designationTitle: 'Sub-Registrar',
    role: OfficerRole.SUB_REGISTRAR,
    permissions: ['VERIFY_REGISTRATION'],
    scope: {
      stateId: 'state_tn',
      districtId: 'dist_che',
      talukId: 'taluk_amb',
      villageId: 'vil_amb_ot',
    },
  };

  const mockLand: any = {
    id: 'uuid_land_101',
    landId: 'TN-CHE-101',
    stateId: 'state_tn',
    districtId: 'dist_che',
    talukId: 'taluk_amb',
    villageId: 'vil_amb_ot',
    status: LandStatus.REQUIRES_REGISTRATION_VERIFICATION,
  };

  beforeEach(async () => {
    verificationRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => ({ ...dto, id: 'ver_123' })),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };

    landRepo = {
      findOne: jest.fn(),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };

    auditService = {
      logEvent: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        {
          provide: getRepositoryToken(LandVerification),
          useValue: verificationRepo,
        },
        {
          provide: getRepositoryToken(LandParcel),
          useValue: landRepo,
        },
        {
          provide: AuditService,
          useValue: auditService,
        },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyRegistration', () => {
    it('should successfully verify registration record and log audit event', async () => {
      landRepo.findOne.mockResolvedValue(mockLand);
      verificationRepo.findOne.mockResolvedValue(null);

      const result = await service.verifyRegistration(
        { landId: 'TN-CHE-101', remarks: 'Deed verified' },
        mockSubRegistrar,
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(VerificationStatus.VERIFIED);
      expect(result.verifiedBy.id).toBe(mockSubRegistrar.id);
      expect(auditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OWNER_VERIFICATION_COMPLETED',
          entityId: 'TN-CHE-101',
        }),
      );
    });

    it('should throw HTTP 409 REGISTRATION_ALREADY_VERIFIED when already verified', async () => {
      landRepo.findOne.mockResolvedValue(mockLand);
      verificationRepo.findOne.mockResolvedValue({
        id: 'ver_123',
        status: VerificationStatus.VERIFIED,
      });

      await expect(
        service.verifyRegistration(
          { landId: 'TN-CHE-101', remarks: 'Duplicate attempt' },
          mockSubRegistrar,
        ),
      ).rejects.toThrow(ConflictException);

      expect(verificationRepo.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if land is outside officer jurisdiction', async () => {
      const outOfScopeLand = { ...mockLand, talukId: 'taluk_other' };
      landRepo.findOne.mockResolvedValue(outOfScopeLand);

      await expect(
        service.verifyRegistration(
          { landId: 'TN-CHE-101' },
          mockSubRegistrar,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('reopenVerification', () => {
    it('should reopen verified record for correction and audit event', async () => {
      landRepo.findOne.mockResolvedValue(mockLand);
      verificationRepo.findOne.mockResolvedValue({
        id: 'ver_123',
        status: VerificationStatus.VERIFIED,
        departmentId: 'dept_reg_03',
      });

      const result = await service.reopenVerification(
        { landId: 'TN-CHE-101', reason: 'Discrepancy found in ledger' },
        mockSubRegistrar,
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(VerificationStatus.REQUIRES_CORRECTION);
      expect(auditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'VERIFICATION_REOPENED',
          entityId: 'TN-CHE-101',
        }),
      );
    });
  });
});
