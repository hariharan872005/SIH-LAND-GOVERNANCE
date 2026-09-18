import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';

// Integrations
import { Neo4jModule } from './integrations/neo4j/neo4j.module';
import { RedisModule } from './integrations/redis/redis.module';
import { KafkaModule } from './integrations/kafka/kafka.module';
import { S3Module } from './integrations/s3/s3.module';
import { OpenSearchModule } from './integrations/opensearch/opensearch.module';

// Business Modules
import { AuthModule } from './modules/auth/auth.module';
import { AdministrativeScopeModule } from './modules/administrative-scope/administrative-scope.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { LandsModule } from './modules/lands/lands.module';
import { SurveyModule } from './modules/survey/survey.module';
import { LandTransferModule } from './modules/land-transfer/land-transfer.module';
import { MunicipalModule } from './modules/municipal/municipal.module';
import { VerificationModule } from './modules/verification/verification.module';
import { DigitalTwinModule } from './modules/digital-twin/digital-twin.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SearchModule } from './modules/search/search.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    // Global Integrations
    Neo4jModule,
    RedisModule,
    KafkaModule,
    S3Module,
    OpenSearchModule,

    // Core Domain Modules
    AuthModule,
    AdministrativeScopeModule,
    OrganizationModule,
    LandsModule,
    SurveyModule,
    LandTransferModule,
    MunicipalModule,
    VerificationModule,
    DigitalTwinModule,
    DocumentsModule,
    SearchModule,
    AuditModule,
    HealthModule,
  ],
})
export class AppModule {}
