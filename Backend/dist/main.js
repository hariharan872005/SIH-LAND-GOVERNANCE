"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const transform_response_interceptor_1 = require("./common/interceptors/transform-response.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const typeorm_1 = require("typeorm");
const seed_1 = require("./database/seeds/seed");
const state_entity_1 = require("./modules/administrative-scope/entities/state.entity");
async function bootstrap() {
    const logger = new common_1.Logger('NationalLandGovernanceBootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    const configuredOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
            if (configuredOrigins.includes('*') ||
                configuredOrigins.includes(origin) ||
                isLocalhost ||
                process.env.NODE_ENV !== 'production') {
                return callback(null, true);
            }
            return callback(new Error('CORS origin not allowed'), false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'x-request-id',
            'x-dev-persona',
            'X-Dev-Persona',
            'idempotency-key',
            'Idempotency-Key',
            'x-idempotency-key',
            'X-Idempotency-Key',
        ],
    });
    const apiPrefix = process.env.API_PREFIX || 'api/v1';
    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_response_interceptor_1.TransformResponseInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('National GIS Land Governance & Digital Twin Platform API')
        .setDescription('India-wide Cadastral Land Governance Backend API supporting Multi-Department Verification, PostGIS Spatial Queries, Neo4j Ownership Lineage, MinIO Certified Deeds, and Kafka Event Streams.')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('Authentication (Keycloak & OAuth 2.0)')
        .addTag('Land Parcels')
        .addTag('Cadastral Survey & PostGIS')
        .addTag('Land Transfers & Deeds')
        .addTag('Municipal & Property Tax')
        .addTag('Verification Matrix')
        .addTag('Digital Twins')
        .addTag('Document Management (S3 Vault)')
        .addTag('Cadastral Search (OpenSearch)')
        .addTag('Administrative Scope')
        .addTag('Organization & Governance')
        .addTag('Audit Logs')
        .addTag('System Health & Readiness')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
        customSiteTitle: 'National Cadastre API Documentation',
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'list',
            filter: true,
        },
    });
    try {
        const dataSource = app.get(typeorm_1.DataSource);
        const stateCount = await dataSource.getRepository(state_entity_1.State).count();
        if (stateCount === 0) {
            logger.log('Database empty. Executing initial cadastral seed...');
            await (0, seed_1.runCadastreSeed)(dataSource);
        }
    }
    catch (err) {
        logger.warn(`Database auto-seed skipped or deferred: ${err.message}`);
    }
    app.enableShutdownHooks();
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`=============================================================`);
    logger.log(`🇮🇳 National GIS Land Governance Backend is RUNNING`);
    logger.log(`🚀 API Server:       http://localhost:${port}/${apiPrefix}`);
    logger.log(`📑 OpenAPI / Swagger: http://localhost:${port}/${apiPrefix}/docs`);
    logger.log(`🩺 Health Probe:     http://localhost:${port}/${apiPrefix}/health`);
    logger.log(`=============================================================`);
}
bootstrap();
//# sourceMappingURL=main.js.map