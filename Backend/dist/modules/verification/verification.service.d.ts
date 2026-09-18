import { Repository } from 'typeorm';
import { LandVerification } from './entities/land-verification.entity';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { VerificationStatus } from '../../common/constants/status.enum';
import { OfficerRole } from '../../common/constants/roles.enum';
import { AuditService } from '../audit/audit.service';
import { VerifyRegistrationDto } from './dto/verify-registration.dto';
import { ReopenVerificationDto } from './dto/reopen-verification.dto';
export declare class VerificationService {
    private readonly verificationRepo;
    private readonly landRepo;
    private readonly auditService;
    private readonly logger;
    private readonly REGISTRATION_DEPT_ID;
    constructor(verificationRepo: Repository<LandVerification>, landRepo: Repository<LandParcel>, auditService: AuditService);
    getVerificationsByLand(landId: string): Promise<LandVerification[]>;
    verifyRegistration(dto: VerifyRegistrationDto, officer: AuthenticatedUser): Promise<{
        success: boolean;
        status: VerificationStatus;
        verifiedBy: {
            id: string;
            fullName: string;
            role: OfficerRole;
            departmentId: string;
        };
        verifiedAt: Date;
    }>;
    reopenVerification(dto: ReopenVerificationDto, officer: AuthenticatedUser): Promise<{
        success: boolean;
        status: VerificationStatus;
        previousStatus: VerificationStatus;
        reopenedBy: string;
        reason: string;
        reopenedAt: Date;
    }>;
    flagCorrectionOrReject(landId: string, departmentId: string, action: 'REQUIRES_CORRECTION' | 'REJECTED', reason: string, officer: AuthenticatedUser): Promise<LandVerification>;
}
