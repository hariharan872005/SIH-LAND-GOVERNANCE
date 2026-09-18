"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCadastreSeed = runCadastreSeed;
const state_entity_1 = require("../../modules/administrative-scope/entities/state.entity");
const district_entity_1 = require("../../modules/administrative-scope/entities/district.entity");
const taluk_entity_1 = require("../../modules/administrative-scope/entities/taluk.entity");
const village_entity_1 = require("../../modules/administrative-scope/entities/village.entity");
const department_entity_1 = require("../../modules/organization/entities/department.entity");
const designation_entity_1 = require("../../modules/organization/entities/designation.entity");
const role_entity_1 = require("../../modules/organization/entities/role.entity");
const permission_entity_1 = require("../../modules/organization/entities/permission.entity");
const officer_entity_1 = require("../../modules/organization/entities/officer.entity");
const land_parcel_entity_1 = require("../../modules/lands/entities/land-parcel.entity");
const land_owner_entity_1 = require("../../modules/lands/entities/land-owner.entity");
const land_verification_entity_1 = require("../../modules/verification/entities/land-verification.entity");
const land_transfer_transaction_entity_1 = require("../../modules/land-transfer/entities/land-transfer-transaction.entity");
const municipal_assessment_entity_1 = require("../../modules/municipal/entities/municipal-assessment.entity");
const document_record_entity_1 = require("../../modules/documents/entities/document-record.entity");
const status_enum_1 = require("../../common/constants/status.enum");
const permissions_enum_1 = require("../../common/constants/permissions.enum");
const roles_enum_1 = require("../../common/constants/roles.enum");
async function runCadastreSeed(dataSource) {
    console.log('🌱 [Seed] Initiating National Cadastral Database Seeding...');
    const stateRepo = dataSource.getRepository(state_entity_1.State);
    const distRepo = dataSource.getRepository(district_entity_1.District);
    const talukRepo = dataSource.getRepository(taluk_entity_1.Taluk);
    const vilRepo = dataSource.getRepository(village_entity_1.Village);
    const deptRepo = dataSource.getRepository(department_entity_1.Department);
    const desigRepo = dataSource.getRepository(designation_entity_1.Designation);
    const roleRepo = dataSource.getRepository(role_entity_1.Role);
    const permRepo = dataSource.getRepository(permission_entity_1.Permission);
    const offRepo = dataSource.getRepository(officer_entity_1.Officer);
    const landRepo = dataSource.getRepository(land_parcel_entity_1.LandParcel);
    const ownerRepo = dataSource.getRepository(land_owner_entity_1.LandOwner);
    const verRepo = dataSource.getRepository(land_verification_entity_1.LandVerification);
    const txRepo = dataSource.getRepository(land_transfer_transaction_entity_1.LandTransferTransaction);
    const muniRepo = dataSource.getRepository(municipal_assessment_entity_1.MunicipalAssessment);
    const docRepo = dataSource.getRepository(document_record_entity_1.DocumentRecord);
    console.log('🗺️ Seeding States, Districts, Taluks, Villages...');
    const stateTN = stateRepo.create({ id: 'state_tn', name: 'Tamil Nadu', code: 'TN' });
    const stateKA = stateRepo.create({ id: 'state_ka', name: 'Karnataka', code: 'KA' });
    const stateMH = stateRepo.create({ id: 'state_mh', name: 'Maharashtra', code: 'MH' });
    await stateRepo.save([stateTN, stateKA, stateMH]);
    const distChe = distRepo.create({ id: 'dist_che', name: 'Chennai', stateId: 'state_tn' });
    const distCbe = distRepo.create({ id: 'dist_cbe', name: 'Coimbatore', stateId: 'state_tn' });
    const distBlr = distRepo.create({ id: 'dist_blr_u', name: 'Bengaluru Urban', stateId: 'state_ka' });
    const distPun = distRepo.create({ id: 'dist_pun', name: 'Pune', stateId: 'state_mh' });
    await distRepo.save([distChe, distCbe, distBlr, distPun]);
    const talukAmb = talukRepo.create({ id: 'taluk_amb', name: 'Ambattur', districtId: 'dist_che' });
    const talukMyl = talukRepo.create({ id: 'taluk_myl', name: 'Mylapore', districtId: 'dist_che' });
    const talukBlrN = talukRepo.create({ id: 'taluk_blr_n', name: 'Bengaluru North', districtId: 'dist_blr_u' });
    const talukHav = talukRepo.create({ id: 'taluk_hav', name: 'Haveli', districtId: 'dist_pun' });
    await talukRepo.save([talukAmb, talukMyl, talukBlrN, talukHav]);
    const vilAmbOt = vilRepo.create({ id: 'vil_amb_ot', name: 'Ambattur OT', talukId: 'taluk_amb' });
    const vilPadi = vilRepo.create({ id: 'vil_padi', name: 'Padi Industrial', talukId: 'taluk_amb' });
    const vilMyl = vilRepo.create({ id: 'vil_myl', name: 'Mylapore Heritage', talukId: 'taluk_myl' });
    const vilYel = vilRepo.create({ id: 'vil_yel', name: 'Yelahanka Satellite', talukId: 'taluk_blr_n' });
    const vilHin = vilRepo.create({ id: 'vil_hin', name: 'Hinjawadi IT Phase 1', talukId: 'taluk_hav' });
    await vilRepo.save([vilAmbOt, vilPadi, vilMyl, vilYel, vilHin]);
    console.log('🏛️ Seeding Departments and Designations...');
    const deptGov = deptRepo.create({ id: 'dept_gov_00', name: 'National Governance Controller', code: 'SYSTEM', status: status_enum_1.DepartmentStatus.ACTIVE });
    const deptRev = deptRepo.create({ id: 'dept_rev_01', name: 'Revenue / Land Records Department', code: 'REVENUE', status: status_enum_1.DepartmentStatus.ACTIVE });
    const deptSurv = deptRepo.create({ id: 'dept_surv_02', name: 'Survey & Land Records Department', code: 'SURVEY', status: status_enum_1.DepartmentStatus.ACTIVE });
    const deptReg = deptRepo.create({ id: 'dept_reg_03', name: 'Registration & Stamps Department', code: 'REGISTRATION', status: status_enum_1.DepartmentStatus.ACTIVE });
    const deptMuni = deptRepo.create({ id: 'dept_muni_04', name: 'Municipality / Local Body Revenue', code: 'MUNICIPALITY', status: status_enum_1.DepartmentStatus.ACTIVE });
    await deptRepo.save([deptGov, deptRev, deptSurv, deptReg, deptMuni]);
    const desigAdmin = desigRepo.create({ id: 'desig_super_admin', title: 'National Governance Controller', code: 'SUPER_ADMIN', departmentId: 'dept_gov_00', status: status_enum_1.DesignationStatus.ACTIVE });
    const desigTah = desigRepo.create({ id: 'desig_tahsildar', title: 'Tahsildar (Taluk Executive Magistrate)', code: 'TAHSILDAR', departmentId: 'dept_rev_01', status: status_enum_1.DesignationStatus.ACTIVE });
    const desigSur = desigRepo.create({ id: 'desig_surveyor', title: 'Senior Cadastral DGPS Surveyor', code: 'SURVEYOR', departmentId: 'dept_surv_02', status: status_enum_1.DesignationStatus.ACTIVE });
    const desigSro = desigRepo.create({ id: 'desig_sub_registrar', title: 'Sub-Registrar (Registration Officer)', code: 'SUB_REGISTRAR', departmentId: 'dept_reg_03', status: status_enum_1.DesignationStatus.ACTIVE });
    const desigMun = desigRepo.create({ id: 'desig_revenue_officer', title: 'Municipal Revenue Officer', code: 'REVENUE_OFFICER', departmentId: 'dept_muni_04', status: status_enum_1.DesignationStatus.ACTIVE });
    await desigRepo.save([desigAdmin, desigTah, desigSur, desigSro, desigMun]);
    console.log('🛡️ Seeding Permissions and RBAC Roles...');
    const permissionsList = Object.values(permissions_enum_1.PermissionCode).map((code) => {
        return permRepo.create({
            id: `perm_${code.toLowerCase()}`,
            code,
            name: code.replace(/_/g, ' '),
            category: code.includes('SURVEY') ? 'SURVEY' : code.includes('REGISTRATION') ? 'REGISTRATION' : code.includes('PROPERTY') || code.includes('TAX') ? 'MUNICIPALITY' : code.includes('MANAGE') ? 'SYSTEM' : 'REVENUE',
        });
    });
    await permRepo.save(permissionsList);
    const roleAdmin = roleRepo.create({
        id: 'role_super_admin',
        name: roles_enum_1.OfficerRole.SUPER_ADMIN,
        isSystemRole: true,
        permissions: permissionsList,
    });
    const roleTah = roleRepo.create({
        id: 'role_tahsildar',
        name: roles_enum_1.OfficerRole.TAHSILDAR,
        isSystemRole: true,
        permissions: permissionsList.filter((p) => [
            permissions_enum_1.PermissionCode.VIEW_LAND,
            permissions_enum_1.PermissionCode.CREATE_LAND,
            permissions_enum_1.PermissionCode.UPDATE_LAND,
            permissions_enum_1.PermissionCode.VIEW_GIS,
            permissions_enum_1.PermissionCode.VERIFY_OWNERSHIP,
            permissions_enum_1.PermissionCode.APPROVE_MUTATION,
            permissions_enum_1.PermissionCode.VIEW_TRANSFER_HISTORY,
            permissions_enum_1.PermissionCode.VIEW_DOCUMENTS,
            permissions_enum_1.PermissionCode.VIEW_DIGITAL_TWINS,
        ].includes(p.code)),
    });
    const roleSurv = roleRepo.create({
        id: 'role_surveyor',
        name: roles_enum_1.OfficerRole.SURVEYOR,
        isSystemRole: true,
        permissions: permissionsList.filter((p) => [
            permissions_enum_1.PermissionCode.VIEW_LAND,
            permissions_enum_1.PermissionCode.VIEW_GIS,
            permissions_enum_1.PermissionCode.CREATE_SURVEY,
            permissions_enum_1.PermissionCode.UPDATE_SURVEY,
            permissions_enum_1.PermissionCode.UPDATE_PROPOSED_BOUNDARY,
            permissions_enum_1.PermissionCode.UPLOAD_SURVEY_DOCUMENT,
            permissions_enum_1.PermissionCode.SUBMIT_SURVEY_VERIFICATION,
            permissions_enum_1.PermissionCode.VIEW_DOCUMENTS,
            permissions_enum_1.PermissionCode.VIEW_DIGITAL_TWINS,
        ].includes(p.code)),
    });
    const roleSro = roleRepo.create({
        id: 'role_sub_registrar',
        name: roles_enum_1.OfficerRole.SUB_REGISTRAR,
        isSystemRole: true,
        permissions: permissionsList.filter((p) => [
            permissions_enum_1.PermissionCode.VIEW_LAND,
            permissions_enum_1.PermissionCode.VIEW_OWNERSHIP,
            permissions_enum_1.PermissionCode.VERIFY_REGISTRATION,
            permissions_enum_1.PermissionCode.CREATE_TRANSFER,
            permissions_enum_1.PermissionCode.UPLOAD_REGISTRATION_DOCUMENT,
            permissions_enum_1.PermissionCode.VIEW_TRANSFER_HISTORY,
            permissions_enum_1.PermissionCode.VIEW_DOCUMENTS,
            permissions_enum_1.PermissionCode.VIEW_DIGITAL_TWINS,
        ].includes(p.code)),
    });
    const roleMun = roleRepo.create({
        id: 'role_revenue_officer',
        name: roles_enum_1.OfficerRole.REVENUE_OFFICER,
        isSystemRole: true,
        permissions: permissionsList.filter((p) => [
            permissions_enum_1.PermissionCode.VIEW_LAND,
            permissions_enum_1.PermissionCode.VIEW_PROPERTY,
            permissions_enum_1.PermissionCode.VERIFY_PROPERTY,
            permissions_enum_1.PermissionCode.VERIFY_TAX,
            permissions_enum_1.PermissionCode.UPLOAD_PROPERTY_DOCUMENT,
            permissions_enum_1.PermissionCode.VIEW_DOCUMENTS,
            permissions_enum_1.PermissionCode.VIEW_DIGITAL_TWINS,
        ].includes(p.code)),
    });
    await roleRepo.save([roleAdmin, roleTah, roleSurv, roleSro, roleMun]);
    console.log('👤 Seeding 5 Government Officers with Geographical Scope...');
    const offAdmin = offRepo.create({
        id: 'off_super_admin',
        employeeId: 'GOV-IND-001',
        fullName: 'Vikramaditya Sharma',
        email: 'admin.cadastre@gov.in',
        departmentId: 'dept_gov_00',
        designationId: 'desig_super_admin',
        roleId: 'role_super_admin',
        status: status_enum_1.OfficerStatus.ACTIVE,
    });
    const offTah = offRepo.create({
        id: 'off_tahsildar_01',
        employeeId: 'GOV-TN-REV-1042',
        fullName: 'R. Sundaram',
        email: 'sundaram.tahsildar@tn.gov.in',
        phone: '+91 94440 12042',
        departmentId: 'dept_rev_01',
        designationId: 'desig_tahsildar',
        roleId: 'role_tahsildar',
        stateId: 'state_tn',
        districtId: 'dist_che',
        talukId: 'taluk_amb',
        villageId: 'vil_amb_ot',
        status: status_enum_1.OfficerStatus.ACTIVE,
    });
    const offSurv = offRepo.create({
        id: 'off_surveyor_01',
        employeeId: 'GOV-TN-SUR-8841',
        fullName: 'K. Murugan',
        email: 'k.murugan.survey@tn.gov.in',
        phone: '+91 94441 88410',
        departmentId: 'dept_surv_02',
        designationId: 'desig_surveyor',
        roleId: 'role_surveyor',
        stateId: 'state_tn',
        districtId: 'dist_che',
        talukId: 'taluk_amb',
        villageId: 'vil_amb_ot',
        status: status_enum_1.OfficerStatus.ACTIVE,
    });
    const offSro = offRepo.create({
        id: 'off_sub_registrar_01',
        employeeId: 'GOV-TN-REG-4402',
        fullName: 'A. Natarajan',
        email: 'a.natarajan.sro@tn.gov.in',
        phone: '+91 94442 44020',
        departmentId: 'dept_reg_03',
        designationId: 'desig_sub_registrar',
        roleId: 'role_sub_registrar',
        stateId: 'state_tn',
        districtId: 'dist_che',
        talukId: 'taluk_amb',
        status: status_enum_1.OfficerStatus.ACTIVE,
    });
    const offMun = offRepo.create({
        id: 'off_rev_officer_01',
        employeeId: 'GOV-TN-MUN-3091',
        fullName: 'M. Suresh',
        email: 'm.suresh.revenue@chennaicorp.gov.in',
        phone: '+91 94443 30910',
        departmentId: 'dept_muni_04',
        designationId: 'desig_revenue_officer',
        roleId: 'role_revenue_officer',
        stateId: 'state_tn',
        districtId: 'dist_che',
        talukId: 'taluk_amb',
        status: status_enum_1.OfficerStatus.ACTIVE,
    });
    await offRepo.save([offAdmin, offTah, offSurv, offSro, offMun]);
    console.log('📦 Seeding Initial Land Parcels & 4-Pillar Verifications...');
    const polyGeoJson = {
        type: 'Polygon',
        coordinates: [
            [
                [80.1542, 13.1132],
                [80.1582, 13.1132],
                [80.1582, 13.1172],
                [80.1542, 13.1172],
                [80.1542, 13.1132],
            ],
        ],
    };
    const p101 = landRepo.create({
        id: 'land_p101_uuid',
        landId: 'TN-CHE-101',
        surveyNumber: '142/3B',
        subdivisionNumber: '1',
        stateId: 'state_tn',
        districtId: 'dist_che',
        talukId: 'taluk_amb',
        villageId: 'vil_amb_ot',
        landType: status_enum_1.LandType.COMMERCIAL,
        classification: 'Commercial IT Mixed Zone',
        registeredArea: 2.45,
        measuredArea: 2.45,
        marketValueINR: 85000000,
        status: status_enum_1.LandStatus.LAND_VERIFIED,
        createdByOfficerId: 'off_tahsildar_01',
        gisCoordinatesJson: polyGeoJson,
        geoServerLayerName: 'national_cadastre:tn_che_101_poly',
    });
    await landRepo.save(p101);
    const p101Owner1 = ownerRepo.create({
        id: 'own_p101_hist_1',
        landId: p101.id,
        ownerName: 'V. Sundaram & Sons Enterprises',
        ownerIdHash: 'PAN:AAACS9841K',
        maskedAadhaarOrId: 'XXXX-XXXX-9841',
        ownershipType: status_enum_1.OwnershipType.CORPORATE,
        ownershipPercentage: 100,
        isCurrentOwner: false,
        acquiredDate: new Date('2018-04-12'),
        relinquishedDate: new Date('2024-02-14'),
        deedRegistrationNumber: 'DOC/TN/AMB/1948/2018',
        considerationAmountINR: 52000000,
    });
    const p101Owner2 = ownerRepo.create({
        id: 'own_p101_curr_2',
        landId: p101.id,
        ownerName: 'Lakshmi Narayanan Real Estate Pvt Ltd',
        ownerIdHash: 'CIN:U70100TN2024PTC8849',
        maskedAadhaarOrId: 'XXXX-XXXX-8849',
        ownershipType: status_enum_1.OwnershipType.CORPORATE,
        ownershipPercentage: 100,
        isCurrentOwner: true,
        acquiredDate: new Date('2024-02-14'),
        deedRegistrationNumber: 'DOC/TN/AMB/8842/2024',
        mutationDocketNumber: 'MUT-2024-77102',
        considerationAmountINR: 85000000,
    });
    await ownerRepo.save([p101Owner1, p101Owner2]);
    const v1 = verRepo.create({
        id: 'ver_p101_rev',
        landId: p101.id,
        departmentId: 'dept_rev_01',
        officerId: 'off_tahsildar_01',
        status: status_enum_1.VerificationStatus.VERIFIED,
        remarks: 'Record of Rights verified. Mutation docket MUT-2024-77102 sanctioned.',
        referenceDocketNumber: 'MUT-2024-77102',
        verifiedAt: new Date('2024-02-15'),
    });
    const v2 = verRepo.create({
        id: 'ver_p101_surv',
        landId: p101.id,
        departmentId: 'dept_surv_02',
        officerId: 'off_surveyor_01',
        status: status_enum_1.VerificationStatus.VERIFIED,
        remarks: 'DGPS survey benchmarked against CORS network. Extent 2.45 acres demarcated.',
        referenceDocketNumber: 'DGPS-FMB-142-3B',
        verifiedAt: new Date('2024-02-18'),
    });
    const v3 = verRepo.create({
        id: 'ver_p101_reg',
        landId: p101.id,
        departmentId: 'dept_reg_03',
        officerId: 'off_sub_registrar_01',
        status: status_enum_1.VerificationStatus.VERIFIED,
        remarks: 'Conveyance Deed #8842/2024 registered. Stamp duty cleared.',
        referenceDocketNumber: 'DOC/TN/AMB/8842/2024',
        verifiedAt: new Date('2024-02-14'),
    });
    const v4 = verRepo.create({
        id: 'ver_p101_muni',
        landId: p101.id,
        departmentId: 'dept_muni_04',
        officerId: 'off_rev_officer_01',
        status: status_enum_1.VerificationStatus.VERIFIED,
        remarks: 'Property Tax PID: PROP-CHE-8842 assessed and cleared up to FY 2026.',
        referenceDocketNumber: 'PROP-CHE-8842',
        verifiedAt: new Date('2024-02-22'),
    });
    await verRepo.save([v1, v2, v3, v4]);
    const muniAss = muniRepo.create({
        id: 'muni_p101_ass',
        landId: p101.id,
        propertyId: 'PROP-CHE-8842',
        propertyClassification: 'COMMERCIAL_BUILDING',
        builtUpAreaSqFt: 18500,
        floorsCount: 4,
        occupancyStatus: 'COMMERCIAL_OCCUPIED',
        taxClearanceUptoYear: 2026,
        isTaxCleared: true,
        municipalRemarks: 'Commercial IT Park. CMDA Completion Certificate #CC/2024/9912.',
        verifiedByOfficerId: 'off_rev_officer_01',
    });
    await muniRepo.save(muniAss);
    const tx1 = txRepo.create({
        id: 'tx_p101_2024',
        landId: p101.id,
        fromOwnerId: 'own_p101_hist_1',
        fromOwnerName: 'V. Sundaram & Sons Enterprises',
        toOwnerId: 'own_p101_curr_2',
        toOwnerName: 'Lakshmi Narayanan Real Estate Pvt Ltd',
        toOwnerIdHash: 'CIN:U70100TN2024PTC8849',
        transferType: status_enum_1.TransferType.SALE,
        deedNumber: 'DOC/TN/AMB/8842/2024',
        registrationNumber: 'REG/SRO/4402/2024',
        registrationDate: new Date('2024-02-14'),
        considerationAmountINR: 85000000,
        subRegistrarOffice: 'Sub-Registrar Office Ambattur',
        status: 'COMPLETED',
        createdByOfficerId: 'off_sub_registrar_01',
        remarks: 'Absolute Sale Deed registered with full consideration.',
    });
    await txRepo.save(tx1);
    const doc1 = docRepo.create({
        id: 'doc_p101_deed',
        landId: p101.id,
        documentName: 'Certified_Sale_Deed_8842_2024.pdf',
        documentType: status_enum_1.DocumentType.SALE_DEED,
        storageKey: 'cadastre/TN-CHE-101/Certified_Sale_Deed_8842_2024.pdf',
        s3Url: 's3://gov-land-vault-prod/cadastre/TN-CHE-101/Certified_Sale_Deed_8842_2024.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 4892410,
        documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        uploadedByOfficerId: 'off_sub_registrar_01',
        verificationStatus: status_enum_1.VerificationStatus.VERIFIED,
        metadata: {
            scannerModel: 'Canon Flatbed DRS-9900',
            verifiedSignature: 'SHA256:ECDSA:GOV_INDIA_ROOT_CA',
            pageCount: 12,
        },
    });
    await docRepo.save(doc1);
    console.log('✅ [Seed] Cadastral database seeding completed successfully!');
}
//# sourceMappingURL=seed.js.map