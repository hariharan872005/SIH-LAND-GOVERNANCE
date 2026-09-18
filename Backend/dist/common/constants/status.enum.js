"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentType = exports.OfficerStatus = exports.DesignationStatus = exports.DepartmentStatus = exports.OwnershipType = exports.LandType = exports.TransferType = exports.VerificationStatus = exports.LandStatus = void 0;
var LandStatus;
(function (LandStatus) {
    LandStatus["DRAFT"] = "DRAFT";
    LandStatus["SUBMITTED"] = "SUBMITTED";
    LandStatus["REQUIRES_SURVEY"] = "REQUIRES_SURVEY";
    LandStatus["SURVEY_IN_REVIEW"] = "SURVEY_IN_REVIEW";
    LandStatus["SURVEY_VERIFIED"] = "SURVEY_VERIFIED";
    LandStatus["REQUIRES_REGISTRATION_VERIFICATION"] = "REQUIRES_REGISTRATION_VERIFICATION";
    LandStatus["REGISTRATION_IN_REVIEW"] = "REGISTRATION_IN_REVIEW";
    LandStatus["REGISTRATION_VERIFIED"] = "REGISTRATION_VERIFIED";
    LandStatus["REQUIRES_MUNICIPAL_VERIFICATION"] = "REQUIRES_MUNICIPAL_VERIFICATION";
    LandStatus["MUNICIPAL_IN_REVIEW"] = "MUNICIPAL_IN_REVIEW";
    LandStatus["MUNICIPAL_VERIFIED"] = "MUNICIPAL_VERIFIED";
    LandStatus["LAND_VERIFIED"] = "LAND_VERIFIED";
    LandStatus["REQUIRES_CORRECTION"] = "REQUIRES_CORRECTION";
    LandStatus["REJECTED"] = "REJECTED";
})(LandStatus || (exports.LandStatus = LandStatus = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["IN_REVIEW"] = "IN_REVIEW";
    VerificationStatus["VERIFIED"] = "VERIFIED";
    VerificationStatus["REJECTED"] = "REJECTED";
    VerificationStatus["REQUIRES_CORRECTION"] = "REQUIRES_CORRECTION";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var TransferType;
(function (TransferType) {
    TransferType["SALE"] = "SALE";
    TransferType["GIFT"] = "GIFT";
    TransferType["INHERITANCE"] = "INHERITANCE";
    TransferType["PARTITION"] = "PARTITION";
    TransferType["COURT_ORDER"] = "COURT_ORDER";
    TransferType["GOVT_ALLOTMENT"] = "GOVT_ALLOTMENT";
    TransferType["OTHER"] = "OTHER";
})(TransferType || (exports.TransferType = TransferType = {}));
var LandType;
(function (LandType) {
    LandType["AGRICULTURAL"] = "AGRICULTURAL";
    LandType["COMMERCIAL"] = "COMMERCIAL";
    LandType["RESIDENTIAL"] = "RESIDENTIAL";
    LandType["INDUSTRIAL"] = "INDUSTRIAL";
    LandType["GOVERNMENT"] = "GOVERNMENT";
    LandType["FOREST"] = "FOREST";
})(LandType || (exports.LandType = LandType = {}));
var OwnershipType;
(function (OwnershipType) {
    OwnershipType["INDIVIDUAL"] = "INDIVIDUAL";
    OwnershipType["JOINT"] = "JOINT";
    OwnershipType["CORPORATE"] = "CORPORATE";
    OwnershipType["TRUST"] = "TRUST";
    OwnershipType["GOVERNMENT"] = "GOVERNMENT";
})(OwnershipType || (exports.OwnershipType = OwnershipType = {}));
var DepartmentStatus;
(function (DepartmentStatus) {
    DepartmentStatus["ACTIVE"] = "ACTIVE";
    DepartmentStatus["INACTIVE"] = "INACTIVE";
})(DepartmentStatus || (exports.DepartmentStatus = DepartmentStatus = {}));
var DesignationStatus;
(function (DesignationStatus) {
    DesignationStatus["ACTIVE"] = "ACTIVE";
    DesignationStatus["INACTIVE"] = "INACTIVE";
})(DesignationStatus || (exports.DesignationStatus = DesignationStatus = {}));
var OfficerStatus;
(function (OfficerStatus) {
    OfficerStatus["ACTIVE"] = "ACTIVE";
    OfficerStatus["INACTIVE"] = "INACTIVE";
    OfficerStatus["SUSPENDED"] = "SUSPENDED";
})(OfficerStatus || (exports.OfficerStatus = OfficerStatus = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["SALE_DEED"] = "SALE_DEED";
    DocumentType["PATTA_CHITTA"] = "PATTA_CHITTA";
    DocumentType["EXTRACT_7_12"] = "EXTRACT_7_12";
    DocumentType["SURVEY_FMB"] = "SURVEY_FMB";
    DocumentType["ENCUMBRANCE_CERTIFICATE"] = "ENCUMBRANCE_CERTIFICATE";
    DocumentType["TAX_RECEIPT"] = "TAX_RECEIPT";
    DocumentType["MUTATION_ORDER"] = "MUTATION_ORDER";
    DocumentType["SURVEY_DOCUMENT"] = "SURVEY_DOCUMENT";
    DocumentType["REGISTRATION_DOCUMENT"] = "REGISTRATION_DOCUMENT";
    DocumentType["PROPERTY_DOCUMENT"] = "PROPERTY_DOCUMENT";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
//# sourceMappingURL=status.enum.js.map