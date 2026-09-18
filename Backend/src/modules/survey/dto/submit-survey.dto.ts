import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitSurveyDto {
  @ApiProperty({ description: 'Target Land ID', example: 'TN-CHE-101' })
  @IsString()
  @IsNotEmpty()
  landId: string;

  @ApiProperty({ description: 'DGPS Field-Measured Extent in Acres', example: 2.5 })
  @IsNumber()
  @Min(0.001)
  measuredAreaAcres: number;

  @ApiProperty({
    description: 'PostGIS Polygon Boundary Coordinates [[lng, lat], [lng, lat], ...]',
    example: [
      [80.1542, 13.1132],
      [80.1582, 13.1132],
      [80.1582, 13.1172],
      [80.1542, 13.1172],
      [80.1542, 13.1132],
    ],
  })
  @IsArray()
  polygonCoordinates: number[][];

  @ApiProperty({ description: 'Official Survey & DGPS Demarcation Remarks', example: 'DGPS Base Station CORS network verification complete. Vector boundary polygon points benchmarked against EPSG:4326.' })
  @IsString()
  @IsNotEmpty()
  surveyRemarks: string;

  @ApiPropertyOptional({ description: 'Survey Document Docket Reference', example: 'DGPS_FMB_TN-CHE-101_2026.gpkg' })
  @IsOptional()
  @IsString()
  surveyDocName?: string;
}
