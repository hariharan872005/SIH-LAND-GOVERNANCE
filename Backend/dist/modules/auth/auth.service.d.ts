import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Officer } from '../organization/entities/officer.entity';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { OfficerRole } from '../../common/constants/roles.enum';
export declare class AuthService {
    private readonly officerRepo;
    private readonly jwtService;
    constructor(officerRepo: Repository<Officer>, jwtService: JwtService);
    loginPersona(role: OfficerRole): Promise<{
        accessToken: string;
        user: AuthenticatedUser;
    }>;
    loginWithCredentials(email: string, password: string): Promise<{
        accessToken: string;
        user: AuthenticatedUser;
    }>;
    private getFallbackPersona;
    updateProfileCredentials(officerId: string, dto: {
        fullName?: string;
        email?: string;
        password?: string;
    }): Promise<{
        success: boolean;
        message: string;
        user?: AuthenticatedUser;
    }>;
}
