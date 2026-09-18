"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KafkaProducerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaProducerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kafkajs_1 = require("kafkajs");
const uuid_1 = require("uuid");
let KafkaProducerService = KafkaProducerService_1 = class KafkaProducerService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(KafkaProducerService_1.name);
        this.isConnected = false;
    }
    async onModuleInit() {
        const brokers = (this.configService.get('KAFKA_BROKERS', 'localhost:9092')).split(',');
        const clientId = this.configService.get('KAFKA_CLIENT_ID', 'bhu-twin-core');
        this.kafka = new kafkajs_1.Kafka({
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
        }
        catch (err) {
            this.logger.warn(`Kafka connection deferred (will log events locally if offline): ${err.message}`);
        }
    }
    async onModuleDestroy() {
        if (this.producer) {
            await this.producer.disconnect();
        }
    }
    async emitEvent(topic, eventType, entityId, entityType, actor, data) {
        const payload = {
            eventId: (0, uuid_1.v4)(),
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
            }
            catch (err) {
                this.logger.error(`Failed to publish Kafka event ${eventType}: ${err.message}`);
            }
        }
        else {
            this.logger.log(`[Offline Kafka Log] ${eventType} for ${entityType} ${entityId}`);
        }
    }
};
exports.KafkaProducerService = KafkaProducerService;
exports.KafkaProducerService = KafkaProducerService = KafkaProducerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], KafkaProducerService);
//# sourceMappingURL=kafka-producer.service.js.map