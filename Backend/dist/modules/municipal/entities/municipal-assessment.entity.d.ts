import { LandParcel } from '../../lands/entities/land-parcel.entity';
export declare class MunicipalAssessment {
    id: string;
    landId: string;
    land: LandParcel;
    propertyId: string;
    propertyClassification: string;
    builtUpAreaSqFt: number;
    floorsCount: number;
    occupancyStatus: string;
    buildingApprovalNumber: string;
    taxClearanceUptoYear: number;
    isTaxCleared: boolean;
    municipalRemarks: string;
    verifiedByOfficerId: string;
    createdAt: Date;
    updatedAt: Date;
}
