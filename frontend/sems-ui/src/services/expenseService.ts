import api from './api';
import { Expense, ExpenseStatus, ApprovalStep, PaginatedResponse, ApprovalAction, ApprovalHistory, WorkflowStatistics } from '../types';

const baseUrl = '/expenses';  // This will work through the gateway on port 8080

export interface ExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  currency: string;
  categoryId: string;
  expenseDate: string;
  departmentId?: string;
  projectId?: string;
  receiptFile?: File;
}

export interface ExpenseFilterParams {
  status?: ExpenseStatus;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  departmentId?: string;
  projectId?: string;
  page?: number;
  size?: number;
}

const expenseService = {
  // Basic expense CRUD operations
  createExpense: async (expenseData: ExpenseRequest): Promise<Expense> => {
    const formData = new FormData();
    
    // Add all fields to the form data
    Object.entries(expenseData).forEach(([key, value]) => {
      if (value !== undefined && key !== 'receiptFile') {
        formData.append(key, String(value));
      }
    });
    
    // Add receipt file if exists
    if (expenseData.receiptFile) {
      formData.append('receiptFile', expenseData.receiptFile);
    }
    
    const response = await api.post<Expense>(`${baseUrl}/create`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    const response = await api.get<Expense>(`${baseUrl}/get/${id}`);
    return response.data;
  },

  getUserExpenses: async (params?: ExpenseFilterParams): Promise<PaginatedResponse<Expense>> => {
    const userId = localStorage.getItem('userId');
    const response = await api.get<PaginatedResponse<Expense>>(`${baseUrl}/user/${userId}`, { params });
    return response.data;
  },

  getAllExpenses: async (params?: ExpenseFilterParams): Promise<PaginatedResponse<Expense>> => {
    const response = await api.get<PaginatedResponse<Expense>>(`${baseUrl}/all`, { params });
    return response.data;
  },

  updateExpense: async (id: string, expenseData: Partial<ExpenseRequest>): Promise<Expense> => {
    const formData = new FormData();
    
    // Add all fields to the form data
    Object.entries(expenseData).forEach(([key, value]) => {
      if (value !== undefined && key !== 'receiptFile') {
        formData.append(key, String(value));
      }
    });
    
    // Add receipt file if exists
    if (expenseData.receiptFile) {
      formData.append('receiptFile', expenseData.receiptFile);
    }
    
    const response = await api.put<Expense>(`${baseUrl}/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`${baseUrl}/delete/${id}`);
  },

  // Expense workflow operations
  submitExpense: async (id: string): Promise<Expense> => {
    const response = await api.post<Expense>(`${baseUrl}/submit/${id}`);
    return response.data;
  },

  // Update the method for submitting an expense for approval to match the controller endpoint
  submitExpenseForApproval: async (id: string): Promise<Expense> => {
    const response = await api.post<Expense>(`${baseUrl}/submit-for-approval/${id}`);
    return response.data;
  },

  approveExpense: async (id: string, comments?: string): Promise<Expense> => {
    const approverId = localStorage.getItem('userId');
    const response = await api.post<Expense>(`${baseUrl}/approve/${id}?approverId=${approverId}`, { comments });
    return response.data;
  },

  rejectExpense: async (id: string, comments: string): Promise<Expense> => {
    const response = await api.post<Expense>(`${baseUrl}/reject/${id}`, { comments });
    return response.data;
  },

  requestChanges: async (id: string, comments: string): Promise<Expense> => {
    const response = await api.post<Expense>(`${baseUrl}/request-changes/${id}`, {
      actorId: localStorage.getItem('userId'),
      comments
    });
    return response.data;
  },

  // Update the method for getting approval history to match the controller endpoint
  getApprovalHistory: async (id: string): Promise<ApprovalStep[]> => {
    const response = await api.get<ApprovalStep[]>(`${baseUrl}/history/${id}`);
    return response.data;
  },

  // Update the method for getting pending approvals for user to match the controller endpoint
  getPendingApprovalsForUser: async (params?: { page?: number; size?: number }): Promise<PaginatedResponse<Expense>> => {
    const response = await api.get<PaginatedResponse<Expense>>(`${baseUrl}/pending`, { 
      params: { ...params, approverId: localStorage.getItem('userId') }
    });
    return response.data;
  },

  // Update the method for getting workflow statistics to match the controller endpoint
  getWorkflowStatistics: async (): Promise<WorkflowStatistics> => {
    const response = await api.get<WorkflowStatistics>(`${baseUrl}/stats`);
    return response.data;
  },

  // Receipt operations
  uploadReceipt: async (expenseId: string, file: File): Promise<Expense> => {
    const formData = new FormData();
    formData.append('receiptFile', file);
    
    const response = await api.post<Expense>(`${baseUrl}/upload-receipt/${expenseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  getReceiptUrl: async (expenseId: string): Promise<string> => {
    const response = await api.get<{ url: string }>(`${baseUrl}/receipt/${expenseId}`);
    return response.data.url;
  },

  // Approval workflow steps
  getApprovalSteps: async (expenseId: string): Promise<ApprovalStep[]> => {
    const response = await api.get<ApprovalStep[]>(`${baseUrl}/approval-steps/${expenseId}`);
    return response.data;
  },

  // For approvers
  getPendingApprovals: async (params?: ExpenseFilterParams): Promise<PaginatedResponse<Expense>> => {
    const response = await api.get<PaginatedResponse<Expense>>(`${baseUrl}/pending`, { params });
    return response.data;
  },

  takeAction: async (expenseId: string, action: ApprovalAction, comments?: string): Promise<Expense> => {
    const response = await api.post<Expense>(`${baseUrl}/take-action/${expenseId}`, { action, comments });
    return response.data;
  },

  // Analytics
  getExpensesByCategory: async (startDate?: string, endDate?: string): Promise<any> => {
    const params = { startDate, endDate };
    const response = await api.get('/api/analytics/expenses-by-category', { params });
    return response.data;
  },

  getExpensesByMonth: async (year?: number): Promise<any> => {
    const params = { year };
    const response = await api.get('/api/analytics/expenses-by-month', { params });
    return response.data;
  },

  getExpenseTrends: async (months?: number): Promise<any> => {
    const params = { months };
    const response = await api.get('/api/analytics/expense-trends', { params });
    return response.data;
  }
};

export default expenseService; 