import { OwnershipType } from '../../../common/constants/status.enum';
import { LandParcel } from './land-parcel.entity';
export declare class LandOwner {
    id: string;
    landId: string;
    land: LandParcel;
    ownerName: string;
    ownerIdHash: string;
    maskedAadhaarOrId: string;
    ownershipType: OwnershipType;
    ownershipPercentage: number;
    isCurrentOwner: boolean;
    acquiredDate: Date;
    relinquishedDate: Date;
    deedRegistrationNumber: string;
    mutationDocketNumber: string;
    considerationAmountINR: number;
    createdAt: Date;
    updatedAt: Date;
}
