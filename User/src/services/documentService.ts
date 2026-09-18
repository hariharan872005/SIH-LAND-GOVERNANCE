import { apiClient, ApiEnvelope } from './apiClient';
import { DocumentRecord } from '../types';

export const documentService = {
  async getPermittedDocuments(landId: string): Promise<DocumentRecord[]> {
    try {
      const response = await apiClient.get<ApiEnvelope<any[]>>(
        `/documents/land/${encodeURIComponent(landId)}`
      );
      return (response.data?.data || []).map((doc: any) => ({
        id: doc.id,
        landId,
        fileName: doc.documentName || doc.fileName || `${doc.documentType}_${landId}.pdf`,
        documentType: doc.documentType || 'SALE_DEED',
        fileSizeBytes: Number(doc.fileSizeBytes) || 2400000,
        s3PresignedUrl: doc.downloadUrl || doc.s3PresignedUrl || doc.s3Url,
        ipfsCid: doc.documentHash || doc.ipfsCid,
        verificationStatus: doc.verificationStatus || 'VERIFIED',
        createdAt: doc.createdAt || new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Error fetching documents for land:', landId, err);
      return [];
    }
  },

  async uploadDocument(
    landId: string,
    file?: File,
    documentType: string = 'SALE_DEED',
    documentName?: string
  ): Promise<any> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('documentType', documentType);
    if (documentName) {
      formData.append('documentName', documentName);
    }

    const response = await apiClient.post<ApiEnvelope<any>>(
      `/documents/upload/${encodeURIComponent(landId)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data?.data;
  },

  async deleteDocument(docId: string): Promise<any> {
    const response = await apiClient.delete<ApiEnvelope<any>>(
      `/documents/${encodeURIComponent(docId)}`
    );
    return response.data?.data;
  },
};
