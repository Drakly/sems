import api from './api';

const baseUrl = '/api/documents';

export interface DocumentUploadRequest {
  expenseId: string;
  documentType: string;
  description?: string;
  tags?: string[];
}

export interface DocumentResponse {
  id: string;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  s3Url: string;
  expenseId: string;
  uploadedBy: string;
  documentType: string;
  description?: string;
  tags?: string;
  uploadedAt: string;
  updatedAt: string;
}

const documentService = {
  // Upload a document/receipt for an expense
  uploadDocument: async (file: File, request: DocumentUploadRequest): Promise<DocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('expenseId', request.expenseId);
    formData.append('documentType', request.documentType);
    if (request.description) {
      formData.append('description', request.description);
    }
    if (request.tags) {
      formData.append('tags', request.tags.join(','));
    }
    formData.append('uploadedBy', localStorage.getItem('userId') || '');

    const response = await api.post<DocumentResponse>(`${baseUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get document by ID
  getDocumentById: async (id: string): Promise<DocumentResponse> => {
    const response = await api.get<DocumentResponse>(`${baseUrl}/${id}`);
    return response.data;
  },

  // Get all documents for an expense
  getDocumentsByExpenseId: async (expenseId: string): Promise<DocumentResponse[]> => {
    const response = await api.get<DocumentResponse[]>(`${baseUrl}/expense/${expenseId}`);
    return response.data;
  },

  // Get all documents uploaded by a user
  getDocumentsByUserId: async (userId: string): Promise<DocumentResponse[]> => {
    const response = await api.get<DocumentResponse[]>(`${baseUrl}/user/${userId}`);
    return response.data;
  },

  // Download a document
  downloadDocument: async (id: string): Promise<Blob> => {
    const response = await api.get(`${baseUrl}/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Delete a document
  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`${baseUrl}/${id}`);
  },

  // Search documents
  searchDocuments: async (query: string): Promise<DocumentResponse[]> => {
    const response = await api.get<DocumentResponse[]>(`${baseUrl}/search`, {
      params: { query }
    });
    return response.data;
  },

  // Search documents by tags
  searchDocumentsByTags: async (tags: string): Promise<DocumentResponse[]> => {
    const response = await api.get<DocumentResponse[]>(`${baseUrl}/search/tags`, {
      params: { tags }
    });
    return response.data;
  }
};

export default documentService;
