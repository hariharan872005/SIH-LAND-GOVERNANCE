import { apiClient, ApiEnvelope } from './apiClient';
import { OwnershipHistory } from '../types';

export const ownershipService = {
  async getOwnershipHistory(landId: string): Promise<OwnershipHistory> {
    const response = await apiClient.get<ApiEnvelope<any>>(
      `/lands/${encodeURIComponent(landId)}/ownership-history`
    );
    const data = response.data.data;
    return {
      landId,
      currentOwner: data.currentOwner
        ? {
            name: data.currentOwner.ownerName || data.currentOwner.name,
            type: data.currentOwner.ownershipType || 'INDIVIDUAL',
            acquiredDate: data.currentOwner.acquiredDate,
            deedNumber: data.currentOwner.deedRegistrationNumber,
          }
        : undefined,
      lineage: Array.isArray(data.transfers)
        ? data.transfers.map((t: any) => ({
            id: t.id || `trans_${Math.random()}`,
            landId,
            previousOwnerName: t.previousOwnerName || 'Prior Owner',
            newOwnerName: t.newOwnerName || 'Acquiring Party',
            transferType: t.transferType || 'SALE',
            deedNumber: t.deedNumber || t.deedRegistrationNumber || 'N/A',
            registrationDate: t.registrationDate || t.createdAt,
            considerationAmountINR: t.considerationAmountINR ? Number(t.considerationAmountINR) : undefined,
            sroOffice: t.sroOffice || 'Sub-Registrar Office',
            transactionHash: t.transactionHash || t.blockchainTxHash,
            isCurrentOwner: !!t.isCurrentOwner,
          }))
        : [],
    };
  },
};
