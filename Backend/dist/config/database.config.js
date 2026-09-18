"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const getDatabaseConfig = (configService) => ({
    type: 'postgres',
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: configService.get('DATABASE_PORT', 5432),
    username: configService.get('DATABASE_USER', 'postgres'),
    password: configService.get('DATABASE_PASSWORD', 'postgres_land_pass'),
    database: configService.get('DATABASE_NAME', 'bhu_twin_db'),
    autoLoadEntities: true,
    synchronize: configService.get('NODE_ENV') !== 'production',
    logging: configService.get('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
    ssl: configService.get('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
    extra: {
        max: 25,
        connectionTimeoutMillis: 5000,
    },
});
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map