import { DocumentType, VerificationStatus } from '../../../common/constants/status.enum';
import { LandParcel } from '../../lands/entities/land-parcel.entity';
import { Officer } from '../../organization/entities/officer.entity';
export declare class DocumentRecord {
    id: string;
    landId: string;
    land: LandParcel;
    documentName: string;
    documentType: DocumentType;
    storageKey: string;
    s3Url: string;
    mimeType: string;
    fileSizeBytes: number;
    documentHash: string;
    uploadedByOfficerId: string;
    uploadedByOfficer: Officer;
    verificationStatus: VerificationStatus;
    metadata: {
        scannerModel?: string;
        verifiedSignature?: string;
        pageCount?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
