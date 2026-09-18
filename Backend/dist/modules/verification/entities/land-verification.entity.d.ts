import { VerificationStatus } from '../../../common/constants/status.enum';
import { LandParcel } from '../../lands/entities/land-parcel.entity';
import { Department } from '../../organization/entities/department.entity';
import { Officer } from '../../organization/entities/officer.entity';
export declare class LandVerification {
    id: string;
    landId: string;
    land: LandParcel;
    departmentId: string;
    department: Department;
    officerId: string;
    officer: Officer;
    status: VerificationStatus;
    remarks: string;
    referenceDocketNumber: string;
    submittedAt: Date;
    verifiedAt: Date;
    rejectedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
