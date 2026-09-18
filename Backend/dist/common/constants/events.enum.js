"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEventType = exports.KafkaTopics = void 0;
var KafkaTopics;
(function (KafkaTopics) {
    KafkaTopics["LAND_EVENTS"] = "bhu.land.events";
    KafkaTopics["SURVEY_EVENTS"] = "bhu.survey.events";
    KafkaTopics["TRANSFER_EVENTS"] = "bhu.transfer.events";
    KafkaTopics["VERIFICATION_EVENTS"] = "bhu.verification.events";
    KafkaTopics["DOCUMENT_EVENTS"] = "bhu.document.events";
    KafkaTopics["AUDIT_EVENTS"] = "bhu.audit.events";
})(KafkaTopics || (exports.KafkaTopics = KafkaTopics = {}));
var DomainEventType;
(function (DomainEventType) {
    DomainEventType["LAND_CREATED"] = "LAND_CREATED";
    DomainEventType["LAND_UPDATED"] = "LAND_UPDATED";
    DomainEventType["SURVEY_SUBMITTED"] = "SURVEY_SUBMITTED";
    DomainEventType["SURVEY_VERIFIED"] = "SURVEY_VERIFIED";
    DomainEventType["BOUNDARY_UPDATED"] = "BOUNDARY_UPDATED";
    DomainEventType["REGISTRATION_VERIFIED"] = "REGISTRATION_VERIFIED";
    DomainEventType["LAND_TRANSFER_CREATED"] = "LAND_TRANSFER_CREATED";
    DomainEventType["LAND_TRANSFER_COMPLETED"] = "LAND_TRANSFER_COMPLETED";
    DomainEventType["MUNICIPAL_VERIFIED"] = "MUNICIPAL_VERIFIED";
    DomainEventType["LAND_VERIFIED"] = "LAND_VERIFIED";
    DomainEventType["VERIFICATION_REJECTED"] = "VERIFICATION_REJECTED";
    DomainEventType["REQUIRES_CORRECTION"] = "REQUIRES_CORRECTION";
    DomainEventType["DOCUMENT_UPLOADED"] = "DOCUMENT_UPLOADED";
})(DomainEventType || (exports.DomainEventType = DomainEventType = {}));
//# sourceMappingURL=events.enum.js.map