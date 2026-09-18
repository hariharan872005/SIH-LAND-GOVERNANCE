import { Test, TestingModule } from '@nestjs/testing';
import { LandTransferController } from './land-transfer.controller';
import { LandTransferService } from './land-transfer.service';
import { TransferType } from '../../common/constants/status.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

describe('LandTransferController', () => {
  let controller: LandTransferController;
  let service: any;

  const mockSubRegistrar: any = {
    id: 'off_sub_01',
    fullName: 'A. Natarajan',
    role: 'SUB_REGISTRAR',
  };

  beforeEach(async () => {
    service = {
      executeOwnershipTransfer: jest.fn().mockResolvedValue({
        success: true,
        transactionId: 'TX-1001',
        previousOwner: { id: 'P001', name: 'Ramesh' },
        newOwner: { id: 'P002', name: 'Lakshmi' },
        status: 'COMPLETED',
      }),
      getTransfersByLand: jest.fn().mockResolvedValue([]),
      getOwnershipHistory: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LandTransferController],
      providers: [
        {
          provide: LandTransferService,
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

    controller = module.get<LandTransferController>(LandTransferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('executeTransfer forwards dto, officer, and idempotency header to service', async () => {
    const dto: any = {
      landId: 'TN-CHE-101',
      previousOwnerId: 'P001',
      newOwnerName: 'Lakshmi',
      transferType: TransferType.SALE,
      deedNumber: 'DEED/101',
      registrationDate: '2026-08-28',
    };
    const headers = { 'idempotency-key': 'KEY_999' };

    const res = await controller.executeTransfer(dto, mockSubRegistrar, headers);
    expect(service.executeOwnershipTransfer).toHaveBeenCalledWith(dto, mockSubRegistrar, 'KEY_999');
    expect(res.success).toBe(true);
    expect(res.transactionId).toBe('TX-1001');
  });
});
