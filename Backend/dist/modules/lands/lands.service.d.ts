import { Repository, DataSource } from 'typeorm';
import { LandParcel } from './entities/land-parcel.entity';
import { LandOwner } from './entities/land-owner.entity';
import { LandVerification } from '../verification/entities/land-verification.entity';
import { CreateLandDto } from './dto/create-land.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { LandStatus } from '../../common/constants/status.enum';
import { Neo4jService } from '../../integrations/neo4j/neo4j.service';
import { KafkaProducerService } from '../../integrations/kafka/kafka-producer.service';
import { RedisService } from '../../integrations/redis/redis.service';
import { OpenSearchService } from '../../integrations/opensearch/opensearch.service';
import { AuditService } from '../audit/audit.service';
export declare class LandsService {
    private readonly landRepo;
    private readonly ownerRepo;
    private readonly verificationRepo;
    private readonly neo4jService;
    private readonly kafkaProducer;
    private readonly redisService;
    private readonly openSearchService;
    private readonly auditService;
    private readonly dataSource;
    private readonly logger;
    constructor(landRepo: Repository<LandParcel>, ownerRepo: Repository<LandOwner>, verificationRepo: Repository<LandVerification>, neo4jService: Neo4jService, kafkaProducer: KafkaProducerService, redisService: RedisService, openSearchService: OpenSearchService, auditService: AuditService, dataSource: DataSource);
    createParcelByTahsildar(dto: CreateLandDto, officer: AuthenticatedUser): Promise<LandParcel>;
    getLandParcels(pagination: PaginationDto, filters?: {
        stateId?: string;
        districtId?: string;
        talukId?: string;
        status?: LandStatus;
        landType?: string;
    }, officer?: AuthenticatedUser): Promise<PaginatedResult<LandParcel>>;
    getLandById(identifier: string): Promise<LandParcel>;
}
