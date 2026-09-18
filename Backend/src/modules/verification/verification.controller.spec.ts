import { Test, TestingModule } from '@nestjs/testing';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { VerificationStatus } from '../../common/constants/status.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

describe('VerificationController', () => {
  let controller: VerificationController;
  let service: any;

  const mockOfficer: any = {
    id: 'off_sub_01',
    fullName: 'A. Natarajan',
    role: 'SUB_REGISTRAR',
    departmentId: 'dept_reg_03',
  };

  beforeEach(async () => {
    service = {
      getVerificationsByLand: jest.fn().mockResolvedValue([]),
      verifyRegistration: jest.fn().mockResolvedValue({
        success: true,
        status: VerificationStatus.VERIFIED,
        verifiedBy: mockOfficer,
        verifiedAt: new Date(),
      }),
      reopenVerification: jest.fn().mockResolvedValue({
        success: true,
        status: VerificationStatus.REQUIRES_CORRECTION,
      }),
      flagCorrectionOrReject: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationController],
      providers: [
        {
          provide: VerificationService,
          useValue: service,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<VerificationController>(VerificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('verifyRegistration calls service.verifyRegistration', async () => {
    const dto = { landId: 'TN-CHE-101', remarks: 'Deed ledger clear' };
    const res = await controller.verifyRegistration(dto, mockOfficer);
    expect(service.verifyRegistration).toHaveBeenCalledWith(dto, mockOfficer);
    expect(res.success).toBe(true);
    expect(res.status).toBe(VerificationStatus.VERIFIED);
  });

  it('reopenVerification calls service.reopenVerification', async () => {
    const dto = { landId: 'TN-CHE-101', reason: 'Audit discrepancy' };
    const res = await controller.reopenVerification(dto, mockOfficer);
    expect(service.reopenVerification).toHaveBeenCalledWith(dto, mockOfficer);
    expect(res.success).toBe(true);
    expect(res.status).toBe(VerificationStatus.REQUIRES_CORRECTION);
  });
});
