import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DataSource } from 'typeorm';
import { runCadastreSeed } from './database/seeds/seed';
import { State } from './modules/administrative-scope/entities/state.entity';

async function bootstrap() {
  const logger = new Logger('NationalLandGovernanceBootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Security Headers & CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const configuredOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Check if origin matches configured origins, wildcard, or any localhost / 127.0.0.1 port
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (
        configuredOrigins.includes('*') ||
        configuredOrigins.includes(origin) ||
        isLocalhost ||
        process.env.NODE_ENV !== 'production'
      ) {
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

  // 2. Global Prefix
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // 3. Global Pipes, Filters, and Interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformResponseInterceptor(),
  );

  // 4. OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('National GIS Land Governance & Digital Twin Platform API')
    .setDescription(
      'India-wide Cadastral Land Governance Backend API supporting Multi-Department Verification, PostGIS Spatial Queries, Neo4j Ownership Lineage, MinIO Certified Deeds, and Kafka Event Streams.',
    )
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

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    customSiteTitle: 'National Cadastre API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
    },
  });

  // 5. Auto-Seed Database if empty (in dev / staging)
  try {
    const dataSource = app.get(DataSource);
    const stateCount = await dataSource.getRepository(State).count();
    if (stateCount === 0) {
      logger.log('Database empty. Executing initial cadastral seed...');
      await runCadastreSeed(dataSource);
    }
  } catch (err) {
    logger.warn(`Database auto-seed skipped or deferred: ${err.message}`);
  }

  // 6. Graceful Shutdown & Port Listen
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
