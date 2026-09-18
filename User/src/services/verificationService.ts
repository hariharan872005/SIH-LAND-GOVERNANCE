import { apiClient, ApiEnvelope } from './apiClient';
import { LandVerificationRecord } from '../types';

export const verificationService = {
  async getLandVerifications(landId: string): Promise<LandVerificationRecord[]> {
    try {
      const response = await apiClient.get<ApiEnvelope<any[]>>(
        `/verifications/land/${encodeURIComponent(landId)}`
      );
      return response.data.data.map((v: any) => ({
        id: v.id,
        landId,
        departmentId: v.departmentId,
        departmentName: v.department?.name || v.departmentName,
        officerId: v.officerId,
        officerName: v.officer?.fullName || v.officerName || 'Verified Officer',
        officerDesignation: v.officer?.designationTitle || v.officerDesignation || 'Department Officer',
        status: v.status,
        remarks: v.remarks,
        referenceDocketNumber: v.referenceDocketNumber,
        submittedAt: v.submittedAt,
        verifiedAt: v.verifiedAt,
        createdAt: v.createdAt,
      }));
    } catch {
      return [];
    }
  },
};
