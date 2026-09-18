import { Repository } from 'typeorm';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { LandVerification } from '../verification/entities/land-verification.entity';
import { LandTransferTransaction } from '../land-transfer/entities/land-transfer-transaction.entity';
import { MunicipalAssessment } from '../municipal/entities/municipal-assessment.entity';
import { DocumentRecord } from '../documents/entities/document-record.entity';
import { Neo4jService } from '../../integrations/neo4j/neo4j.service';
import { S3Service } from '../../integrations/s3/s3.service';
import { RedisService } from '../../integrations/redis/redis.service';
export interface UnifiedDigitalTwinResponse {
    landId: string;
    surveyNumber: string;
    subdivisionNumber?: string;
    location: {
        stateId: string;
        stateName: string;
        districtId: string;
        districtName: string;
        talukId: string;
        talukName: string;
        villageId: string;
        villageName: string;
    };
    landDetails: {
        registeredArea: number;
        measuredArea: number;
        landType: string;
        classification: string;
        marketValueINR: number;
        status: string;
        isDisputed: boolean;
        disputeDetails?: string;
        elevationMeters: number;
        soilClassification: string;
        landUseZoning: string;
        encumbranceStatus: string;
        geoServerLayerName: string;
        postGisTable: string;
    };
    currentOwner: {
        ownerName: string;
        ownerIdHash: string;
        maskedAadhaarOrId?: string;
        ownershipType: string;
        ownershipPercentage: number;
        acquiredDate?: Date;
        deedRegistrationNumber?: string;
    };
    gis: {
        type: string;
        coordinates: any;
        center: [number, number];
        areaInAcres: number;
        srid: number;
    };
    verificationMatrix: {
        revenue: {
            status: string;
            remarks?: string;
            verifiedAt?: Date;
            verifiedBy?: string;
        };
        survey: {
            status: string;
            remarks?: string;
            verifiedAt?: Date;
            verifiedBy?: string;
        };
        registration: {
            status: string;
            remarks?: string;
            verifiedAt?: Date;
            verifiedBy?: string;
        };
        municipality: {
            status: string;
            remarks?: string;
            verifiedAt?: Date;
            verifiedBy?: string;
        };
    };
    normalizedVerifications: LandVerification[];
    municipalAssessment: MunicipalAssessment | null;
    ownershipHistory: any[];
    neo4jLineageGraph: any;
    transactions: LandTransferTransaction[];
    documents: any[];
    metadata: {
        aggregatedAt: string;
        authoritativeSource: 'PostgreSQL + PostGIS + Neo4j + MinIO';
    };
}
export declare class DigitalTwinService {
    private readonly landRepo;
    private readonly verificationRepo;
    private readonly txRepo;
    private readonly muniRepo;
    private readonly docRepo;
    private readonly neo4jService;
    private readonly s3Service;
    private readonly redisService;
    private readonly logger;
    constructor(landRepo: Repository<LandParcel>, verificationRepo: Repository<LandVerification>, txRepo: Repository<LandTransferTransaction>, muniRepo: Repository<MunicipalAssessment>, docRepo: Repository<DocumentRecord>, neo4jService: Neo4jService, s3Service: S3Service, redisService: RedisService);
    getDigitalTwin(landId: string): Promise<UnifiedDigitalTwinResponse>;
}
