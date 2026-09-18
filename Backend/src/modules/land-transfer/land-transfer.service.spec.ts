import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { LandTransferService } from './land-transfer.service';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { LandOwner } from '../lands/entities/land-owner.entity';
import { LandOwnershipHistory } from '../lands/entities/land-ownership-history.entity';
import { LandTransfer } from './entities/land-transfer.entity';
import { LandTransferTransaction } from './entities/land-transfer-transaction.entity';
import { LandVerification } from '../verification/entities/land-verification.entity';
import { OutboxEvent } from '../../integrations/kafka/entities/outbox-event.entity';
import { IdempotencyRecord } from '../../common/entities/idempotency-record.entity';
import { Neo4jService } from '../../integrations/neo4j/neo4j.service';
import { KafkaProducerService } from '../../integrations/kafka/kafka-producer.service';
import { RedisService } from '../../integrations/redis/redis.service';
import { AuditService } from '../audit/audit.service';
import { DataSource } from 'typeorm';
import { TransferType, OwnershipType, LandStatus } from '../../common/constants/status.enum';
import { OfficerRole } from '../../common/constants/roles.enum';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

describe('LandTransferService', () => {
  let service: LandTransferService;
  let dataSource: any;
  let queryRunner: any;
  let auditService: any;
  let kafkaProducer: any;
  let neo4jService: any;
  let redisService: any;
  let idempotencyRepo: any;

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
    permissions: ['CREATE_TRANSFER'],
    scope: {
      stateId: 'state_tn',
      districtId: 'dist_che',
      talukId: 'taluk_amb',
      villageId: 'vil_amb_ot',
    },
  };

  const mockCurrentOwner = {
    id: 'own_p101_1',
    ownerName: 'Ramesh Kumar',
    ownerIdHash: 'PAN:ABCDE1234F',
    isCurrentOwner: true,
    acquiredDate: new Date('2020-01-01'),
  };

  const mockLand: any = {
    id: 'uuid_land_101',
    landId: 'TN-CHE-101',
    stateId: 'state_tn',
    districtId: 'dist_che',
    talukId: 'taluk_amb',
    villageId: 'vil_amb_ot',
    status: LandStatus.REQUIRES_REGISTRATION_VERIFICATION,
    currentOwnerId: 'own_p101_1',
    owners: [mockCurrentOwner],
  };

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        create: jest.fn((entityClass, data) => ({ ...data, id: data?.id || 'gen_id' })),
        save: jest.fn((entityClassOrData, data) => Promise.resolve(data || entityClassOrData)),
      },
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    auditService = { logEvent: jest.fn().mockResolvedValue(true) };
    kafkaProducer = { emitEvent: jest.fn().mockResolvedValue(true) };
    neo4jService = { recordOwnershipTransfer: jest.fn().mockResolvedValue(true) };
    redisService = { del: jest.fn().mockResolvedValue(1) };
    idempotencyRepo = { findOne: jest.fn().mockResolvedValue(null), save: jest.fn().mockResolvedValue(true) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LandTransferService,
        { provide: DataSource, useValue: dataSource },
        { provide: getRepositoryToken(LandParcel), useValue: {} },
        { provide: getRepositoryToken(LandOwner), useValue: {} },
        { provide: getRepositoryToken(LandOwnershipHistory), useValue: {} },
        { provide: getRepositoryToken(LandTransfer), useValue: {} },
        { provide: getRepositoryToken(LandTransferTransaction), useValue: {} },
        { provide: getRepositoryToken(LandVerification), useValue: {} },
        { provide: getRepositoryToken(OutboxEvent), useValue: {} },
        { provide: getRepositoryToken(IdempotencyRecord), useValue: idempotencyRepo },
        { provide: AuditService, useValue: auditService },
        { provide: KafkaProducerService, useValue: kafkaProducer },
        { provide: Neo4jService, useValue: neo4jService },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get<LandTransferService>(LandTransferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeOwnershipTransfer', () => {
    it('should successfully execute ownership transfer in PostgreSQL transaction', async () => {
      queryRunner.manager.findOne.mockImplementation((entity: any) => {
        if (entity === LandParcel) return Promise.resolve(mockLand);
        if (entity === LandTransfer) return Promise.resolve(null);
        return Promise.resolve(null);
      });

      const dto: any = {
        landId: 'TN-CHE-101',
        previousOwnerId: 'own_p101_1',
        newOwnerName: 'Lakshmi Narayanan',
        newOwnerIdHash: 'PAN:XYZ987654K',
        newOwnershipType: OwnershipType.INDIVIDUAL,
        transferType: TransferType.SALE,
        deedNumber: 'DEED/TN/2026/99',
        registrationDate: '2026-08-28',
        considerationAmountINR: 5000000,
        sroOffice: 'Ambattur SRO',
      };

      const result = await service.executeOwnershipTransfer(dto, mockSubRegistrar);

      expect(result.success).toBe(true);
      expect(result.status).toBe('COMPLETED');
      expect(result.previousOwner.id).toBe('own_p101_1');
      expect(result.newOwner.name).toBe('Lakshmi Narayanan');
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(auditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'OWNER_TRANSFER_COMPLETED' }),
      );
    });

    it('should throw HTTP 409 OWNER_STATE_CHANGED when previousOwnerId does not match current owner', async () => {
      queryRunner.manager.findOne.mockImplementation((entity: any) => {
        if (entity === LandParcel) return Promise.resolve(mockLand);
        return Promise.resolve(null);
      });

      const dto: any = {
        landId: 'TN-CHE-101',
        previousOwnerId: 'WRONG_OWNER_ID',
        newOwnerName: 'Lakshmi Narayanan',
        newOwnerIdHash: 'PAN:XYZ987654K',
        transferType: TransferType.SALE,
        deedNumber: 'DEED/TN/2026/99',
        registrationDate: '2026-08-28',
        considerationAmountINR: 5000000,
      };

      await expect(
        service.executeOwnershipTransfer(dto, mockSubRegistrar),
      ).rejects.toThrow(ConflictException);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when officer operates outside jurisdiction', async () => {
      const outOfScopeLand = { ...mockLand, talukId: 'other_taluk' };
      queryRunner.manager.findOne.mockResolvedValue(outOfScopeLand);

      const dto: any = {
        landId: 'TN-CHE-101',
        previousOwnerId: 'own_p101_1',
        newOwnerName: 'Lakshmi Narayanan',
        transferType: TransferType.SALE,
        deedNumber: 'DEED/TN/2026/99',
        registrationDate: '2026-08-28',
      };

      await expect(
        service.executeOwnershipTransfer(dto, mockSubRegistrar),
      ).rejects.toThrow(ForbiddenException);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should return cached response for duplicate Idempotency-Key', async () => {
      const cachedResponse = {
        success: true,
        transactionId: 'TX-IDEMPOTENT-100',
        status: 'COMPLETED',
      };
      idempotencyRepo.findOne.mockResolvedValue({ responseBody: cachedResponse });

      const dto: any = {
        landId: 'TN-CHE-101',
        previousOwnerId: 'own_p101_1',
        newOwnerName: 'Lakshmi',
        transferType: TransferType.SALE,
        deedNumber: 'DEED/99',
        registrationDate: '2026-08-28',
      };

      const result = await service.executeOwnershipTransfer(dto, mockSubRegistrar, 'KEY_123');

      expect(result).toEqual(cachedResponse);
      expect(queryRunner.startTransaction).not.toHaveBeenCalled();
    });
  });
});
