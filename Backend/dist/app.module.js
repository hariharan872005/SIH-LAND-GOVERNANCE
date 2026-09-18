"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const database_config_1 = require("./config/database.config");
const neo4j_module_1 = require("./integrations/neo4j/neo4j.module");
const redis_module_1 = require("./integrations/redis/redis.module");
const kafka_module_1 = require("./integrations/kafka/kafka.module");
const s3_module_1 = require("./integrations/s3/s3.module");
const opensearch_module_1 = require("./integrations/opensearch/opensearch.module");
const auth_module_1 = require("./modules/auth/auth.module");
const administrative_scope_module_1 = require("./modules/administrative-scope/administrative-scope.module");
const organization_module_1 = require("./modules/organization/organization.module");
const lands_module_1 = require("./modules/lands/lands.module");
const survey_module_1 = require("./modules/survey/survey.module");
const land_transfer_module_1 = require("./modules/land-transfer/land-transfer.module");
const municipal_module_1 = require("./modules/municipal/municipal.module");
const verification_module_1 = require("./modules/verification/verification.module");
const digital_twin_module_1 = require("./modules/digital-twin/digital-twin.module");
const documents_module_1 = require("./modules/documents/documents.module");
const search_module_1 = require("./modules/search/search.module");
const audit_module_1 = require("./modules/audit/audit.module");
const health_module_1 = require("./modules/health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.development', '.env'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: database_config_1.getDatabaseConfig,
            }),
            neo4j_module_1.Neo4jModule,
            redis_module_1.RedisModule,
            kafka_module_1.KafkaModule,
            s3_module_1.S3Module,
            opensearch_module_1.OpenSearchModule,
            auth_module_1.AuthModule,
            administrative_scope_module_1.AdministrativeScopeModule,
            organization_module_1.OrganizationModule,
            lands_module_1.LandsModule,
            survey_module_1.SurveyModule,
            land_transfer_module_1.LandTransferModule,
            municipal_module_1.MunicipalModule,
            verification_module_1.VerificationModule,
            digital_twin_module_1.DigitalTwinModule,
            documents_module_1.DocumentsModule,
            search_module_1.SearchModule,
            audit_module_1.AuditModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map