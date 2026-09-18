import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Officer } from '../organization/entities/officer.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JurisdictionScopeGuard } from '../../common/guards/jurisdiction-scope.guard';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Officer]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'super_secret_gov_root_signing_key_2026_india'),
        signOptions: {
          expiresIn: configService.get<number>('JWT_EXPIRATION', 86400),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard, PermissionsGuard, JurisdictionScopeGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, RolesGuard, PermissionsGuard, JurisdictionScopeGuard],
})
export class AuthModule {}
