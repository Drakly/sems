import api from './api';
import { Expense, ExpenseStatus, ApprovalStep, PaginatedResponse, ApprovalAction } from '../types';

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
    
    const response = await api.post<Expense>('/expenses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  getUserExpenses: async (params?: ExpenseFilterParams): Promise<PaginatedResponse<Expense>> => {
    const response = await api.get<PaginatedResponse<Expense>>('/expenses/my', { params });
    return response.data;
  },

  getAllExpenses: async (params?: ExpenseFilterParams): Promise<PaginatedResponse<Expense>> => {
    const response = await api.get<PaginatedResponse<Expense>>('/expenses', { params });
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
    
    const response = await api.put<Expense>(`/expenses/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },

  // Expense workflow operations
  submitExpense: async (id: string): Promise<Expense> => {
    const response = await api.post<Expense>(`/expenses/${id}/submit`);
    return response.data;
  },

  approveExpense: async (id: string, comments?: string): Promise<Expense> => {
    const response = await api.post<Expense>(`/expenses/${id}/approve`, { comments });
    return response.data;
  },

  rejectExpense: async (id: string, comments: string): Promise<Expense> => {
    const response = await api.post<Expense>(`/expenses/${id}/reject`, { comments });
    return response.data;
  },

  requestChanges: async (id: string, comments: string): Promise<Expense> => {
    const response = await api.post<Expense>(`/expenses/${id}/request-changes`, { comments });
    return response.data;
  },

  // Receipt operations
  uploadReceipt: async (expenseId: string, file: File): Promise<Expense> => {
    const formData = new FormData();
    formData.append('receiptFile', file);
    
    const response = await api.post<Expense>(`/expenses/${expenseId}/receipts`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  getReceiptUrl: async (expenseId: string): Promise<string> => {
    const response = await api.get<{ url: string }>(`/expenses/${expenseId}/receipts`);
    return response.data.url;
  },

  // Approval workflow steps
  getApprovalSteps: async (expenseId: string): Promise<ApprovalStep[]> => {
    const response = await api.get<ApprovalStep[]>(`/expenses/${expenseId}/approval-steps`);
    return response.data;
  },

  // For approvers
  getPendingApprovals: async (params?: ExpenseFilterParams): Promise<PaginatedResponse<Expense>> => {
    const response = await api.get<PaginatedResponse<Expense>>('/approvals/pending', { params });
    return response.data;
  },

  takeAction: async (expenseId: string, action: ApprovalAction, comments?: string): Promise<Expense> => {
    const response = await api.post<Expense>(`/approvals/${expenseId}`, { action, comments });
    return response.data;
  },

  // Analytics
  getExpensesByCategory: async (startDate?: string, endDate?: string): Promise<any> => {
    const params = { startDate, endDate };
    const response = await api.get('/analytics/expenses-by-category', { params });
    return response.data;
  },

  getExpensesByMonth: async (year?: number): Promise<any> => {
    const params = { year };
    const response = await api.get('/analytics/expenses-by-month', { params });
    return response.data;
  },

  getExpenseTrends: async (months?: number): Promise<any> => {
    const params = { months };
    const response = await api.get('/analytics/expense-trends', { params });
    return response.data;
  }
};

export default expenseService; 