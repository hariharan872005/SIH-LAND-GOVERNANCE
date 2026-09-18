import { Repository, DataSource } from 'typeorm';
import { LandParcel } from '../lands/entities/land-parcel.entity';
import { LandVerification } from '../verification/entities/land-verification.entity';
import { SubmitSurveyDto } from './dto/submit-survey.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { KafkaProducerService } from '../../integrations/kafka/kafka-producer.service';
import { RedisService } from '../../integrations/redis/redis.service';
import { AuditService } from '../audit/audit.service';
export declare class SurveyService {
    private readonly landRepo;
    private readonly verificationRepo;
    private readonly kafkaProducer;
    private readonly redisService;
    private readonly auditService;
    private readonly dataSource;
    private readonly logger;
    constructor(landRepo: Repository<LandParcel>, verificationRepo: Repository<LandVerification>, kafkaProducer: KafkaProducerService, redisService: RedisService, auditService: AuditService, dataSource: DataSource);
    submitSurveyVerification(dto: SubmitSurveyDto, surveyor: AuthenticatedUser): Promise<LandParcel>;
}
