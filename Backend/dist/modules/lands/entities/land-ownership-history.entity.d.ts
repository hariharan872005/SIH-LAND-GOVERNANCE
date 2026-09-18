import { LandParcel } from './land-parcel.entity';
export declare class LandOwnershipHistory {
    id: string;
    landId: string;
    land: LandParcel;
    ownerId: string;
    ownerName: string;
    ownerIdHash: string;
    ownershipStartDate: Date;
    ownershipEndDate: Date | null;
    acquisitionType: string;
    transactionId: string;
    isCurrent: boolean;
    createdAt: Date;
    updatedAt: Date;
}
