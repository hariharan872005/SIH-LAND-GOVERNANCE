import { AuthService } from './auth.service';
import { OfficerRole } from '../../common/constants/roles.enum';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(credentials: {
        email?: string;
        password?: string;
    }): Promise<{
        accessToken: string;
        user: AuthenticatedUser;
    }>;
    loginPersona(role: OfficerRole): Promise<{
        accessToken: string;
        user: AuthenticatedUser;
    }>;
    getCurrentUser(user: AuthenticatedUser): Promise<AuthenticatedUser>;
    updateProfile(user: AuthenticatedUser, dto: {
        id?: string;
        fullName?: string;
        email?: string;
        password?: string;
    }): Promise<{
        success: boolean;
        message: string;
        user?: AuthenticatedUser;
    }>;
}
