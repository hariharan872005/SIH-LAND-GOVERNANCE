import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { LandVerification } from '../verification/entities/land-verification.entity';
import { MunicipalAssessment } from './entities/municipal-assessment.entity';
import { VerifyMunicipalDto } from './dto/verify-municipal.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { LandStatus, VerificationStatus } from '../../common/constants/status.enum';
import { KafkaProducerService } from '../../integrations/kafka/kafka-producer.service';
import { KafkaTopics, DomainEventType } from '../../common/constants/events.enum';
import { RedisService } from '../../integrations/redis/redis.service';
import { AuditService } from '../audit/audit.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MunicipalService {
  private readonly logger = new Logger(MunicipalService.name);

  constructor(
    @InjectRepository(LandParcel)
    private readonly landRepo: Repository<LandParcel>,
    @InjectRepository(LandVerification)
    private readonly verificationRepo: Repository<LandVerification>,
    @InjectRepository(MunicipalAssessment)
    private readonly municipalRepo: Repository<MunicipalAssessment>,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async submitMunicipalVerification(
    dto: VerifyMunicipalDto,
    officer: AuthenticatedUser,
  ): Promise<LandParcel> {
    const land = await this.landRepo.findOne({
      where: [{ id: dto.landId }, { landId: dto.landId.toUpperCase() }],
      relations: ['verifications', 'verifications.department'],
    });

    if (!land) {
      throw new NotFoundException(`Land parcel ${dto.landId} not found.`);
    }

    // 1. Enforce Jurisdiction
    if (officer.role !== 'SUPER_ADMIN') {
      if (officer.scope?.talukId && officer.scope.talukId !== land.talukId) {
        throw new ForbiddenException('You are not authorized to assess municipal property outside your assigned zone.');
      }
    }

    // 2. Validate State Machine
    if (
      land.status !== LandStatus.REQUIRES_MUNICIPAL_VERIFICATION &&
      land.status !== LandStatus.MUNICIPAL_IN_REVIEW &&
      land.status !== LandStatus.REQUIRES_CORRECTION
    ) {
      throw new BadRequestException(
        `Land parcel ${land.landId} is currently in state '${land.status}'. Expected 'REQUIRES_MUNICIPAL_VERIFICATION'.`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 3. Create or update MunicipalAssessment record
      let assessment = await queryRunner.manager.findOne(MunicipalAssessment, {
        where: { landId: land.id },
      });

      if (!assessment) {
        assessment = queryRunner.manager.create(MunicipalAssessment, {
          id: uuidv4(),
          landId: land.id,
          propertyId: dto.propertyId,
        });
      }

      assessment.propertyId = dto.propertyId;
      assessment.taxClearanceUptoYear = dto.taxClearanceYear;
      assessment.isTaxCleared = true;
      assessment.builtUpAreaSqFt = dto.builtUpAreaSqFt || assessment.builtUpAreaSqFt || 0;
      assessment.floorsCount = dto.floorsCount || assessment.floorsCount || 1;
      assessment.occupancyStatus = dto.occupancyStatus || assessment.occupancyStatus || 'COMMERCIAL_OCCUPIED';
      assessment.municipalRemarks = dto.remarks || 'Municipal tax assessment verified against master plan.';
      assessment.verifiedByOfficerId = officer.id;

      await queryRunner.manager.save(assessment);

      // 4. Update normalized LAND_VERIFICATION Municipality Record
      let vMun = await queryRunner.manager.findOne(LandVerification, {
        where: { landId: land.id, departmentId: 'dept_muni_04' },
      });

      if (!vMun) {
        vMun = queryRunner.manager.create(LandVerification, {
          landId: land.id,
          departmentId: 'dept_muni_04',
        });
      }

      vMun.status = VerificationStatus.VERIFIED;
      vMun.officerId = officer.id;
      vMun.remarks = `Property ID ${dto.propertyId} assessed. Tax dues cleared through FY ${dto.taxClearanceYear}. ${dto.remarks || ''}`;
      vMun.referenceDocketNumber = dto.propertyId;
      vMun.verifiedAt = new Date();

      await queryRunner.manager.save(vMun);

      // 5. Evaluate 4-Pillar Completion:
      // A land parcel is LAND_VERIFIED ONLY if Revenue, Survey, Registration, and Municipality are ALL VERIFIED.
      const allVerifications = await queryRunner.manager.find(LandVerification, {
        where: { landId: land.id },
      });

      const requiredDepts = ['dept_rev_01', 'dept_surv_02', 'dept_reg_03', 'dept_muni_04'];
      const allFourVerified = requiredDepts.every((deptId) => {
        const v = allVerifications.find((item) => item.departmentId === deptId);
        return v && v.status === VerificationStatus.VERIFIED;
      });

      if (allFourVerified) {
        land.status = LandStatus.LAND_VERIFIED;
      } else {
        land.status = LandStatus.MUNICIPAL_VERIFIED;
      }

      await queryRunner.manager.save(land);

      await queryRunner.commitTransaction();

      // Clear cache & publish Kafka events
      await this.redisService.del(`land:${land.landId}`);
      await this.redisService.delByPattern('land:*');

      this.kafkaProducer.emitEvent(
        KafkaTopics.VERIFICATION_EVENTS,
        allFourVerified ? DomainEventType.LAND_VERIFIED : DomainEventType.MUNICIPAL_VERIFIED,
        land.landId,
        'LAND',
        { id: officer.id, role: officer.role },
        {
          landId: land.landId,
          propertyId: dto.propertyId,
          allFourVerified,
          finalStatus: land.status,
        },
      );

      this.auditService.logEvent({
        actorId: officer.id,
        actorName: officer.fullName,
        actorRole: officer.role,
        action: allFourVerified ? 'LAND_VERIFIED' : 'MUNICIPAL_VERIFIED',
        entityType: 'LAND',
        entityId: land.landId,
        previousValue: { status: 'REQUIRES_MUNICIPAL_VERIFICATION' },
        newValue: {
          status: land.status,
          propertyId: dto.propertyId,
          allFourVerified,
        },
      });

      return land;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
