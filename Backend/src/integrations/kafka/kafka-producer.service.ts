import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { KafkaTopics, DomainEventType, DomainEventPayload } from '../../common/constants/events.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const brokers = (this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092')).split(',');
    const clientId = this.configService.get<string>('KAFKA_CLIENT_ID', 'bhu-twin-core');

    this.kafka = new Kafka({
      clientId,
      brokers,
      retry: {
        initialRetryTime: 300,
        retries: 3,
      },
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
    });

    try {
      await this.producer.connect();
      this.isConnected = true;
      this.logger.log(`Kafka Event Producer connected to brokers: [${brokers.join(', ')}]`);
    } catch (err) {
      this.logger.warn(`Kafka connection deferred (will log events locally if offline): ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  async emitEvent<T = any>(
    topic: KafkaTopics,
    eventType: DomainEventType,
    entityId: string,
    entityType: 'LAND' | 'TRANSACTION' | 'VERIFICATION' | 'DOCUMENT' | 'OFFICER',
    actor: { id: string; role: string },
    data: T,
  ): Promise<void> {
    const payload: DomainEventPayload<T> = {
      eventId: uuidv4(),
      eventType,
      entityId,
      entityType,
      actorId: actor.id,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
      data,
    };

    if (this.isConnected) {
      try {
        await this.producer.send({
          topic,
          messages: [
            {
              key: entityId,
              value: JSON.stringify(payload),
              headers: {
                eventType,
                entityType,
                timestamp: payload.timestamp,
              },
            },
          ],
        });
        this.logger.log(`[Kafka Event] ${eventType} published to ${topic} for ${entityType} ${entityId}`);
      } catch (err) {
        this.logger.error(`Failed to publish Kafka event ${eventType}: ${err.message}`);
      }
    } else {
      this.logger.log(`[Offline Kafka Log] ${eventType} for ${entityType} ${entityId}`);
    }
  }
}
