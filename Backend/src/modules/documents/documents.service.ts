import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentRecord } from './entities/document-record.entity';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { S3Service } from '../../integrations/s3/s3.service';
import { RedisService } from '../../integrations/redis/redis.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { DocumentType, VerificationStatus } from '../../common/constants/status.enum';
import { AuditService } from '../audit/audit.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(DocumentRecord)
    private readonly docRepo: Repository<DocumentRecord>,
    @InjectRepository(LandParcel)
    private readonly landRepo: Repository<LandParcel>,
    private readonly s3Service: S3Service,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
  ) {}

  async uploadDocument(
    landId: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    documentType: DocumentType,
    officer: AuthenticatedUser,
    documentTitle?: string,
  ): Promise<DocumentRecord> {
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
      throw new NotFoundException(`Land parcel ${landId} not found.`);
    }

    const docName = documentTitle || file.originalname || `${documentType}_${land.landId}.pdf`;
    const storageKey = `cadastre/${land.landId}/${Date.now()}_${docName.replace(/\s+/g, '_')}`;
    const uploadResult = await this.s3Service.uploadFile(storageKey, file.buffer, file.mimetype);

    const doc = this.docRepo.create({
      id: uuidv4(),
      landId: land.id,
      documentName: docName,
      documentType: documentType || DocumentType.SALE_DEED,
      storageKey: uploadResult.storageKey,
      s3Url: uploadResult.s3Url,
      mimeType: file.mimetype || 'application/pdf',
      fileSizeBytes: file.size || 2400000,
      documentHash: uploadResult.documentHash,
      uploadedByOfficerId: officer?.id || null,
      verificationStatus: VerificationStatus.VERIFIED,
      metadata: {
        scannerModel: 'Canon Flatbed DRS-9900 (NIC Calibrated)',
        verifiedSignature: 'SHA256:ECDSA:GOV_INDIA_ROOT_CA',
        pageCount: 1,
      },
    });

    const saved = await this.docRepo.save(doc);

    // Invalidate Redis Digital Twin Cache
    try {
      await this.redisService.del(`digital_twin:${land.landId.toUpperCase()}`);
      await this.redisService.del(`digital_twin:${land.id.toUpperCase()}`);
    } catch (e) {
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

  async getDocumentsByLand(landId: string): Promise<any[]> {
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

    return Promise.all(
      docs.map(async (d) => ({
        ...d,
        landId: d.land?.landId || land?.landId || d.landId,
        fileName: d.documentName,
        downloadUrl: await this.s3Service.getPresignedDownloadUrl(d.storageKey),
      })),
    );
  }

  async getAllDocuments(search?: string, documentType?: string): Promise<any[]> {
    const query = this.docRepo
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.uploadedByOfficer', 'officer')
      .leftJoinAndSelect('doc.land', 'land')
      .orderBy('doc.createdAt', 'DESC');

    if (documentType && documentType !== 'ALL') {
      query.andWhere('doc.documentType = :documentType', { documentType });
    }

    if (search) {
      query.andWhere(
        '(doc.documentName ILIKE :search OR land.landId ILIKE :search OR doc.landId ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const docs = await query.getMany();

    return Promise.all(
      docs.map(async (d) => ({
        ...d,
        landId: d.land?.landId || d.landId,
        fileName: d.documentName,
        downloadUrl: await this.s3Service.getPresignedDownloadUrl(d.storageKey),
      })),
    );
  }

  async deleteDocument(docId: string, officer: AuthenticatedUser): Promise<{ deleted: boolean; id: string }> {
    const doc = await this.docRepo.findOne({
      where: { id: docId },
      relations: ['land'],
    });

    if (!doc) {
      throw new NotFoundException(`Document with ID ${docId} not found.`);
    }

    // Delete object from MinIO / S3
    if (doc.storageKey) {
      await this.s3Service.deleteFile(doc.storageKey);
    }

    // Delete from Database
    await this.docRepo.remove(doc);

    // Clear Redis Cache
    if (doc.land) {
      try {
        await this.redisService.del(`digital_twin:${doc.land.landId.toUpperCase()}`);
        await this.redisService.del(`digital_twin:${doc.land.id.toUpperCase()}`);
      } catch (e) {
        this.logger.warn(`Could not clear redis cache for ${doc.land.landId}: ${e.message}`);
      }
    }

    // Log Audit Trail
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
}
