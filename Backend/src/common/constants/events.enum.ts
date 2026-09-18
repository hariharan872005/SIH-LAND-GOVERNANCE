export enum KafkaTopics {
  LAND_EVENTS = 'bhu.land.events',
  SURVEY_EVENTS = 'bhu.survey.events',
  TRANSFER_EVENTS = 'bhu.transfer.events',
  VERIFICATION_EVENTS = 'bhu.verification.events',
  DOCUMENT_EVENTS = 'bhu.document.events',
  AUDIT_EVENTS = 'bhu.audit.events',
}

export enum DomainEventType {
  LAND_CREATED = 'LAND_CREATED',
  LAND_UPDATED = 'LAND_UPDATED',
  SURVEY_SUBMITTED = 'SURVEY_SUBMITTED',
  SURVEY_VERIFIED = 'SURVEY_VERIFIED',
  BOUNDARY_UPDATED = 'BOUNDARY_UPDATED',
  REGISTRATION_VERIFIED = 'REGISTRATION_VERIFIED',
  LAND_TRANSFER_CREATED = 'LAND_TRANSFER_CREATED',
  LAND_TRANSFER_COMPLETED = 'LAND_TRANSFER_COMPLETED',
  MUNICIPAL_VERIFIED = 'MUNICIPAL_VERIFIED',
  LAND_VERIFIED = 'LAND_VERIFIED',
  VERIFICATION_REJECTED = 'VERIFICATION_REJECTED',
  REQUIRES_CORRECTION = 'REQUIRES_CORRECTION',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
}

export interface DomainEventPayload<T = any> {
  eventId: string;
  eventType: DomainEventType;
  entityId: string; // e.g. landId or transactionId
  entityType: 'LAND' | 'TRANSACTION' | 'VERIFICATION' | 'DOCUMENT' | 'OFFICER';
  actorId: string;
  actorRole: string;
  timestamp: string;
  data: T;
}
