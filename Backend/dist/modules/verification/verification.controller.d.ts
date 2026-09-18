import { VerificationService } from './verification.service';
import { OfficerRole } from '../../common/constants/roles.enum';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { VerifyRegistrationDto } from './dto/verify-registration.dto';
import { ReopenVerificationDto } from './dto/reopen-verification.dto';
export declare class VerificationController {
    private readonly verificationService;
    constructor(verificationService: VerificationService);
    getVerifications(landId: string): Promise<import("./entities/land-verification.entity").LandVerification[]>;
    verifyRegistration(dto: VerifyRegistrationDto, officer: AuthenticatedUser): Promise<{
        success: boolean;
        status: import("../../common/constants/status.enum").VerificationStatus;
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
        status: import("../../common/constants/status.enum").VerificationStatus;
        previousStatus: import("../../common/constants/status.enum").VerificationStatus;
        reopenedBy: string;
        reason: string;
        reopenedAt: Date;
    }>;
    flagCorrection(body: {
        landId: string;
        departmentId: string;
        action: 'REQUIRES_CORRECTION' | 'REJECTED';
        reason: string;
    }, officer: AuthenticatedUser): Promise<import("./entities/land-verification.entity").LandVerification>;
}
