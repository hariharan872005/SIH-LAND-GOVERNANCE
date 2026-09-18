import { 
  Department, 
  Designation, 
  Officer, 
  Role, 
  Permission, 
  DigitalTwinDetail, 
  DocumentRecord, 
  AuditLogRecord,
  DashboardStats,
  LandFilterParams,
  OfficerFilterParams,
  DocumentFilterParams,
  PillarVerificationDetail,
  LandVerificationRecord,
  PersonaUser,
  GISCoordinates,
  OverallVerificationStatus
} from '../types';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_DESIGNATIONS, 
  INITIAL_OFFICERS, 
  INITIAL_ROLES, 
  INITIAL_PARCELS, 
  INITIAL_DOCUMENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_STATS 
} from '../constants/initialData';
import { ALL_PERMISSIONS } from '../constants/permissions';

const STORAGE_KEYS = {
  DEPARTMENTS: 'bhu_departments',
  DESIGNATIONS: 'bhu_designations',
  OFFICERS: 'bhu_officers',
  ROLES: 'bhu_roles',
  PARCELS: 'bhu_parcels',
  DOCUMENTS: 'bhu_documents',
  AUDIT_LOGS: 'bhu_audit_logs',
  LAND_VERIFICATIONS: 'bhu_land_verifications',
};

class MockDatabase {
  private departments: Department[] = [];
  private designations: Designation[] = [];
  private officers: Officer[] = [];
  private roles: Role[] = [];
  private permissions: Permission[] = ALL_PERMISSIONS;
  private parcels: DigitalTwinDetail[] = [];
  private documents: DocumentRecord[] = [];
  private auditLogs: AuditLogRecord[] = [];
  private normalizedVerifications: LandVerificationRecord[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const deps = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    this.departments = deps ? JSON.parse(deps) : [...INITIAL_DEPARTMENTS];

    const desigs = localStorage.getItem(STORAGE_KEYS.DESIGNATIONS);
    this.designations = desigs ? JSON.parse(desigs) : [...INITIAL_DESIGNATIONS];

    const offs = localStorage.getItem(STORAGE_KEYS.OFFICERS);
    this.officers = offs ? JSON.parse(offs) : [...INITIAL_OFFICERS];

    const rls = localStorage.getItem(STORAGE_KEYS.ROLES);
    this.roles = rls ? JSON.parse(rls) : [...INITIAL_ROLES];

    const prcs = localStorage.getItem(STORAGE_KEYS.PARCELS);
    this.parcels = prcs ? JSON.parse(prcs) : [...INITIAL_PARCELS];

    const docs = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    this.documents = docs ? JSON.parse(docs) : [...INITIAL_DOCUMENTS];

    const auds = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    this.auditLogs = auds ? JSON.parse(auds) : [...INITIAL_AUDIT_LOGS];

    const vers = localStorage.getItem(STORAGE_KEYS.LAND_VERIFICATIONS);
    if (vers) {
      this.normalizedVerifications = JSON.parse(vers);
    } else {
      this.generateInitialNormalizedVerifications();
    }
  }

  private generateInitialNormalizedVerifications() {
    this.normalizedVerifications = [];
    this.parcels.forEach((p) => {
      // 1. Revenue
      this.normalizedVerifications.push({
        id: `v_rev_${p.landId}`,
        landId: p.landId,
        departmentId: 'dept_revenue',
        departmentCode: 'REVENUE',
        departmentName: 'Revenue / Land Records',
        officerId: 'off_tahsildar_01',
        officerName: 'R. Sundaram',
        officerDesignation: 'Tahsildar',
        status: p.verificationMatrix.revenue.status === 'VERIFIED' ? 'VERIFIED' : p.verificationMatrix.revenue.status === 'REJECTED' ? 'REJECTED' : 'PENDING',
        remarks: p.verificationMatrix.revenue.comments || 'RoR Patta Chitta verified.',
        verifiedAt: p.verificationMatrix.revenue.verifiedAt || p.createdAt,
        createdAt: p.createdAt,
        updatedAt: p.lastUpdated,
      });

      // 2. Survey
      this.normalizedVerifications.push({
        id: `v_sur_${p.landId}`,
        landId: p.landId,
        departmentId: 'dept_survey',
        departmentCode: 'SURVEY',
        departmentName: 'Survey & Land Records',
        officerId: 'off_surveyor_01',
        officerName: 'K. Murugan',
        officerDesignation: 'Cadastral Surveyor',
        status: p.verificationMatrix.survey.status === 'VERIFIED' ? 'VERIFIED' : p.verificationMatrix.survey.status === 'REJECTED' ? 'REJECTED' : 'PENDING',
        remarks: p.verificationMatrix.survey.comments || 'DGPS polygon demarcated.',
        verifiedAt: p.verificationMatrix.survey.verifiedAt || null,
        createdAt: p.createdAt,
        updatedAt: p.lastUpdated,
      });

      // 3. Registration
      this.normalizedVerifications.push({
        id: `v_reg_${p.landId}`,
        landId: p.landId,
        departmentId: 'dept_registration',
        departmentCode: 'REGISTRATION',
        departmentName: 'Registration & Stamps',
        officerId: 'off_sub_registrar_01',
        officerName: 'A. Natarajan',
        officerDesignation: 'Sub-Registrar',
        status: p.verificationMatrix.registration.status === 'VERIFIED' ? 'VERIFIED' : p.verificationMatrix.registration.status === 'REJECTED' ? 'REJECTED' : 'PENDING',
        remarks: p.verificationMatrix.registration.comments || 'Deed authenticated.',
        verifiedAt: p.verificationMatrix.registration.verifiedAt || null,
        createdAt: p.createdAt,
        updatedAt: p.lastUpdated,
      });

      // 4. Municipality
      this.normalizedVerifications.push({
        id: `v_mun_${p.landId}`,
        landId: p.landId,
        departmentId: 'dept_municipality',
        departmentCode: 'MUNICIPALITY',
        departmentName: 'Municipality / Local Body',
        officerId: 'off_rev_officer_01',
        officerName: 'M. Suresh',
        officerDesignation: 'Municipal Revenue Officer',
        status: p.verificationMatrix.municipality.status === 'VERIFIED' ? 'VERIFIED' : p.verificationMatrix.municipality.status === 'REJECTED' ? 'REJECTED' : 'PENDING',
        remarks: p.verificationMatrix.municipality.comments || 'Municipal tax assessment checked.',
        verifiedAt: p.verificationMatrix.municipality.verifiedAt || null,
        createdAt: p.createdAt,
        updatedAt: p.lastUpdated,
      });
    });
    this.persist(STORAGE_KEYS.LAND_VERIFICATIONS, this.normalizedVerifications);
  }

  private persist(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to persist to localStorage: ${key}`, e);
    }
  }

  private logAudit(
    officer: { id?: string; name: string; designation?: string; departmentName?: string },
    action: AuditLogRecord['action'],
    module: AuditLogRecord['module'],
    landId?: string,
    prev?: any,
    next?: any
  ) {
    const record: AuditLogRecord = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      auditId: `AUD-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      actorId: officer.id || 'system',
      officerId: officer.id || 'sys_user',
      officerName: officer.name,
      officerDesignation: officer.designation || 'System Official',
      departmentName: officer.departmentName || 'Land Governance',
      action,
      module,
      landId,
      previousValue: prev,
      newValue: next,
      ipAddress: '10.24.112.85 (NIC Gov Gateway)',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    };
    this.auditLogs.unshift(record);
    this.persist(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    return record;
  }

  // =================== TAHSILDAR PARCEL CREATION ===================
  createParcelByTahsildar(
    tahsildar: PersonaUser,
    data: {
      landId: string;
      surveyNumber: string;
      subDivisionNumber?: string;
      landType: DigitalTwinDetail['landType'];
      areaInAcres: number;
      marketValueINR: number;
      ownerName: string;
      ownerIdHash: string;
      ownershipType: DigitalTwinDetail['ownershipType'];
      existingLandRecordRef?: string;
    }
  ): DigitalTwinDetail {
    // 1. Enforce Jurisdiction (Inherits Tahsildar Scope)
    const state = tahsildar.scope.state;
    const district = tahsildar.scope.district;
    const taluk = tahsildar.scope.taluk || 'Ambattur';
    const village = tahsildar.scope.village || 'Ambattur OT';

    // 2. Initial Coordinates Benchmark
    const centerLat = 13.115 + (Math.random() - 0.5) * 0.01;
    const centerLng = 80.155 + (Math.random() - 0.5) * 0.01;
    const offset = 0.0018 * Math.sqrt(data.areaInAcres || 1);

    const initialGisBoundary: GISCoordinates = {
      type: 'Polygon',
      coordinates: [
        [
          [centerLat - offset, centerLng - offset],
          [centerLat - offset, centerLng + offset],
          [centerLat + offset, centerLng + offset],
          [centerLat + offset, centerLng - offset],
          [centerLat - offset, centerLng - offset],
        ],
      ],
      center: [centerLat, centerLng],
    };

    const newParcel: DigitalTwinDetail = {
      id: `p_${Date.now()}`,
      landId: data.landId.toUpperCase(),
      surveyNumber: data.surveyNumber,
      subDivisionNumber: data.subDivisionNumber,
      state,
      district,
      taluk,
      village,
      areaInAcres: data.areaInAcres,
      areaInSqMeters: Math.round(data.areaInAcres * 4046.86),
      landType: data.landType,
      marketValueINR: data.marketValueINR,
      currentOwnerName: data.ownerName,
      currentOwnerIdHash: data.ownerIdHash,
      currentOwnerAadhaarMasked: `XXXX-XXXX-${data.ownerIdHash.slice(-4) || '9124'}`,
      ownershipType: data.ownershipType,
      overallStatus: 'REQUIRES_SURVEY', // State machine begins
      isDisputed: false,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      gisBoundary: initialGisBoundary,
      geoServerLayerName: `national_cadastre:${data.landId.toLowerCase()}_poly`,
      postGisTable: 'public.spatial_parcels_india',
      elevationMeters: 24.5,
      soilClassification: 'Red Sandy Loam (High Bearing Capacity)',
      landUseZoning: data.landType === 'COMMERCIAL' ? 'Commercial Mixed Use' : 'Special Primary Use',
      encumbranceStatus: 'FREE',
      taxClearanceUptoYear: 2026,
      auditHistoryCount: 1,
      verificationMatrix: {
        revenue: {
          status: 'VERIFIED',
          verifiedBy: `${tahsildar.name} (${tahsildar.designation})`,
          verifiedAt: new Date().toISOString(),
          comments: `Primary parcel and RoR ownership initiated. Ref: ${data.existingLandRecordRef || 'Govt Gazette'}`,
        },
        survey: {
          status: 'PENDING',
          comments: 'Awaiting DGPS field survey and boundary polygon demarcation by Cadastral Surveyor.',
        },
        registration: {
          status: 'PENDING',
          comments: 'Awaiting deed verification and registration validation by Sub-Registrar.',
        },
        municipality: {
          status: 'PENDING',
          comments: 'Awaiting property tax and local-body layout compliance by Municipal Revenue Officer.',
        },
      },
      ownershipLineage: [
        {
          id: `own_${Date.now()}_1`,
          name: data.ownerName,
          panOrAadhaarHash: data.ownerIdHash,
          ownershipType: data.ownershipType,
          ownershipPercentage: 100,
          acquiredDate: new Date().toISOString().split('T')[0],
          deedRegistrationNumber: `INIT/TN/${Math.floor(1000 + Math.random() * 9000)}/2026`,
          considerationAmountINR: data.marketValueINR,
          isCurrentOwner: true,
          status: 'CLEAR',
        },
      ],
      linkedDocuments: [],
    };

    this.parcels.unshift(newParcel);
    this.persist(STORAGE_KEYS.PARCELS, this.parcels);

    // Add normalized verification records
    const vRev: LandVerificationRecord = {
      id: `v_rev_${newParcel.landId}`,
      landId: newParcel.landId,
      departmentId: 'dept_revenue',
      departmentCode: 'REVENUE',
      departmentName: 'Revenue / Land Records',
      officerId: tahsildar.id,
      officerName: tahsildar.name,
      officerDesignation: tahsildar.designation,
      status: 'VERIFIED',
      remarks: newParcel.verificationMatrix.revenue.comments || '',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const vSur: LandVerificationRecord = {
      id: `v_sur_${newParcel.landId}`,
      landId: newParcel.landId,
      departmentId: 'dept_survey',
      departmentCode: 'SURVEY',
      departmentName: 'Survey & Land Records',
      officerId: '',
      officerName: 'Pending Assignment',
      officerDesignation: 'Cadastral Surveyor',
      status: 'PENDING',
      remarks: 'Pending DGPS Demarcation',
      verifiedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const vReg: LandVerificationRecord = {
      id: `v_reg_${newParcel.landId}`,
      landId: newParcel.landId,
      departmentId: 'dept_registration',
      departmentCode: 'REGISTRATION',
      departmentName: 'Registration & Stamps',
      officerId: '',
      officerName: 'Pending Assignment',
      officerDesignation: 'Sub-Registrar',
      status: 'PENDING',
      remarks: 'Pending SRO Deed Review',
      verifiedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const vMun: LandVerificationRecord = {
      id: `v_mun_${newParcel.landId}`,
      landId: newParcel.landId,
      departmentId: 'dept_municipality',
      departmentCode: 'MUNICIPALITY',
      departmentName: 'Municipality / Local Body',
      officerId: '',
      officerName: 'Pending Assignment',
      officerDesignation: 'Municipal Revenue Officer',
      status: 'PENDING',
      remarks: 'Pending Municipal Assessment',
      verifiedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.normalizedVerifications.push(vRev, vSur, vReg, vMun);
    this.persist(STORAGE_KEYS.LAND_VERIFICATIONS, this.normalizedVerifications);

    // Audit log
    this.logAudit(
      tahsildar,
      'LAND_CREATED',
      'LAND_GOVERNANCE',
      newParcel.landId,
      null,
      { landId: newParcel.landId, status: 'REQUIRES_SURVEY', owner: data.ownerName }
    );

    return newParcel;
  }

  // =================== SURVEYOR GIS & BOUNDARY VERIFICATION ===================
  submitSurveyVerification(
    surveyor: PersonaUser,
    data: {
      landId: string;
      measuredAreaAcres: number;
      polygonCoordinates: number[][];
      surveyRemarks: string;
      surveyDocName?: string;
    }
  ): DigitalTwinDetail {
    const parcel = this.parcels.find((p) => p.landId === data.landId);
    if (!parcel) throw new Error(`Land parcel ${data.landId} not found.`);

    const prev = { ...parcel };

    // Update PostGIS Polygon
    if (data.polygonCoordinates && data.polygonCoordinates.length >= 3) {
      const closedCoords = [...data.polygonCoordinates];
      if (
        closedCoords[0][0] !== closedCoords[closedCoords.length - 1][0] ||
        closedCoords[0][1] !== closedCoords[closedCoords.length - 1][1]
      ) {
        closedCoords.push(closedCoords[0]);
      }
      parcel.gisBoundary = {
        type: 'Polygon',
        coordinates: [closedCoords],
        center: [closedCoords[0][0], closedCoords[0][1]],
      };
    }

    parcel.areaInAcres = data.measuredAreaAcres || parcel.areaInAcres;
    parcel.areaInSqMeters = Math.round(parcel.areaInAcres * 4046.86);

    parcel.verificationMatrix.survey = {
      status: 'VERIFIED',
      verifiedBy: `${surveyor.name} (${surveyor.designation})`,
      verifiedAt: new Date().toISOString(),
      comments: data.surveyRemarks || 'DGPS Field Boundary demarcation matched vector cadastral shapefile in PostGIS.',
    };

    // State machine moves to REQUIRES_REGISTRATION_VERIFICATION
    parcel.overallStatus = 'REQUIRES_REGISTRATION_VERIFICATION';
    parcel.lastUpdated = new Date().toISOString();
    parcel.auditHistoryCount += 1;

    // Update Normalized Record
    const vRec = this.normalizedVerifications.find(
      (v) => v.landId === data.landId && v.departmentCode === 'SURVEY'
    );
    if (vRec) {
      vRec.status = 'VERIFIED';
      vRec.officerId = surveyor.id;
      vRec.officerName = surveyor.name;
      vRec.remarks = data.surveyRemarks;
      vRec.verifiedAt = new Date().toISOString();
      vRec.updatedAt = new Date().toISOString();
    }

    this.persist(STORAGE_KEYS.PARCELS, this.parcels);
    this.persist(STORAGE_KEYS.LAND_VERIFICATIONS, this.normalizedVerifications);

    this.logAudit(
      surveyor,
      'SURVEY_SUBMITTED',
      'LAND_GOVERNANCE',
      parcel.landId,
      { status: prev.overallStatus, area: prev.areaInAcres },
      { status: parcel.overallStatus, area: parcel.areaInAcres, remarks: data.surveyRemarks }
    );

    return parcel;
  }

  // =================== SUB-REGISTRAR REGISTRATION & TRANSFER ===================
  submitRegistrationAndTransfer(
    subRegistrar: PersonaUser,
    data: {
      landId: string;
      deedNumber: string;
      registrationDate: string;
      transferType: 'SALE' | 'INHERITANCE' | 'GIFT' | 'PARTITION' | 'GOVT_ALLOTMENT';
      newOwnerName: string;
      newOwnerIdHash: string;
      newOwnershipType: DigitalTwinDetail['ownershipType'];
      considerationAmountINR: number;
      sroOffice: string;
      remarks: string;
    }
  ): DigitalTwinDetail {
    const parcel = this.parcels.find((p) => p.landId === data.landId);
    if (!parcel) throw new Error(`Land parcel ${data.landId} not found.`);

    const prevOwnerName = parcel.currentOwnerName;

    // 1. Maintain Neo4j Historical Lineage (Mark old current owners as false)
    parcel.ownershipLineage.forEach((node) => {
      node.isCurrentOwner = false;
    });

    // 2. Append new Owner Node
    const newOwnerNode: DigitalTwinDetail['ownershipLineage'][0] = {
      id: `own_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: data.newOwnerName,
      panOrAadhaarHash: data.newOwnerIdHash,
      ownershipType: data.newOwnershipType,
      ownershipPercentage: 100,
      acquiredDate: data.registrationDate || new Date().toISOString().split('T')[0],
      deedRegistrationNumber: data.deedNumber,
      mutationId: `MUT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      considerationAmountINR: data.considerationAmountINR || parcel.marketValueINR,
      isCurrentOwner: true,
      status: 'CLEAR',
    };

    parcel.ownershipLineage.push(newOwnerNode);
    parcel.currentOwnerName = data.newOwnerName;
    parcel.currentOwnerIdHash = data.newOwnerIdHash;
    parcel.currentOwnerAadhaarMasked = `XXXX-XXXX-${data.newOwnerIdHash.slice(-4) || '8831'}`;

    // 3. Update Verification Matrix
    parcel.verificationMatrix.registration = {
      status: 'VERIFIED',
      verifiedBy: `${subRegistrar.name} (${subRegistrar.designation})`,
      verifiedAt: new Date().toISOString(),
      comments: `Deed #${data.deedNumber} registered under ${data.transferType}. Conveyance from ${prevOwnerName} to ${data.newOwnerName}. ${data.remarks}`,
    };

    // State machine moves to REQUIRES_MUNICIPAL_VERIFICATION
    parcel.overallStatus = 'REQUIRES_MUNICIPAL_VERIFICATION';
    parcel.lastUpdated = new Date().toISOString();
    parcel.auditHistoryCount += 1;

    // Update Normalized Record
    const vRec = this.normalizedVerifications.find(
      (v) => v.landId === data.landId && v.departmentCode === 'REGISTRATION'
    );
    if (vRec) {
      vRec.status = 'VERIFIED';
      vRec.officerId = subRegistrar.id;
      vRec.officerName = subRegistrar.name;
      vRec.remarks = parcel.verificationMatrix.registration.comments || '';
      vRec.verifiedAt = new Date().toISOString();
      vRec.updatedAt = new Date().toISOString();
    }

    this.persist(STORAGE_KEYS.PARCELS, this.parcels);
    this.persist(STORAGE_KEYS.LAND_VERIFICATIONS, this.normalizedVerifications);

    this.logAudit(
      subRegistrar,
      'OWNER_TRANSFERRED',
      'LAND_GOVERNANCE',
      parcel.landId,
      { previousOwner: prevOwnerName },
      {
        newOwner: data.newOwnerName,
        deedNumber: data.deedNumber,
        transferType: data.transferType,
        considerationINR: data.considerationAmountINR,
        kafkaEvent: 'LAND_TRANSFER_COMPLETED',
      }
    );

    return parcel;
  }

  // =================== REVENUE OFFICER MUNICIPAL VERIFICATION ===================
  submitMunicipalVerification(
    revenueOfficer: PersonaUser,
    data: {
      landId: string;
      propertyId: string;
      taxClearanceYear: number;
      builtUpAreaSqFt?: number;
      occupancyStatus?: string;
      remarks: string;
    }
  ): DigitalTwinDetail {
    const parcel = this.parcels.find((p) => p.landId === data.landId);
    if (!parcel) throw new Error(`Land parcel ${data.landId} not found.`);

    parcel.propertyId = data.propertyId;
    parcel.taxClearanceUptoYear = data.taxClearanceYear;
    if (data.builtUpAreaSqFt) {
      parcel.buildingInfo = {
        builtUpAreaSqFt: data.builtUpAreaSqFt,
        occupancyStatus: data.occupancyStatus || 'OCCUPIED_OWNER',
        approvalNumber: `BLD-APPR-${Math.floor(1000 + Math.random() * 9000)}/2026`,
      };
    }

    parcel.verificationMatrix.municipality = {
      status: 'VERIFIED',
      verifiedBy: `${revenueOfficer.name} (${revenueOfficer.designation})`,
      verifiedAt: new Date().toISOString(),
      comments: `Property ID ${data.propertyId} assessed. Tax dues cleared through FY ${data.taxClearanceYear}. ${data.remarks}`,
    };

    // Evaluate 4-Pillar Completion:
    // A parcel is LAND_VERIFIED ONLY if Revenue, Survey, Registration, and Municipality are ALL VERIFIED.
    const allFourVerified =
      parcel.verificationMatrix.revenue.status === 'VERIFIED' &&
      parcel.verificationMatrix.survey.status === 'VERIFIED' &&
      parcel.verificationMatrix.registration.status === 'VERIFIED' &&
      parcel.verificationMatrix.municipality.status === 'VERIFIED';

    if (allFourVerified) {
      parcel.overallStatus = 'LAND_VERIFIED';
    } else {
      parcel.overallStatus = 'MUNICIPAL_VERIFIED';
    }

    parcel.lastUpdated = new Date().toISOString();
    parcel.auditHistoryCount += 1;

    // Update Normalized Record
    const vRec = this.normalizedVerifications.find(
      (v) => v.landId === data.landId && v.departmentCode === 'MUNICIPALITY'
    );
    if (vRec) {
      vRec.status = 'VERIFIED';
      vRec.officerId = revenueOfficer.id;
      vRec.officerName = revenueOfficer.name;
      vRec.remarks = parcel.verificationMatrix.municipality.comments || '';
      vRec.verifiedAt = new Date().toISOString();
      vRec.updatedAt = new Date().toISOString();
    }

    this.persist(STORAGE_KEYS.PARCELS, this.parcels);
    this.persist(STORAGE_KEYS.LAND_VERIFICATIONS, this.normalizedVerifications);

    this.logAudit(
      revenueOfficer,
      allFourVerified ? 'LAND_VERIFIED' : 'MUNICIPAL_VERIFIED',
      'LAND_GOVERNANCE',
      parcel.landId,
      { status: 'REQUIRES_MUNICIPAL_VERIFICATION' },
      {
        status: parcel.overallStatus,
        propertyId: data.propertyId,
        allFourVerified,
      }
    );

    return parcel;
  }

  // =================== REQUEST CORRECTION / REJECTION ===================
  flagPillarCorrectionOrReject(
    officer: PersonaUser,
    landId: string,
    pillar: 'revenue' | 'survey' | 'registration' | 'municipality',
    actionType: 'REJECTED' | 'REQUIRES_CORRECTION',
    reason: string
  ): DigitalTwinDetail {
    const parcel = this.parcels.find((p) => p.landId === landId);
    if (!parcel) throw new Error(`Land parcel ${landId} not found.`);

    parcel.verificationMatrix[pillar] = {
      status: actionType,
      verifiedBy: `${officer.name} (${officer.designation})`,
      verifiedAt: new Date().toISOString(),
      comments: `[${actionType}] ${reason}`,
    };

    parcel.overallStatus = actionType;
    parcel.isDisputed = actionType === 'REJECTED';
    if (actionType === 'REJECTED') {
      parcel.disputeDetails = reason;
    }
    parcel.lastUpdated = new Date().toISOString();

    const deptCodeMap = {
      revenue: 'REVENUE',
      survey: 'SURVEY',
      registration: 'REGISTRATION',
      municipality: 'MUNICIPALITY',
    };

    const vRec = this.normalizedVerifications.find(
      (v) => v.landId === landId && v.departmentCode === deptCodeMap[pillar]
    );
    if (vRec) {
      vRec.status = actionType;
      vRec.officerId = officer.id;
      vRec.officerName = officer.name;
      vRec.remarks = reason;
      vRec.verifiedAt = new Date().toISOString();
      vRec.updatedAt = new Date().toISOString();
    }

    this.persist(STORAGE_KEYS.PARCELS, this.parcels);
    this.persist(STORAGE_KEYS.LAND_VERIFICATIONS, this.normalizedVerifications);

    this.logAudit(
      officer,
      actionType === 'REJECTED' ? 'VERIFICATION_REJECTED' : 'REQUIRES_CORRECTION',
      'LAND_GOVERNANCE',
      landId,
      null,
      { pillar, actionType, reason }
    );

    return parcel;
  }

  // =================== GENERAL QUERIES & GETTERS ===================
  getParcels(params?: LandFilterParams): DigitalTwinDetail[] {
    let list = [...this.parcels];
    if (!params) return list;

    if (params.state && params.state !== 'ALL') {
      list = list.filter((p) => p.state === params.state);
    }
    if (params.district && params.district !== 'ALL') {
      list = list.filter((p) => p.district === params.district);
    }
    if (params.taluk && params.taluk !== 'ALL') {
      list = list.filter((p) => p.taluk === params.taluk);
    }
    if (params.landType && params.landType !== 'ALL') {
      list = list.filter((p) => p.landType === params.landType);
    }
    if (params.status && params.status !== 'ALL') {
      list = list.filter((p) => p.overallStatus === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.landId.toLowerCase().includes(q) ||
          p.surveyNumber.toLowerCase().includes(q) ||
          p.currentOwnerName.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getParcelById(landId: string): DigitalTwinDetail | undefined {
    const parcel = this.parcels.find((p) => p.landId.toLowerCase() === landId.toLowerCase());
    if (parcel) {
      parcel.normalizedVerifications = this.normalizedVerifications.filter(
        (v) => v.landId.toLowerCase() === landId.toLowerCase()
      );
    }
    return parcel;
  }

  getNormalizedVerifications(landId?: string): LandVerificationRecord[] {
    if (landId) {
      return this.normalizedVerifications.filter(
        (v) => v.landId.toLowerCase() === landId.toLowerCase()
      );
    }
    return [...this.normalizedVerifications];
  }

  // DEPARTMENTS
  getDepartments(): Department[] {
    return [...this.departments];
  }

  createDepartment(dto: Partial<Department>): Department {
    const newDept: Department = {
      id: `dept_${Date.now()}`,
      name: dto.name || '',
      code: dto.code?.toUpperCase() || '',
      description: dto.description || '',
      designationCount: 0,
      officerCount: 0,
      status: dto.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.departments.push(newDept);
    this.persist(STORAGE_KEYS.DEPARTMENTS, this.departments);
    this.logAudit({ name: 'Super Admin' }, 'DEPARTMENT_CREATED', 'ORGANIZATION', undefined, null, newDept);
    return newDept;
  }

  updateDepartment(id: string, dto: Partial<Department>): Department {
    const dept = this.departments.find((d) => d.id === id);
    if (!dept) throw new Error('Department not found');
    const prev = { ...dept };
    Object.assign(dept, dto, { updatedAt: new Date().toISOString() });
    this.persist(STORAGE_KEYS.DEPARTMENTS, this.departments);
    this.logAudit({ name: 'Super Admin' }, 'DEPARTMENT_CREATED', 'ORGANIZATION', undefined, prev, dept);
    return dept;
  }

  toggleDepartmentStatus(id: string): Department {
    const dept = this.departments.find((d) => d.id === id);
    if (!dept) throw new Error('Department not found');
    dept.status = dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    dept.updatedAt = new Date().toISOString();
    this.persist(STORAGE_KEYS.DEPARTMENTS, this.departments);
    return dept;
  }

  // DESIGNATIONS
  getDesignations(): Designation[] {
    return [...this.designations];
  }

  createDesignation(dto: Partial<Designation>): Designation {
    const dept = this.departments.find((d) => d.id === dto.departmentId);
    const newDesig: Designation = {
      id: `desig_${Date.now()}`,
      title: dto.title || '',
      code: dto.code?.toUpperCase() || '',
      departmentId: dto.departmentId || '',
      departmentName: dept?.name || '',
      officerCount: 0,
      status: dto.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.designations.push(newDesig);
    if (dept) {
      dept.designationCount += 1;
      this.persist(STORAGE_KEYS.DEPARTMENTS, this.departments);
    }
    this.persist(STORAGE_KEYS.DESIGNATIONS, this.designations);
    this.logAudit({ name: 'Super Admin' }, 'DESIGNATION_CREATED', 'ORGANIZATION', undefined, null, newDesig);
    return newDesig;
  }

  updateDesignation(id: string, dto: Partial<Designation>): Designation {
    const desig = this.designations.find((d) => d.id === id);
    if (!desig) throw new Error('Designation not found');
    Object.assign(desig, dto, { updatedAt: new Date().toISOString() });
    this.persist(STORAGE_KEYS.DESIGNATIONS, this.designations);
    return desig;
  }

  toggleDesignationStatus(id: string): Designation {
    const desig = this.designations.find((d) => d.id === id);
    if (!desig) throw new Error('Designation not found');
    desig.status = desig.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    desig.updatedAt = new Date().toISOString();
    this.persist(STORAGE_KEYS.DESIGNATIONS, this.designations);
    return desig;
  }

  // OFFICERS
  getOfficers(params?: OfficerFilterParams): Officer[] {
    let list = [...this.officers];
    if (!params) return list;

    if (params.state && params.state !== 'ALL') {
      list = list.filter((o) => o.scope.state === params.state);
    }
    if (params.departmentId && params.departmentId !== 'ALL') {
      list = list.filter((o) => o.departmentId === params.departmentId);
    }
    if (params.status && params.status !== 'ALL') {
      list = list.filter((o) => o.status === params.status);
    }
    return list;
  }

  createOfficer(dto: any): Officer {
    const dept = this.departments.find((d) => d.id === dto.departmentId);
    const desig = this.designations.find((d) => d.id === dto.designationId);
    const role = this.roles.find((r) => r.id === dto.roleId);

    const newOfficer: Officer = {
      id: `off_${Date.now()}`,
      fullName: dto.fullName,
      employeeId: dto.employeeId,
      email: dto.email,
      password: dto.password || 'Password@123',
      phone: dto.phone,
      departmentId: dto.departmentId,
      departmentName: dept?.name || '',
      designationId: dto.designationId,
      designationTitle: desig?.title || '',
      roleId: dto.roleId || '',
      roleName: role?.name || 'Verifying Officer',
      scope: dto.scope,
      status: dto.status || 'ACTIVE',
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.officers.push(newOfficer);
    if (dept) dept.officerCount += 1;
    if (desig) desig.officerCount += 1;
    if (role) role.officerCount += 1;

    this.persist(STORAGE_KEYS.OFFICERS, this.officers);
    this.persist(STORAGE_KEYS.DEPARTMENTS, this.departments);
    this.persist(STORAGE_KEYS.DESIGNATIONS, this.designations);
    this.persist(STORAGE_KEYS.ROLES, this.roles);

    this.logAudit({ name: 'Super Admin' }, 'OFFICER_CREATED', 'ORGANIZATION', undefined, null, newOfficer);
    return newOfficer;
  }

  updateOfficer(id: string, dto: any): Officer {
    const off = this.officers.find((o) => o.id === id);
    if (!off) throw new Error('Officer not found');
    const prev = { ...off };
    Object.assign(off, dto, { updatedAt: new Date().toISOString() });
    this.persist(STORAGE_KEYS.OFFICERS, this.officers);
    this.logAudit({ name: 'Super Admin' }, 'OFFICER_STATUS_CHANGED', 'ORGANIZATION', undefined, prev, off);
    return off;
  }

  toggleOfficerStatus(id: string): Officer {
    const off = this.officers.find((o) => o.id === id);
    if (!off) throw new Error('Officer not found');
    off.status = off.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    off.updatedAt = new Date().toISOString();
    this.persist(STORAGE_KEYS.OFFICERS, this.officers);
    return off;
  }

  resetOfficerAccess(id: string) {
    const off = this.officers.find((o) => o.id === id);
    if (!off) throw new Error('Officer not found');
    const tempPassword = `Gov@${Math.floor(100000 + Math.random() * 900000)}`;
    this.logAudit({ name: 'Super Admin' }, 'PERMISSION_CHANGED', 'ACCESS_CONTROL', undefined, null, {
      officerId: off.id,
      action: 'PASSWORD_RESET',
    });
    return { success: true, tempPassword };
  }

  deleteOfficer(id: string): boolean {
    const idx = this.officers.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Officer record not found');
    const deleted = this.officers[idx];
    this.officers.splice(idx, 1);
    this.persist(STORAGE_KEYS.OFFICERS, this.officers);
    this.logAudit({ name: 'Super Admin' }, 'OFFICER_STATUS_CHANGED', 'ORGANIZATION', undefined, deleted, null);
    return true;
  }

  updateOfficerCredentials(idOrEmail: string, email?: string, password?: string, name?: string): Officer | null {
    const cleanSearch = idOrEmail.toLowerCase();
    const off = this.officers.find(
      (o) => o.id === idOrEmail || o.email.toLowerCase() === cleanSearch
    );
    if (off) {
      if (email) off.email = email.trim().toLowerCase();
      if (password) off.password = password;
      if (name) off.fullName = name.trim();
      off.updatedAt = new Date().toISOString();
      this.persist(STORAGE_KEYS.OFFICERS, this.officers);
      return off;
    }
    return null;
  }

  authenticateOfficer(email: string, password: string): Officer | null {
    const cleanEmail = email.trim().toLowerCase();
    const off = this.officers.find((o) => o.email.toLowerCase() === cleanEmail);
    if (off) {
      if (off.password && off.password === password) {
        return off;
      }
      if (!off.password && (password === 'Password@123' || password === 'Admin@123' || password.length >= 4)) {
        return off;
      }
    }
    return null;
  }

  // ROLES & PERMISSIONS
  getRoles(): Role[] {
    return [...this.roles];
  }

  createRole(dto: any): Role {
    const dept = this.departments.find((d) => d.id === dto.departmentId);
    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: dto.name,
      departmentId: dto.departmentId,
      departmentName: dept?.name || '',
      designationId: dto.designationId || '',
      designationTitle: '',
      description: dto.description,
      permissions: dto.permissions || [],
      isSystemRole: false,
      officerCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.roles.push(newRole);
    this.persist(STORAGE_KEYS.ROLES, this.roles);
    this.logAudit({ name: 'Super Admin' }, 'PERMISSION_CHANGED', 'ACCESS_CONTROL', undefined, null, newRole);
    return newRole;
  }

  getPermissions(): Permission[] {
    return [...this.permissions];
  }

  // DOCUMENTS
  getDocuments(params?: DocumentFilterParams): DocumentRecord[] {
    let list = [...this.documents];
    if (params?.landId) {
      list = list.filter((d) => d.landId === params.landId);
    }
    if (params?.documentType && params.documentType !== 'ALL') {
      list = list.filter((d) => d.documentType === params.documentType);
    }
    return list;
  }

  uploadDocument(doc: any): DocumentRecord {
    const dept = this.departments.find((d) => d.id === doc.departmentId);
    const newDoc: DocumentRecord = {
      id: `doc_${Date.now()}`,
      documentName: doc.documentName,
      documentType: doc.documentType,
      landId: doc.landId,
      uploadedByOfficerId: 'off_01',
      uploadedByOfficerName: 'Super Admin',
      departmentId: doc.departmentId,
      departmentName: dept?.name || 'Revenue / Land Records',
      fileSizeBytes: Math.floor(1024 * 1024 * (1.5 + Math.random() * 4)),
      mimeType: 'application/pdf',
      s3Bucket: 'gov-land-vault-prod-s3',
      s3Key: `cadastre/${doc.landId}/${Date.now()}_${doc.documentName.replace(/\s+/g, '_')}.pdf`,
      s3Url: `s3://gov-land-vault-prod-s3/cadastre/${doc.landId}/${doc.documentName}.pdf`,
      verificationStatus: 'VERIFIED',
      uploadDate: new Date().toISOString(),
      metadata: {
        hashMD5: `md5_${Math.random().toString(16).substring(2, 10)}`,
        scannerModel: 'Canon Flatbed DRS-9900 (NIC Calibrated)',
        verifiedSignature: 'SHA256:ECDSA:GOV_INDIA_ROOT_CA',
      },
    };
    this.documents.unshift(newDoc);
    this.persist(STORAGE_KEYS.DOCUMENTS, this.documents);

    const parcel = this.parcels.find((p) => p.landId === doc.landId);
    if (parcel) {
      parcel.linkedDocuments.push(newDoc);
      this.persist(STORAGE_KEYS.PARCELS, this.parcels);
    }

    this.logAudit({ name: 'Super Admin' }, 'DOCUMENT_UPLOADED', 'DOCUMENTS', doc.landId, null, newDoc);
    return newDoc;
  }

  // AUDIT LOGS
  getAuditLogs(): AuditLogRecord[] {
    return [...this.auditLogs];
  }

  // DASHBOARD STATS
  getStats(): DashboardStats {
    const verifiedCount = this.parcels.filter((p) => p.overallStatus === 'LAND_VERIFIED').length;
    const pendingCount = this.parcels.filter(
      (p) => p.overallStatus !== 'LAND_VERIFIED' && p.overallStatus !== 'REJECTED'
    ).length;
    const disputedCount = this.parcels.filter(
      (p) => p.isDisputed || p.overallStatus === 'REJECTED'
    ).length;

    return {
      ...INITIAL_STATS,
      totalParcels: this.parcels.length,
      verifiedParcels: verifiedCount,
      pendingVerification: pendingCount,
      disputedParcels: disputedCount,
      totalOfficers: this.officers.length,
      activeDepartments: this.departments.filter((d) => d.status === 'ACTIVE').length,
      recentOfficerActivity: this.auditLogs.slice(0, 6),
    };
  }
}

export const mockDb = new MockDatabase();
export const mockStore = mockDb;
