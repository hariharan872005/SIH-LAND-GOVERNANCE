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
var LandTransferService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LandTransferService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const land_parcel_entity_1 = require("../lands/entities/land-parcel.entity");
const land_owner_entity_1 = require("../lands/entities/land-owner.entity");
const land_ownership_history_entity_1 = require("../lands/entities/land-ownership-history.entity");
const land_transfer_entity_1 = require("./entities/land-transfer.entity");
const land_transfer_transaction_entity_1 = require("./entities/land-transfer-transaction.entity");
const land_verification_entity_1 = require("../verification/entities/land-verification.entity");
const outbox_event_entity_1 = require("../../integrations/kafka/entities/outbox-event.entity");
const idempotency_record_entity_1 = require("../../common/entities/idempotency-record.entity");
const status_enum_1 = require("../../common/constants/status.enum");
const roles_enum_1 = require("../../common/constants/roles.enum");
const neo4j_service_1 = require("../../integrations/neo4j/neo4j.service");
const kafka_producer_service_1 = require("../../integrations/kafka/kafka-producer.service");
const events_enum_1 = require("../../common/constants/events.enum");
const redis_service_1 = require("../../integrations/redis/redis.service");
const audit_service_1 = require("../audit/audit.service");
const jurisdiction_scope_guard_1 = require("../../common/guards/jurisdiction-scope.guard");
const uuid_1 = require("uuid");
let LandTransferService = LandTransferService_1 = class LandTransferService {
    constructor(landRepo, ownerRepo, historyRepo, transferRepo, txRepo, verificationRepo, outboxRepo, idempotencyRepo, neo4jService, kafkaProducer, redisService, auditService, dataSource) {
        this.landRepo = landRepo;
        this.ownerRepo = ownerRepo;
        this.historyRepo = historyRepo;
        this.transferRepo = transferRepo;
        this.txRepo = txRepo;
        this.verificationRepo = verificationRepo;
        this.outboxRepo = outboxRepo;
        this.idempotencyRepo = idempotencyRepo;
        this.neo4jService = neo4jService;
        this.kafkaProducer = kafkaProducer;
        this.redisService = redisService;
        this.auditService = auditService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(LandTransferService_1.name);
    }
    async executeOwnershipTransfer(dto, subRegistrar, idempotencyKey) {
        if (idempotencyKey) {
            const existingKey = await this.idempotencyRepo.findOne({
                where: { idempotencyKey },
            });
            if (existingKey) {
                this.logger.log(`Returning idempotent cached response for key ${idempotencyKey}`);
                return existingKey.responseBody;
            }
        }
        if (subRegistrar.role !== roles_enum_1.OfficerRole.SUB_REGISTRAR &&
            subRegistrar.role !== roles_enum_1.OfficerRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only a Sub-Registrar or Super Admin can register land transfers.');
        }
        const considerationAmount = dto.considerationAmount ?? dto.considerationAmountINR ?? 0;
        if (dto.transferType === status_enum_1.TransferType.SALE && (considerationAmount === undefined || considerationAmount === null)) {
            throw new common_1.BadRequestException('considerationAmount is required for SALE transfer type.');
        }
        const newOwnerName = dto.newOwner?.ownerName || dto.newOwnerName || 'Unknown Transferee';
        const newOwnerIdHash = dto.newOwner?.ownerIdHash || dto.newOwnerIdHash || `HASH-${(0, uuid_1.v4)().slice(0, 8)}`;
        const newOwnershipType = dto.newOwner?.ownershipType || dto.newOwnershipType || status_enum_1.OwnershipType.INDIVIDUAL;
        const newOwnerId = dto.newOwner?.ownerId || `own_${Date.now()}_${(0, uuid_1.v4)().slice(0, 8)}`;
        const sroOffice = dto.registrationOffice || dto.sroOffice || 'Sub-Registrar Office';
        const regDate = new Date(dto.registrationDate);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const landBase = await queryRunner.manager.findOne(land_parcel_entity_1.LandParcel, {
                where: [{ id: dto.landId }, { landId: dto.landId.toUpperCase() }],
                lock: { mode: 'pessimistic_write' },
            });
            if (!landBase) {
                throw new common_1.NotFoundException(`Land parcel ${dto.landId} not found.`);
            }
            const land = await queryRunner.manager.findOne(land_parcel_entity_1.LandParcel, {
                where: { id: landBase.id },
                relations: ['owners', 'state', 'district', 'taluk', 'village'],
            });
            if (!land) {
                throw new common_1.NotFoundException(`Land parcel ${dto.landId} not found.`);
            }
            (0, jurisdiction_scope_guard_1.validateLandJurisdiction)(subRegistrar, land);
            const surveyVerification = await queryRunner.manager.findOne(land_verification_entity_1.LandVerification, {
                where: { landId: land.id, departmentId: 'dept_surv_02' },
            });
            if (!surveyVerification || surveyVerification.status !== status_enum_1.VerificationStatus.VERIFIED) {
                throw new common_1.BadRequestException({
                    success: false,
                    code: 'SURVEY_VERIFICATION_REQUIRED',
                    message: `Survey Verification Required: Land parcel ${land.landId} must be demarcated and verified by the Survey Department (DGPS boundary vector) before Sub-Registrar deed registration can proceed.`,
                });
            }
            const currentOwner = land.owners?.find((o) => o.isCurrentOwner) || land.owners?.[0];
            if (!currentOwner) {
                throw new common_1.NotFoundException(`Current owner for land parcel ${land.landId} not found.`);
            }
            const prevOwnerIdMatches = !dto.previousOwnerId ||
                dto.previousOwnerId === currentOwner.id ||
                dto.previousOwnerId === currentOwner.ownerIdHash ||
                dto.previousOwnerId === currentOwner.ownerName ||
                (land.currentOwnerId && dto.previousOwnerId === land.currentOwnerId);
            if (!prevOwnerIdMatches) {
                this.logger.warn(`Conflict detected: previousOwnerId '${dto.previousOwnerId}' does not match current owner '${currentOwner.id}' for land ${land.landId}`);
                throw new common_1.ConflictException({
                    success: false,
                    code: 'OWNER_STATE_CHANGED',
                    message: 'The current ownership has changed. Refresh the land record and try again.',
                });
            }
            const existingDeed = await queryRunner.manager.findOne(land_transfer_entity_1.LandTransfer, {
                where: { deedNumber: dto.deedNumber },
            });
            if (existingDeed) {
                throw new common_1.ConflictException(`Deed number '${dto.deedNumber}' has already been registered.`);
            }
            const transactionId = dto.transactionReference || `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
            const regNum = dto.registrationNumber || `REG/SRO/${Math.floor(1000 + Math.random() * 9000)}/${new Date().getFullYear()}`;
            await queryRunner.manager.insert(land_transfer_entity_1.LandTransfer, {
                id: `trf_${Date.now()}_${(0, uuid_1.v4)().slice(0, 8)}`,
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
            await queryRunner.manager.insert(land_transfer_transaction_entity_1.LandTransferTransaction, {
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
            await queryRunner.manager.update(land_owner_entity_1.LandOwner, currentOwner.id, {
                isCurrentOwner: false,
                relinquishedDate: regDate,
            });
            await queryRunner.manager.insert(land_ownership_history_entity_1.LandOwnershipHistory, {
                id: `hist_prev_${(0, uuid_1.v4)().slice(0, 8)}`,
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
            await queryRunner.manager.insert(land_owner_entity_1.LandOwner, {
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
            const newHistoryId = `hist_new_${(0, uuid_1.v4)().slice(0, 8)}`;
            await queryRunner.manager.insert(land_ownership_history_entity_1.LandOwnershipHistory, {
                id: newHistoryId,
                landId: land.id,
                ownerId: newOwnerId,
                ownerName: newOwnerName,
                ownerIdHash: newOwnerIdHash,
                ownershipStartDate: regDate,
                ownershipEndDate: null,
                acquisitionType: dto.transferType,
                transactionId,
                isCurrent: true,
            });
            await queryRunner.manager.update(land_parcel_entity_1.LandParcel, land.id, {
                currentOwnerId: newOwnerId,
                status: status_enum_1.LandStatus.REQUIRES_MUNICIPAL_VERIFICATION,
            });
            const existingRegVerification = await queryRunner.manager.findOne(land_verification_entity_1.LandVerification, {
                where: { landId: land.id, departmentId: 'dept_reg_03' },
            });
            if (existingRegVerification) {
                await queryRunner.manager.update(land_verification_entity_1.LandVerification, existingRegVerification.id, {
                    status: status_enum_1.VerificationStatus.VERIFIED,
                    officerId: subRegistrar.id,
                    remarks: `Deed #${dto.deedNumber} registered under ${dto.transferType}. Conveyance from ${currentOwner.ownerName} to ${newOwnerName}. ${dto.remarks || ''}`,
                    referenceDocketNumber: dto.deedNumber,
                    verifiedAt: new Date(),
                });
            }
            else {
                await queryRunner.manager.insert(land_verification_entity_1.LandVerification, {
                    id: `ver_${(0, uuid_1.v4)().slice(0, 8)}`,
                    landId: land.id,
                    departmentId: 'dept_reg_03',
                    officerId: subRegistrar.id,
                    status: status_enum_1.VerificationStatus.VERIFIED,
                    remarks: `Deed #${dto.deedNumber} registered under ${dto.transferType}. Conveyance from ${currentOwner.ownerName} to ${newOwnerName}. ${dto.remarks || ''}`,
                    referenceDocketNumber: dto.deedNumber,
                    verifiedAt: new Date(),
                });
            }
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
            const kafkaPayload = {
                eventType: 'LAND_TRANSFER_COMPLETED',
                landId: land.landId,
                transactionId,
                previousOwnerId: currentOwner.id,
                newOwnerId: newOwnerId,
                transferType: dto.transferType,
                timestamp: new Date().toISOString(),
            };
            const outbox = queryRunner.manager.create(outbox_event_entity_1.OutboxEvent, {
                id: `outbox_${(0, uuid_1.v4)().slice(0, 8)}`,
                aggregateType: 'LAND_TRANSFER',
                aggregateId: land.landId,
                eventType: events_enum_1.DomainEventType.LAND_TRANSFER_COMPLETED,
                payload: kafkaPayload,
                status: 'PENDING',
            });
            await queryRunner.manager.save(outbox_event_entity_1.OutboxEvent, outbox);
            await queryRunner.commitTransaction();
            this.kafkaProducer.emitEvent(events_enum_1.KafkaTopics.TRANSFER_EVENTS, events_enum_1.DomainEventType.LAND_TRANSFER_COMPLETED, land.landId, 'TRANSACTION', { id: subRegistrar.id, role: subRegistrar.role }, kafkaPayload);
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
            if (idempotencyKey) {
                await this.idempotencyRepo.save(this.idempotencyRepo.create({
                    idempotencyKey,
                    requestPath: '/api/v1/land-transfers',
                    responseStatus: 201,
                    responseBody: response,
                })).catch((e) => this.logger.warn(`Failed to save idempotency record: ${e.message}`));
            }
            return response;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Transfer transaction failed & rolled back: ${err.message}`);
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getTransfersByLand(landId) {
        return this.transferRepo.find({
            where: [{ landId }, { land: { landId: landId.toUpperCase() } }],
            relations: ['verifiedByOfficer'],
            order: { registrationDate: 'DESC' },
        });
    }
    async getOwnershipHistory(landId) {
        return this.historyRepo.find({
            where: [{ landId }, { land: { landId: landId.toUpperCase() } }],
            order: { ownershipStartDate: 'DESC' },
        });
    }
};
exports.LandTransferService = LandTransferService;
exports.LandTransferService = LandTransferService = LandTransferService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(land_parcel_entity_1.LandParcel)),
    __param(1, (0, typeorm_1.InjectRepository)(land_owner_entity_1.LandOwner)),
    __param(2, (0, typeorm_1.InjectRepository)(land_ownership_history_entity_1.LandOwnershipHistory)),
    __param(3, (0, typeorm_1.InjectRepository)(land_transfer_entity_1.LandTransfer)),
    __param(4, (0, typeorm_1.InjectRepository)(land_transfer_transaction_entity_1.LandTransferTransaction)),
    __param(5, (0, typeorm_1.InjectRepository)(land_verification_entity_1.LandVerification)),
    __param(6, (0, typeorm_1.InjectRepository)(outbox_event_entity_1.OutboxEvent)),
    __param(7, (0, typeorm_1.InjectRepository)(idempotency_record_entity_1.IdempotencyRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        neo4j_service_1.Neo4jService,
        kafka_producer_service_1.KafkaProducerService,
        redis_service_1.RedisService,
        audit_service_1.AuditService,
        typeorm_2.DataSource])
], LandTransferService);
//# sourceMappingURL=land-transfer.service.js.map