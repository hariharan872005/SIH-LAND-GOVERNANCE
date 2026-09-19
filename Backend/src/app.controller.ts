import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/permissions.decorator';

@ApiTags('Root')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'API Root Information & Navigation' })
  getRoot() {
    return {
      name: 'National GIS Land Governance & Digital Twin Platform API',
      status: 'ONLINE',
      version: '1.0.0',
      documentation: '/api/v1/docs',
      health: '/api/v1/health',
      endpoints: {
        auth: '/api/v1/auth',
        lands: '/api/v1/lands',
        transfers: '/api/v1/transfers',
        surveys: '/api/v1/surveys',
        municipal: '/api/v1/municipal',
        verification: '/api/v1/verification',
        digitalTwin: '/api/v1/digital-twin',
        documents: '/api/v1/documents',
        search: '/api/v1/search',
        audit: '/api/v1/audit',
      },
    };
  }
}
