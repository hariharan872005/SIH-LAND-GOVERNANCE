import { Controller, Post, Body, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/permissions.decorator';
import { OfficerRole } from '../../common/constants/roles.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication (Keycloak & OAuth 2.0)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Authenticate officer using email and password credentials' })
  async login(@Body() credentials: { email?: string; password?: string }) {
    return this.authService.loginWithCredentials(credentials.email || '', credentials.password || '');
  }

  @Public()
  @Post('login-persona')
  @ApiOperation({ summary: 'Obtain JWT token for test role persona (Super Admin, Tahsildar, Surveyor, Sub-Registrar, Revenue Officer)' })
  async loginPersona(@Body('role') role: OfficerRole) {
    return this.authService.loginPersona(role || OfficerRole.SUPER_ADMIN);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated officer profile and geographical scope' })
  async getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Public()
  @Patch('profile')
  @ApiOperation({ summary: 'Update current authenticated officer profile credentials (email username, name, password)' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: { id?: string; fullName?: string; email?: string; password?: string },
  ) {
    const officerId = user?.id || dto?.id || '';
    return this.authService.updateProfileCredentials(officerId, dto);
  }
}
