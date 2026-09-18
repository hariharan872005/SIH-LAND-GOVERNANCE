import { TransferType, OwnershipType } from '../../../common/constants/status.enum';
export declare class NewOwnerDto {
    ownerId: string;
    ownerName: string;
    ownerIdHash?: string;
    ownershipType?: OwnershipType;
}
export declare class CreateTransferDto {
    landId: string;
    previousOwnerId?: string;
    newOwner?: NewOwnerDto;
    newOwnerName?: string;
    newOwnerIdHash?: string;
    newOwnershipType?: OwnershipType;
    transferType: TransferType;
    deedNumber: string;
    registrationNumber?: string;
    registrationDate: string;
    registrationOffice?: string;
    sroOffice?: string;
    transactionReference?: string;
    considerationAmount?: number;
    considerationAmountINR?: number;
    documentReferences?: string[];
    remarks?: string;
}
export { CreateTransferDto as CreateLandTransferDto };
