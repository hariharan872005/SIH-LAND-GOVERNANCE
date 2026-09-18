import { TransferType } from '../../../common/constants/status.enum';
import { LandParcel } from '../../lands/entities/land-parcel.entity';
import { Officer } from '../../organization/entities/officer.entity';
export declare class LandTransfer {
    id: string;
    transactionId: string;
    landId: string;
    land: LandParcel;
    previousOwnerId: string;
    newOwnerId: string;
    transferType: TransferType;
    deedNumber: string;
    registrationNumber: string;
    registrationDate: Date;
    registrationOffice: string;
    transactionReference: string;
    considerationAmount: number;
    status: string;
    verifiedBy: string;
    verifiedByOfficer: Officer;
    verifiedAt: Date;
    remarks: string;
    createdAt: Date;
    updatedAt: Date;
}
