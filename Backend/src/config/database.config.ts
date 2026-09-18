import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST', 'localhost'),
  port: configService.get<number>('DATABASE_PORT', 5432),
  username: configService.get<string>('DATABASE_USER', 'postgres'),
  password: configService.get<string>('DATABASE_PASSWORD', 'postgres_land_pass'),
  database: configService.get<string>('DATABASE_NAME', 'bhu_twin_db'),
  autoLoadEntities: true,
  synchronize: configService.get<string>('NODE_ENV') !== 'production', // Auto-sync schema in dev
  logging: configService.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
  ssl: configService.get<string>('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 25,
    connectionTimeoutMillis: 5000,
  },
});
