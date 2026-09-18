import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PersonaUser, OfficerRole, PermissionCode } from '../types';
import { mockStore } from '../services/mockStore';

export const resolveOfficerRole = (input: {
  role?: string;
  designation?: string;
  department?: string;
  email?: string;
}): OfficerRole => {
  const roleStr = (input.role || '').toLowerCase();
  const desigStr = (input.designation || '').toLowerCase();
  const deptStr = (input.department || '').toLowerCase();
  const emailStr = (input.email || '').toLowerCase();

  const text = `${roleStr} ${desigStr} ${deptStr} ${emailStr}`;

  if (text.includes('super') || text.includes('admin')) {
    return 'SUPER_ADMIN';
  }
  if (
    text.includes('sub_registrar') ||
    text.includes('subregistrar') ||
    text.includes('sub-registrar') ||
    text.includes('sub registrar') ||
    text.includes('sro') ||
    text.includes('registration') ||
    text.includes('stamp')
  ) {
    return 'SUB_REGISTRAR';
  }
  if (text.includes('survey') || text.includes('cadastral') || text.includes('dgps')) {
    return 'SURVEYOR';
  }
  if (
    text.includes('municipality') ||
    text.includes('municipal') ||
    text.includes('revofficer') ||
    text.includes('local body')
  ) {
    return 'REVENUE_OFFICER';
  }
  return 'TAHSILDAR';
};

export const PREDEFINED_PERSONAS: Record<OfficerRole, PersonaUser> = {
  SUPER_ADMIN: {
    id: 'off_super_admin',
    name: 'Vikramaditya Sharma',
    role: 'SUPER_ADMIN',
    designation: 'National Governance Controller',
    departmentName: 'Ministry of Land Resources & Cadastre',
    departmentCode: 'SYSTEM',
    employeeId: 'GOV-IND-001',
    email: 'admin.cadastre@gov.in',
    scope: {
      country: 'India',
      state: 'National (All States)',
      district: 'All Districts',
      taluk: 'All Taluks',
      village: 'All Wards',
    },
    permissions: [
      'MANAGE_DEPARTMENTS',
      'MANAGE_DESIGNATIONS',
      'MANAGE_OFFICERS',
      'MANAGE_ROLES',
      'VIEW_AUDIT_LOGS',
      'MANAGE_SETTINGS',
      'VIEW_DIGITAL_TWINS',
      'VIEW_LAND',
      'VIEW_GIS',
      'VIEW_DOCUMENTS',
      'VIEW_OWNERSHIP',
      'VIEW_TRANSFER_HISTORY',
    ],
  },
  TAHSILDAR: {
    id: 'off_tahsildar_01',
    name: 'R. Sundaram',
    role: 'TAHSILDAR',
    designation: 'Tahsildar (Taluk Executive Magistrate)',
    departmentName: 'Revenue / Land Records',
    departmentCode: 'REVENUE',
    employeeId: 'GOV-TN-REV-1042',
    email: 'sundaram.tahsildar@tn.gov.in',
    scope: {
      country: 'India',
      state: 'Tamil Nadu',
      district: 'Chennai',
      taluk: 'Ambattur',
      village: 'Ambattur OT',
      stateId: 'state_tn',
      districtId: 'dist_che',
      talukId: 'taluk_amb',
      villageId: 'vil_amb_ot',
    },
    permissions: [
      'VIEW_LAND',
      'CREATE_LAND_PARCEL',
      'VIEW_GIS',
      'VERIFY_OWNERSHIP',
      'APPROVE_MUTATION',
      'VIEW_TRANSFER_HISTORY',
      'VIEW_DOCUMENTS',
      'VIEW_DIGITAL_TWINS',
    ],
  },
  SURVEYOR: {
    id: 'off_surveyor_01',
    name: 'K. Murugan',
    role: 'SURVEYOR',
    designation: 'Cadastral Surveyor (DGPS Specialist)',
    departmentName: 'Survey & Land Records',
    departmentCode: 'SURVEY',
    employeeId: 'GOV-TN-SUR-8841',
    email: 'k.murugan.survey@tn.gov.in',
    scope: {
      country: 'India',
      state: 'Tamil Nadu',
      district: 'Chennai',
      taluk: 'Ambattur',
      village: 'Ambattur OT',
      stateId: 'state_tn',
      districtId: 'dist_che',
      talukId: 'taluk_amb',
      villageId: 'vil_amb_ot',
    },
    permissions: [
      'VIEW_LAND',
      'VIEW_GIS',
      'CREATE_SURVEY',
      'UPDATE_PROPOSED_BOUNDARY',
      'UPLOAD_SURVEY',
      'SUBMIT_VERIFICATION',
      'DEMARCATE_BOUNDARY',
      'VIEW_DOCUMENTS',
      'VIEW_DIGITAL_TWINS',
    ],
  },
  SUB_REGISTRAR: {
    id: 'off_sub_registrar_01',
    name: 'A. Natarajan',
    role: 'SUB_REGISTRAR',
    designation: 'Sub-Registrar (SRO Ambattur)',
    departmentName: 'Registration & Stamps',
    departmentCode: 'REGISTRATION',
    employeeId: 'GOV-TN-REG-4402',
    email: 'a.natarajan.sro@tn.gov.in',
    scope: {
      country: 'India',
      state: 'Tamil Nadu',
      district: 'Chennai',
      taluk: 'Ambattur',
      village: 'Ambattur OT',
      stateId: 'state_tn',
      districtId: 'dist_che',
      talukId: 'taluk_amb',
      villageId: 'vil_amb_ot',
    },
    permissions: [
      'VIEW_LAND',
      'VERIFY_REGISTRATION',
      'EXECUTE_OWNERSHIP_TRANSFER',
      'UPLOAD_REGISTRATION_DOCUMENT',
      'VIEW_OWNERSHIP',
      'VIEW_TRANSFER_HISTORY',
      'VIEW_DOCUMENTS',
      'VIEW_DIGITAL_TWINS',
    ],
  },
  REVENUE_OFFICER: {
    id: 'off_rev_officer_01',
    name: 'M. Suresh',
    role: 'REVENUE_OFFICER',
    designation: 'Municipal Revenue Officer (Zone 7)',
    departmentName: 'Municipality / Local Body',
    departmentCode: 'MUNICIPALITY',
    employeeId: 'GOV-TN-MUN-3091',
    email: 'm.suresh.revenue@chennaicorp.gov.in',
    scope: {
      country: 'India',
      state: 'Tamil Nadu',
      district: 'Chennai',
      taluk: 'Ambattur',
      village: 'Ambattur OT',
      stateId: 'state_tn',
      districtId: 'dist_che',
      talukId: 'taluk_amb',
      villageId: 'vil_amb_ot',
    },
    permissions: [
      'VIEW_LAND',
      'VIEW_PROPERTY',
      'VERIFY_PROPERTY',
      'VERIFY_TAX',
      'VERIFY_BUILDING_LAYOUT',
      'VIEW_DOCUMENTS',
      'VIEW_DIGITAL_TWINS',
    ],
  },
};

interface AuthContextType {
  currentUser: PersonaUser;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchPersona: (role: OfficerRole) => void;
  updateUserProfile: (updates: { 
    name?: string; 
    email?: string; 
    password?: string;
    role?: OfficerRole;
    designation?: string;
    departmentName?: string;
  }) => void;
  hasPermission: (permission: PermissionCode) => boolean;
  canAccessJurisdiction: (state: string, district?: string, taluk?: string) => boolean;
  isSuperAdmin: boolean;
  isTahsildar: boolean;
  isSurveyor: boolean;
  isSubRegistrar: boolean;
  isRevenueOfficer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bhu_is_authenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<PersonaUser>(() => {
    const savedProfile = localStorage.getItem('bhu_user_profile');
    if (savedProfile) {
      try {
        const parsed: PersonaUser = JSON.parse(savedProfile);
        const correctRole = resolveOfficerRole({
          role: parsed.role,
          designation: parsed.designation,
          department: parsed.departmentName,
          email: parsed.email,
        });
        if (parsed.role !== correctRole) {
          parsed.role = correctRole;
          const base = PREDEFINED_PERSONAS[correctRole] || PREDEFINED_PERSONAS.SUB_REGISTRAR;
          parsed.permissions = base.permissions;
          parsed.departmentCode = base.departmentCode;
        }
        return parsed;
      } catch (e) {
        // Fallback
      }
    }
    const savedPersona = localStorage.getItem('bhu_active_persona');
    if (savedPersona && PREDEFINED_PERSONAS[savedPersona as OfficerRole]) {
      return PREDEFINED_PERSONAS[savedPersona as OfficerRole];
    }
    return PREDEFINED_PERSONAS.SUPER_ADMIN;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Backend API first if running
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      if (response.ok) {
        const json = await response.json();
        const data = json.data || json;
        if (data && data.accessToken) {
          localStorage.setItem('land_gov_auth_token', data.accessToken);
          localStorage.setItem('auth_token', data.accessToken);
        }
        if (data && data.user) {
          const userRole = resolveOfficerRole({
            role: data.user.role,
            designation: data.user.designationTitle,
            department: data.user.departmentCode,
            email: data.user.email,
          });
          const base = PREDEFINED_PERSONAS[userRole] || PREDEFINED_PERSONAS.TAHSILDAR;
          const userProfile: PersonaUser = {
            id: data.user.id,
            name: data.user.fullName || 'Officer',
            role: userRole,
            designation: data.user.designationTitle || base.designation,
            departmentName: data.user.departmentCode || base.departmentName,
            departmentCode: base.departmentCode,
            employeeId: data.user.employeeId || 'GOV-001',
            email: data.user.email,
            scope: {
              country: 'India',
              state: data.user.scope?.stateName || data.user.state?.name || base.scope.state || 'Tamil Nadu',
              district: data.user.scope?.districtName || data.user.district?.name || base.scope.district || 'Chennai',
              taluk: data.user.scope?.talukName || data.user.taluk?.name || base.scope.taluk || 'Ambattur',
              village: data.user.scope?.villageName || data.user.village?.name || base.scope.village || 'Ambattur OT',
              stateId: data.user.scope?.stateId || data.user.stateId || base.scope.stateId || 'state_tn',
              districtId: data.user.scope?.districtId || data.user.districtId || base.scope.districtId || 'dist_che',
              talukId: data.user.scope?.talukId || data.user.talukId || base.scope.talukId || 'taluk_amb',
              villageId: data.user.scope?.villageId || data.user.villageId || base.scope.villageId || 'vil_amb_ot',
            },
            permissions: data.user.permissions?.length ? data.user.permissions : base.permissions,
          };
          setCurrentUser(userProfile);
          setIsAuthenticated(true);
          localStorage.setItem('bhu_is_authenticated', 'true');
          localStorage.setItem('bhu_user_profile', JSON.stringify(userProfile));
          return true;
        }
      }
    } catch (err) {
      // Backend unavailable or CORS error, fall through to local check
    }

    // 2. Check saved credentials registry in localStorage
    try {
      const registryRaw = localStorage.getItem('bhu_credentials_registry');
      if (registryRaw) {
        const registry = JSON.parse(registryRaw);
        const record = registry[cleanEmail];
        if (record) {
          const isPassValid = record.password ? record.password === password : password.length >= 4;
          if (isPassValid) {
            const userProfile: PersonaUser = record.userProfile;
            const correctRole = resolveOfficerRole({
              role: userProfile.role,
              designation: userProfile.designation,
              department: userProfile.departmentName,
              email: userProfile.email,
            });
            userProfile.role = correctRole;
            const base = PREDEFINED_PERSONAS[correctRole] || PREDEFINED_PERSONAS.TAHSILDAR;
            userProfile.permissions = base.permissions;
            userProfile.departmentCode = base.departmentCode;

            setCurrentUser(userProfile);
            setIsAuthenticated(true);
            localStorage.setItem('bhu_is_authenticated', 'true');
            localStorage.setItem('bhu_user_profile', JSON.stringify(userProfile));
            return true;
          }
        }
      }
    } catch (e) {
      // Ignore parse error
    }

    // 3. Check mockStore officers list
    const mockOfficer = mockStore.authenticateOfficer(cleanEmail, password);
    if (mockOfficer) {
      const role = resolveOfficerRole({
        role: mockOfficer.roleId,
        designation: mockOfficer.designationTitle,
        department: mockOfficer.departmentName,
        email: mockOfficer.email,
      });
      const basePersona = PREDEFINED_PERSONAS[role] || PREDEFINED_PERSONAS.TAHSILDAR;
      const userProfile: PersonaUser = {
        ...basePersona,
        id: mockOfficer.id,
        name: mockOfficer.fullName,
        role: role,
        email: mockOfficer.email,
        employeeId: mockOfficer.employeeId,
        designation: mockOfficer.designationTitle || basePersona.designation,
        departmentName: mockOfficer.departmentName || basePersona.departmentName,
      };
      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      localStorage.setItem('bhu_is_authenticated', 'true');
      localStorage.setItem('bhu_user_profile', JSON.stringify(userProfile));
      return true;
    }

    // 4. Fallback check for standard demo accounts & custom emails
    const resolvedRole = resolveOfficerRole({ email: cleanEmail });
    const basePersona = PREDEFINED_PERSONAS[resolvedRole] || PREDEFINED_PERSONAS.TAHSILDAR;
    const fallbackProfile: PersonaUser = {
      ...basePersona,
      email: cleanEmail,
      role: resolvedRole,
    };

    setCurrentUser(fallbackProfile);
    setIsAuthenticated(true);
    localStorage.setItem('bhu_is_authenticated', 'true');
    localStorage.setItem('bhu_user_profile', JSON.stringify(fallbackProfile));
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bhu_is_authenticated');
    localStorage.removeItem('bhu_user_profile');
    localStorage.removeItem('auth_token');
    setCurrentUser(PREDEFINED_PERSONAS.SUPER_ADMIN);
  };

  const switchPersona = (role: OfficerRole) => {
    const persona = PREDEFINED_PERSONAS[role];
    if (persona) {
      setCurrentUser(persona);
      localStorage.setItem('bhu_active_persona', role);
      localStorage.setItem('bhu_user_profile', JSON.stringify(persona));
    }
  };

  const updateUserProfile = async (updates: {
    name?: string;
    email?: string;
    password?: string;
    role?: OfficerRole;
    designation?: string;
    departmentName?: string;
  }) => {
    const oldEmail = currentUser.email;
    const newEmail = updates.email ? updates.email.trim().toLowerCase() : currentUser.email;

    const newRole =
      updates.role ||
      resolveOfficerRole({
        role: updates.role,
        designation: updates.designation || currentUser.designation,
        department: updates.departmentName || currentUser.departmentName,
        email: newEmail,
      });

    const basePersona = PREDEFINED_PERSONAS[newRole] || PREDEFINED_PERSONAS.TAHSILDAR;

    const updatedUser: PersonaUser = {
      ...currentUser,
      name: updates.name || currentUser.name,
      email: newEmail,
      role: newRole,
      designation:
        updates.designation ||
        (newRole !== currentUser.role ? basePersona.designation : currentUser.designation),
      departmentName:
        updates.departmentName ||
        (newRole !== currentUser.role ? basePersona.departmentName : currentUser.departmentName),
      departmentCode: basePersona.departmentCode,
      permissions: basePersona.permissions,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('bhu_user_profile', JSON.stringify(updatedUser));

    // Save into credentials registry in localStorage
    try {
      const registryRaw = localStorage.getItem('bhu_credentials_registry');
      const registry: Record<string, { email: string; password?: string; userProfile: PersonaUser }> =
        registryRaw ? JSON.parse(registryRaw) : {};

      const existingRecord: { email?: string; password?: string; userProfile?: PersonaUser } =
        registry[oldEmail] || registry[newEmail] || {};
      const finalPassword =
        updates.password !== undefined && updates.password !== ''
          ? updates.password
          : existingRecord.password;

      const record = {
        email: newEmail,
        password: finalPassword,
        userProfile: updatedUser,
      };

      registry[newEmail] = record;
      if (oldEmail !== newEmail) {
        registry[oldEmail] = record;
      }

      localStorage.setItem('bhu_credentials_registry', JSON.stringify(registry));
    } catch (e) {
      // Local storage fallback
    }

    // Sync to mockStore officers list
    mockStore.updateOfficerCredentials(currentUser.id, newEmail, updates.password, updates.name);
    mockStore.updateOfficerCredentials(oldEmail, newEmail, updates.password, updates.name);

    // Sync to Backend API
    try {
      const token = localStorage.getItem('auth_token');
      await fetch('/api/v1/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: currentUser.id,
          fullName: updates.name,
          email: newEmail,
          password: updates.password,
        }),
      });
    } catch (e) {
      // Ignore network fallback
    }
  };

  const hasPermission = (permission: PermissionCode): boolean => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    return currentUser.permissions.includes(permission);
  };

  const canAccessJurisdiction = (state: string, district?: string, taluk?: string): boolean => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.scope.state !== state) return false;
    if (district && currentUser.scope.district && currentUser.scope.district !== district) return false;
    if (taluk && currentUser.scope.taluk && currentUser.scope.taluk !== taluk) return false;
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        switchPersona,
        updateUserProfile,
        hasPermission,
        canAccessJurisdiction,
        isSuperAdmin: currentUser.role === 'SUPER_ADMIN',
        isTahsildar: currentUser.role === 'TAHSILDAR',
        isSurveyor: currentUser.role === 'SURVEYOR',
        isSubRegistrar: currentUser.role === 'SUB_REGISTRAR',
        isRevenueOfficer: currentUser.role === 'REVENUE_OFFICER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
