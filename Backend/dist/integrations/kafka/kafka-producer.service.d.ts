import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaTopics, DomainEventType } from '../../common/constants/events.enum';
export declare class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private kafka;
    private producer;
    private isConnected;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    emitEvent<T = any>(topic: KafkaTopics, eventType: DomainEventType, entityId: string, entityType: 'LAND' | 'TRANSACTION' | 'VERIFICATION' | 'DOCUMENT' | 'OFFICER', actor: {
        id: string;
        role: string;
    }, data: T): Promise<void>;
}
