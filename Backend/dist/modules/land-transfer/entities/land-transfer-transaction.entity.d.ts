import { TransferType } from '../../../common/constants/status.enum';
import { LandParcel } from '../../lands/entities/land-parcel.entity';
import { Officer } from '../../organization/entities/officer.entity';
export declare class LandTransferTransaction {
    id: string;
    landId: string;
    land: LandParcel;
    fromOwnerId: string;
    fromOwnerName: string;
    toOwnerId: string;
    toOwnerName: string;
    toOwnerIdHash: string;
    transferType: TransferType;
    deedNumber: string;
    registrationNumber: string;
    registrationDate: Date;
    considerationAmountINR: number;
    subRegistrarOffice: string;
    status: string;
    createdByOfficerId: string;
    approvedByOfficer: Officer;
    remarks: string;
    createdAt: Date;
    updatedAt: Date;
}
