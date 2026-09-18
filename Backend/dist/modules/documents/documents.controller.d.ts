import { DocumentsService } from './documents.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { DocumentType } from '../../common/constants/status.enum';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    getAllDocuments(search?: string, documentType?: string): Promise<any[]>;
    upload(landId: string, file: any, documentType: DocumentType, documentName: string, officer: AuthenticatedUser): Promise<import("./entities/document-record.entity").DocumentRecord>;
    getDocuments(landId: string): Promise<any[]>;
    deleteDocument(id: string, officer: AuthenticatedUser): Promise<{
        deleted: boolean;
        id: string;
    }>;
}
