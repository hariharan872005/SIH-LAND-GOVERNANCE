import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { LandOwner } from '../lands/entities/land-owner.entity';
import { LandOwnershipHistory } from '../lands/entities/land-ownership-history.entity';
import { LandTransfer } from './entities/land-transfer.entity';
import { LandTransferTransaction } from './entities/land-transfer-transaction.entity';
import { LandVerification } from '../verification/entities/land-verification.entity';
import { OutboxEvent } from '../../integrations/kafka/entities/outbox-event.entity';
import { IdempotencyRecord } from '../../common/entities/idempotency-record.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { LandStatus, TransferType, VerificationStatus, OwnershipType } from '../../common/constants/status.enum';
import { OfficerRole } from '../../common/constants/roles.enum';
import { Neo4jService } from '../../integrations/neo4j/neo4j.service';
import { KafkaProducerService } from '../../integrations/kafka/kafka-producer.service';
import { KafkaTopics, DomainEventType } from '../../common/constants/events.enum';
import { RedisService } from '../../integrations/redis/redis.service';
import { AuditService } from '../audit/audit.service';
import { validateLandJurisdiction } from '../../common/guards/jurisdiction-scope.guard';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LandTransferService {
  private readonly logger = new Logger(LandTransferService.name);

  constructor(
    @InjectRepository(LandParcel)
    private readonly landRepo: Repository<LandParcel>,
    @InjectRepository(LandOwner)
    private readonly ownerRepo: Repository<LandOwner>,
    @InjectRepository(LandOwnershipHistory)
    private readonly historyRepo: Repository<LandOwnershipHistory>,
    @InjectRepository(LandTransfer)
    private readonly transferRepo: Repository<LandTransfer>,
    @InjectRepository(LandTransferTransaction)
    private readonly txRepo: Repository<LandTransferTransaction>,
    @InjectRepository(LandVerification)
    private readonly verificationRepo: Repository<LandVerification>,
    @InjectRepository(OutboxEvent)
    private readonly outboxRepo: Repository<OutboxEvent>,
    @InjectRepository(IdempotencyRecord)
    private readonly idempotencyRepo: Repository<IdempotencyRecord>,
    private readonly neo4jService: Neo4jService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async executeOwnershipTransfer(
    dto: CreateTransferDto,
    subRegistrar: AuthenticatedUser,
    idempotencyKey?: string,
  ) {
    // 0. Idempotency Check (Section 16)
    if (idempotencyKey) {
      const existingKey = await this.idempotencyRepo.findOne({
        where: { idempotencyKey },
      });
      if (existingKey) {
        this.logger.log(`Returning idempotent cached response for key ${idempotencyKey}`);
        return existingKey.responseBody;
      }
    }

    // 1. Authenticate & Role Check (Section 1 & 5)
    if (
      subRegistrar.role !== OfficerRole.SUB_REGISTRAR &&
      subRegistrar.role !== OfficerRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Only a Sub-Registrar or Super Admin can register land transfers.');
    }

    // 2. Validate Transfer Type business rules (Section 9)
    const considerationAmount = dto.considerationAmount ?? dto.considerationAmountINR ?? 0;
    if (dto.transferType === TransferType.SALE && (considerationAmount === undefined || considerationAmount === null)) {
      throw new BadRequestException('considerationAmount is required for SALE transfer type.');
    }

    // Prepare parameters for transaction
    const newOwnerName = dto.newOwner?.ownerName || dto.newOwnerName || 'Unknown Transferee';
    const newOwnerIdHash = dto.newOwner?.ownerIdHash || dto.newOwnerIdHash || `HASH-${uuidv4().slice(0, 8)}`;
    const newOwnershipType = dto.newOwner?.ownershipType || dto.newOwnershipType || OwnershipType.INDIVIDUAL;
    const newOwnerId = dto.newOwner?.ownerId || `own_${Date.now()}_${uuidv4().slice(0, 8)}`;

    const sroOffice = dto.registrationOffice || dto.sroOffice || 'Sub-Registrar Office';
    const regDate = new Date(dto.registrationDate);

    // Start PostgreSQL Transaction (Section 6 & 15 Concurrent Safety)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 3. Load Land with PESSIMISTIC WRITE LOCK (Row Lock on base table to avoid outer join FOR UPDATE error)
      const landBase = await queryRunner.manager.findOne(LandParcel, {
        where: [{ id: dto.landId }, { landId: dto.landId.toUpperCase() }],
        lock: { mode: 'pessimistic_write' },
      });

      if (!landBase) {
        throw new NotFoundException(`Land parcel ${dto.landId} not found.`);
      }

      const land = await queryRunner.manager.findOne(LandParcel, {
        where: { id: landBase.id },
        relations: ['owners', 'state', 'district', 'taluk', 'village'],
      });

      if (!land) {
        throw new NotFoundException(`Land parcel ${dto.landId} not found.`);
      }

      // 4. Validate Jurisdiction Scope (Section 18 & 1)
      validateLandJurisdiction(subRegistrar, land);

      // 4.5 Mandatory Pre-Requisite Check: Survey Department Verification must be VERIFIED
      const surveyVerification = await queryRunner.manager.findOne(LandVerification, {
        where: { landId: land.id, departmentId: 'dept_surv_02' },
      });

      if (!surveyVerification || surveyVerification.status !== VerificationStatus.VERIFIED) {
        throw new BadRequestException({
          success: false,
          code: 'SURVEY_VERIFICATION_REQUIRED',
          message: `Survey Verification Required: Land parcel ${land.landId} must be demarcated and verified by the Survey Department (DGPS boundary vector) before Sub-Registrar deed registration can proceed.`,
        });
      }

      // 5. Find current authoritative owner & Validate previousOwnerId (Section 5 & 15)
      const currentOwner = land.owners?.find((o) => o.isCurrentOwner) || land.owners?.[0];

      if (!currentOwner) {
        throw new NotFoundException(`Current owner for land parcel ${land.landId} not found.`);
      }

      const prevOwnerIdMatches =
        !dto.previousOwnerId ||
        dto.previousOwnerId === currentOwner.id ||
        dto.previousOwnerId === currentOwner.ownerIdHash ||
        dto.previousOwnerId === currentOwner.ownerName ||
        (land.currentOwnerId && dto.previousOwnerId === land.currentOwnerId);

      if (!prevOwnerIdMatches) {
        this.logger.warn(
          `Conflict detected: previousOwnerId '${dto.previousOwnerId}' does not match current owner '${currentOwner.id}' for land ${land.landId}`,
        );
        throw new ConflictException({
          success: false,
          code: 'OWNER_STATE_CHANGED',
          message: 'The current ownership has changed. Refresh the land record and try again.',
        });
      }

      // 6. Check for duplicate deed number / transaction
      const existingDeed = await queryRunner.manager.findOne(LandTransfer, {
        where: { deedNumber: dto.deedNumber },
      });
      if (existingDeed) {
        throw new ConflictException(`Deed number '${dto.deedNumber}' has already been registered.`);
      }

      const transactionId =
        dto.transactionReference || `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const regNum = dto.registrationNumber || `REG/SRO/${Math.floor(1000 + Math.random() * 9000)}/${new Date().getFullYear()}`;

      // 7. Create LAND_TRANSFER Record (Section 8)
      await queryRunner.manager.insert(LandTransfer, {
        id: `trf_${Date.now()}_${uuidv4().slice(0, 8)}`,
        transactionId,
        landId: land.id,
        previousOwnerId: currentOwner.id,
        newOwnerId: newOwnerId,
        transferType: dto.transferType,
        deedNumber: dto.deedNumber,
        registrationNumber: regNum,
        registrationDate: regDate,
        registrationOffice: sroOffice,
        transactionReference: transactionId,
        considerationAmount,
        status: 'COMPLETED',
        verifiedBy: subRegistrar.id,
        verifiedAt: new Date(),
        remarks: dto.remarks || 'Title conveyance registered under Indian Registration Act.',
      });

      // Also save into LandTransferTransaction for backwards compatibility
      await queryRunner.manager.insert(LandTransferTransaction, {
        id: transactionId,
        landId: land.id,
        fromOwnerId: currentOwner.id,
        fromOwnerName: currentOwner.ownerName,
        toOwnerId: newOwnerId,
        toOwnerName: newOwnerName,
        toOwnerIdHash: newOwnerIdHash,
        transferType: dto.transferType,
        deedNumber: dto.deedNumber,
        registrationNumber: regNum,
        registrationDate: regDate,
        considerationAmountINR: considerationAmount,
        subRegistrarOffice: sroOffice,
        status: 'COMPLETED',
        createdByOfficerId: subRegistrar.id,
        remarks: dto.remarks,
      });

      // 8. Preserve Previous Owner & Create Ownership History (Section 7)
      await queryRunner.manager.update(LandOwner, currentOwner.id, {
        isCurrentOwner: false,
        relinquishedDate: regDate,
      });

      await queryRunner.manager.insert(LandOwnershipHistory, {
        id: `hist_prev_${uuidv4().slice(0, 8)}`,
        landId: land.id,
        ownerId: currentOwner.id,
        ownerName: currentOwner.ownerName,
        ownerIdHash: currentOwner.ownerIdHash,
        ownershipStartDate: currentOwner.acquiredDate || currentOwner.createdAt || regDate,
        ownershipEndDate: regDate,
        acquisitionType: currentOwner.ownershipType || 'SALE',
        transactionId: currentOwner.deedRegistrationNumber || 'INITIAL',
        isCurrent: false,
      });

      // 9. Create New Active Owner & Ownership History Record (Section 7)
      await queryRunner.manager.insert(LandOwner, {
        id: newOwnerId,
        landId: land.id,
        ownerName: newOwnerName,
        ownerIdHash: newOwnerIdHash,
        maskedAadhaarOrId: `XXXX-XXXX-${newOwnerIdHash.slice(-4) || '8831'}`,
        ownershipType: newOwnershipType,
        ownershipPercentage: 100,
        isCurrentOwner: true,
        acquiredDate: regDate,
        deedRegistrationNumber: dto.deedNumber,
        mutationDocketNumber: `MUT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        considerationAmountINR: considerationAmount,
      });

      const newHistoryId = `hist_new_${uuidv4().slice(0, 8)}`;
      await queryRunner.manager.insert(LandOwnershipHistory, {
        id: newHistoryId,
        landId: land.id,
        ownerId: newOwnerId,
        ownerName: newOwnerName,
        ownerIdHash: newOwnerIdHash,
        ownershipStartDate: regDate,
        ownershipEndDate: null, // NULL for current owner per Section 7
        acquisitionType: dto.transferType,
        transactionId,
        isCurrent: true,
      });

      // 10. Update Land.currentOwnerId & status, and update Registration Verification Pillar (Section 6, 14 & 20)
      await queryRunner.manager.update(LandParcel, land.id, {
        currentOwnerId: newOwnerId,
        status: LandStatus.REQUIRES_MUNICIPAL_VERIFICATION,
      });

      const existingRegVerification = await queryRunner.manager.findOne(LandVerification, {
        where: { landId: land.id, departmentId: 'dept_reg_03' },
      });

      if (existingRegVerification) {
        await queryRunner.manager.update(LandVerification, existingRegVerification.id, {
          status: VerificationStatus.VERIFIED,
          officerId: subRegistrar.id,
          remarks: `Deed #${dto.deedNumber} registered under ${dto.transferType}. Conveyance from ${currentOwner.ownerName} to ${newOwnerName}. ${dto.remarks || ''}`,
          referenceDocketNumber: dto.deedNumber,
          verifiedAt: new Date(),
        });
      } else {
        await queryRunner.manager.insert(LandVerification, {
          id: `ver_${uuidv4().slice(0, 8)}`,
          landId: land.id,
          departmentId: 'dept_reg_03',
          officerId: subRegistrar.id,
          status: VerificationStatus.VERIFIED,
          remarks: `Deed #${dto.deedNumber} registered under ${dto.transferType}. Conveyance from ${currentOwner.ownerName} to ${newOwnerName}. ${dto.remarks || ''}`,
          referenceDocketNumber: dto.deedNumber,
          verifiedAt: new Date(),
        });
      }

      // 11. Create Audit Records (Section 17)
      await this.auditService.logEvent({
        actorId: subRegistrar.id,
        actorName: subRegistrar.fullName,
        actorRole: subRegistrar.role,
        action: 'OWNER_TRANSFER_INITIATED',
        entityType: 'LAND_TRANSFER',
        entityId: transactionId,
        previousValue: { currentOwnerId: currentOwner.id, currentOwnerName: currentOwner.ownerName },
        newValue: { newOwnerId, newOwnerName, deedNumber: dto.deedNumber },
      });

      await this.auditService.logEvent({
        actorId: subRegistrar.id,
        actorName: subRegistrar.fullName,
        actorRole: subRegistrar.role,
        action: 'OWNERSHIP_HISTORY_CREATED',
        entityType: 'LAND_OWNERSHIP_HISTORY',
        entityId: land.landId,
        newValue: { historyId: newHistoryId, ownerId: newOwnerId, ownerName: newOwnerName },
      });

      await this.auditService.logEvent({
        actorId: subRegistrar.id,
        actorName: subRegistrar.fullName,
        actorRole: subRegistrar.role,
        action: 'CURRENT_OWNER_UPDATED',
        entityType: 'LAND',
        entityId: land.landId,
        previousValue: { currentOwnerId: currentOwner.id },
        newValue: { currentOwnerId: newOwnerId },
      });

      await this.auditService.logEvent({
        actorId: subRegistrar.id,
        actorName: subRegistrar.fullName,
        actorRole: subRegistrar.role,
        action: 'OWNER_TRANSFER_COMPLETED',
        entityType: 'LAND_TRANSFER',
        entityId: transactionId,
        newValue: {
          transactionId,
          previousOwner: currentOwner.ownerName,
          newOwner: newOwnerName,
          transferType: dto.transferType,
          deedNumber: dto.deedNumber,
        },
      });

      // 12. Transactional Outbox Event (Section 11)
      const kafkaPayload = {
        eventType: 'LAND_TRANSFER_COMPLETED',
        landId: land.landId,
        transactionId,
        previousOwnerId: currentOwner.id,
        newOwnerId: newOwnerId,
        transferType: dto.transferType,
        timestamp: new Date().toISOString(),
      };

      const outbox = queryRunner.manager.create(OutboxEvent, {
        id: `outbox_${uuidv4().slice(0, 8)}`,
        aggregateType: 'LAND_TRANSFER',
        aggregateId: land.landId,
        eventType: DomainEventType.LAND_TRANSFER_COMPLETED,
        payload: kafkaPayload,
        status: 'PENDING',
      });
      await queryRunner.manager.save(OutboxEvent, outbox);

      // Commit DB Transaction
      await queryRunner.commitTransaction();

      // 13. Post-Commit Actions (Publish Event & Neo4j Update) (Section 10 & 11)
      this.kafkaProducer.emitEvent(
        KafkaTopics.TRANSFER_EVENTS,
        DomainEventType.LAND_TRANSFER_COMPLETED,
        land.landId,
        'TRANSACTION',
        { id: subRegistrar.id, role: subRegistrar.role },
        kafkaPayload,
      );

      this.neo4jService.recordOwnershipTransfer({
        transactionId,
        landId: land.landId,
        fromOwnerId: currentOwner.id,
        fromOwnerName: currentOwner.ownerName,
        toOwnerId: newOwnerId,
        toOwnerName: newOwnerName,
        toOwnerIdHash: newOwnerIdHash,
        deedNumber: dto.deedNumber,
        registrationDate: dto.registrationDate,
        transferType: dto.transferType,
        considerationAmountINR: considerationAmount,
        sroOffice,
      }).catch((e) => this.logger.error(`Neo4j sync deferred: ${e.message}`));

      // Invalidate Redis Caches
      await this.redisService.del(`land:${land.landId}`);
      await this.redisService.del(`digital_twin:${land.landId}`);

      const response = {
        success: true,
        transactionId,
        previousOwner: {
          id: currentOwner.id,
          name: currentOwner.ownerName,
        },
        newOwner: {
          id: newOwnerId,
          name: newOwnerName,
        },
        status: 'COMPLETED',
      };

      // Store Idempotency Record if key provided
      if (idempotencyKey) {
        await this.idempotencyRepo.save(
          this.idempotencyRepo.create({
            idempotencyKey,
            requestPath: '/api/v1/land-transfers',
            responseStatus: 201,
            responseBody: response,
          }),
        ).catch((e) => this.logger.warn(`Failed to save idempotency record: ${e.message}`));
      }

      return response;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Transfer transaction failed & rolled back: ${err.message}`);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransfersByLand(landId: string): Promise<LandTransfer[]> {
    return this.transferRepo.find({
      where: [{ landId }, { land: { landId: landId.toUpperCase() } }],
      relations: ['verifiedByOfficer'],
      order: { registrationDate: 'DESC' },
    });
  }

  async getOwnershipHistory(landId: string): Promise<LandOwnershipHistory[]> {
    return this.historyRepo.find({
      where: [{ landId }, { land: { landId: landId.toUpperCase() } }],
      order: { ownershipStartDate: 'DESC' },
    });
  }
}
