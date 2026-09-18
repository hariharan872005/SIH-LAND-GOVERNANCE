import { Repository } from 'typeorm';
import { DocumentRecord } from './entities/document-record.entity';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { S3Service } from '../../integrations/s3/s3.service';
import { RedisService } from '../../integrations/redis/redis.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { DocumentType } from '../../common/constants/status.enum';
import { AuditService } from '../audit/audit.service';
export declare class DocumentsService {
    private readonly docRepo;
    private readonly landRepo;
    private readonly s3Service;
    private readonly redisService;
    private readonly auditService;
    private readonly logger;
    constructor(docRepo: Repository<DocumentRecord>, landRepo: Repository<LandParcel>, s3Service: S3Service, redisService: RedisService, auditService: AuditService);
    uploadDocument(landId: string, file: {
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
    }, documentType: DocumentType, officer: AuthenticatedUser, documentTitle?: string): Promise<DocumentRecord>;
    getDocumentsByLand(landId: string): Promise<any[]>;
    getAllDocuments(search?: string, documentType?: string): Promise<any[]>;
    deleteDocument(docId: string, officer: AuthenticatedUser): Promise<{
        deleted: boolean;
        id: string;
    }>;
}
