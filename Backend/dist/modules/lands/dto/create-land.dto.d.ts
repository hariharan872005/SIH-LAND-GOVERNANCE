import { LandType, OwnershipType } from '../../../common/constants/status.enum';
export declare class CreateLandDto {
    landId: string;
    surveyNumber: string;
    subdivisionNumber?: string;
    stateId: string;
    districtId: string;
    talukId: string;
    villageId: string;
    landType: LandType;
    classification?: string;
    registeredArea: number;
    marketValueINR: number;
    ownerName: string;
    ownerIdHash: string;
    ownershipType: OwnershipType;
    existingLandRecordRef?: string;
}
