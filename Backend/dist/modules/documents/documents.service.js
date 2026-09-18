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
var DocumentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const document_record_entity_1 = require("./entities/document-record.entity");
const land_parcel_entity_1 = require("../lands/entities/land-parcel.entity");
const s3_service_1 = require("../../integrations/s3/s3.service");
const redis_service_1 = require("../../integrations/redis/redis.service");
const status_enum_1 = require("../../common/constants/status.enum");
const audit_service_1 = require("../audit/audit.service");
const uuid_1 = require("uuid");
let DocumentsService = DocumentsService_1 = class DocumentsService {
    constructor(docRepo, landRepo, s3Service, redisService, auditService) {
        this.docRepo = docRepo;
        this.landRepo = landRepo;
        this.s3Service = s3Service;
        this.redisService = redisService;
        this.auditService = auditService;
        this.logger = new common_1.Logger(DocumentsService_1.name);
    }
    async uploadDocument(landId, file, documentType, officer, documentTitle) {
        const cleanLandId = (landId || '').trim();
        const land = await this.landRepo.findOne({
            where: [
                { id: cleanLandId },
                { landId: cleanLandId.toUpperCase() },
                { landId: cleanLandId.toLowerCase() },
                { surveyNumber: cleanLandId },
            ],
        });
        if (!land) {
            throw new common_1.NotFoundException(`Land parcel ${landId} not found.`);
        }
        const docName = documentTitle || file.originalname || `${documentType}_${land.landId}.pdf`;
        const storageKey = `cadastre/${land.landId}/${Date.now()}_${docName.replace(/\s+/g, '_')}`;
        const uploadResult = await this.s3Service.uploadFile(storageKey, file.buffer, file.mimetype);
        const doc = this.docRepo.create({
            id: (0, uuid_1.v4)(),
            landId: land.id,
            documentName: docName,
            documentType: documentType || status_enum_1.DocumentType.SALE_DEED,
            storageKey: uploadResult.storageKey,
            s3Url: uploadResult.s3Url,
            mimeType: file.mimetype || 'application/pdf',
            fileSizeBytes: file.size || 2400000,
            documentHash: uploadResult.documentHash,
            uploadedByOfficerId: officer?.id || null,
            verificationStatus: status_enum_1.VerificationStatus.VERIFIED,
            metadata: {
                scannerModel: 'Canon Flatbed DRS-9900 (NIC Calibrated)',
                verifiedSignature: 'SHA256:ECDSA:GOV_INDIA_ROOT_CA',
                pageCount: 1,
            },
        });
        const saved = await this.docRepo.save(doc);
        try {
            await this.redisService.del(`digital_twin:${land.landId.toUpperCase()}`);
            await this.redisService.del(`digital_twin:${land.id.toUpperCase()}`);
        }
        catch (e) {
            this.logger.warn(`Could not clear redis cache for ${land.landId}: ${e.message}`);
        }
        await this.auditService.logEvent({
            actorId: officer?.id || 'sys_citizen',
            actorName: officer?.fullName || 'Certified Officer',
            actorRole: officer?.role || 'SUPER_ADMIN',
            action: 'DOCUMENT_UPLOADED',
            entityType: 'DOCUMENT',
            entityId: land.landId,
            newValue: {
                documentName: saved.documentName,
                documentType: saved.documentType,
                hash: saved.documentHash,
            },
        });
        return saved;
    }
    async getDocumentsByLand(landId) {
        const cleanLandId = (landId || '').trim();
        const land = await this.landRepo.findOne({
            where: [
                { id: cleanLandId },
                { landId: cleanLandId.toUpperCase() },
                { landId: cleanLandId.toLowerCase() },
                { surveyNumber: cleanLandId },
            ],
        });
        const targetIds = land ? [land.id, land.landId, cleanLandId] : [cleanLandId];
        const docs = await this.docRepo.find({
            where: targetIds.map((id) => ({ landId: id })),
            relations: ['uploadedByOfficer', 'land'],
            order: { createdAt: 'DESC' },
        });
        return Promise.all(docs.map(async (d) => ({
            ...d,
            landId: d.land?.landId || land?.landId || d.landId,
            fileName: d.documentName,
            downloadUrl: await this.s3Service.getPresignedDownloadUrl(d.storageKey),
        })));
    }
    async getAllDocuments(search, documentType) {
        const query = this.docRepo
            .createQueryBuilder('doc')
            .leftJoinAndSelect('doc.uploadedByOfficer', 'officer')
            .leftJoinAndSelect('doc.land', 'land')
            .orderBy('doc.createdAt', 'DESC');
        if (documentType && documentType !== 'ALL') {
            query.andWhere('doc.documentType = :documentType', { documentType });
        }
        if (search) {
            query.andWhere('(doc.documentName ILIKE :search OR land.landId ILIKE :search OR doc.landId ILIKE :search)', { search: `%${search}%` });
        }
        const docs = await query.getMany();
        return Promise.all(docs.map(async (d) => ({
            ...d,
            landId: d.land?.landId || d.landId,
            fileName: d.documentName,
            downloadUrl: await this.s3Service.getPresignedDownloadUrl(d.storageKey),
        })));
    }
    async deleteDocument(docId, officer) {
        const doc = await this.docRepo.findOne({
            where: { id: docId },
            relations: ['land'],
        });
        if (!doc) {
            throw new common_1.NotFoundException(`Document with ID ${docId} not found.`);
        }
        if (doc.storageKey) {
            await this.s3Service.deleteFile(doc.storageKey);
        }
        await this.docRepo.remove(doc);
        if (doc.land) {
            try {
                await this.redisService.del(`digital_twin:${doc.land.landId.toUpperCase()}`);
                await this.redisService.del(`digital_twin:${doc.land.id.toUpperCase()}`);
            }
            catch (e) {
                this.logger.warn(`Could not clear redis cache for ${doc.land.landId}: ${e.message}`);
            }
        }
        await this.auditService.logEvent({
            actorId: officer?.id || 'off_tahsildar',
            actorName: officer?.fullName || 'Tahsildar / Revenue Officer',
            actorRole: officer?.role || 'REVENUE_OFFICER',
            action: 'DOCUMENT_DELETED',
            entityType: 'DOCUMENT',
            entityId: doc.land?.landId || doc.landId,
            previousValue: {
                documentId: doc.id,
                documentName: doc.documentName,
                documentType: doc.documentType,
                hash: doc.documentHash,
            },
        });
        return { deleted: true, id: docId };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = DocumentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_record_entity_1.DocumentRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(land_parcel_entity_1.LandParcel)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        s3_service_1.S3Service,
        redis_service_1.RedisService,
        audit_service_1.AuditService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map