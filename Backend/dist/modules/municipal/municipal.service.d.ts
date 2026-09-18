import { Repository, DataSource } from 'typeorm';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { LandVerification } from '../verification/entities/land-verification.entity';
import { MunicipalAssessment } from './entities/municipal-assessment.entity';
import { VerifyMunicipalDto } from './dto/verify-municipal.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { KafkaProducerService } from '../../integrations/kafka/kafka-producer.service';
import { RedisService } from '../../integrations/redis/redis.service';
import { AuditService } from '../audit/audit.service';
export declare class MunicipalService {
    private readonly landRepo;
    private readonly verificationRepo;
    private readonly municipalRepo;
    private readonly kafkaProducer;
    private readonly redisService;
    private readonly auditService;
    private readonly dataSource;
    private readonly logger;
    constructor(landRepo: Repository<LandParcel>, verificationRepo: Repository<LandVerification>, municipalRepo: Repository<MunicipalAssessment>, kafkaProducer: KafkaProducerService, redisService: RedisService, auditService: AuditService, dataSource: DataSource);
    submitMunicipalVerification(dto: VerifyMunicipalDto, officer: AuthenticatedUser): Promise<LandParcel>;
}
