import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/permissions.decorator';
import { DataSource } from 'typeorm';

@ApiTags('System Health & Readiness')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'General health check' })
  health() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'India-wide GIS Land Governance Backend (NestJS)',
      version: '1.0.0',
    };
  }

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Kubernetes Liveness probe' })
  live() {
    return { status: 'OK', uptime: process.uptime() };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Kubernetes Readiness probe (Validates Database & Dependencies)' })
  async ready() {
    let dbConnected = false;
    try {
      await this.dataSource.query('SELECT 1');
      dbConnected = true;
    } catch {
      dbConnected = false;
    }

    return {
      status: dbConnected ? 'UP' : 'DEGRADED',
      database: dbConnected ? 'CONNECTED' : 'DISCONNECTED',
      timestamp: new Date().toISOString(),
    };
  }
}
