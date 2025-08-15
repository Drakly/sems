import api from './api';
import { Expense, ExpenseStatus, ApprovalStep, PaginatedResponse, ApprovalAction, ApprovalHistory, WorkflowStatistics } from '../types';

const baseUrl = '/api/expenses';  // This will work through the gateway on port 8080
const workflowBaseUrl = '/api/v1/expenses/workflow';

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
    // Convert frontend data to backend format
    const backendData = {
      userId: localStorage.getItem('userId'),
      title: expenseData.title,
      description: expenseData.description,
      amount: expenseData.amount,
      currency: expenseData.currency.toUpperCase(), // Backend expects enum
      category: expenseData.categoryId, // Backend expects category enum/ID
      expenseDate: expenseData.expenseDate,
      receiptUrl: null // Handle file upload separately if needed
    };
    
    const response = await api.post<Expense>(`${baseUrl}`, backendData);
    return response.data;
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    const response = await api.get<Expense>(`${baseUrl}/${id}`);
    return response.data;
  },

  getUserExpenses: async (params: any = {}): Promise<Expense[]> => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }
    console.log('Getting user expenses with params:', params);
    const response = await api.get(`${baseUrl}/user/${userId}`, { params });
    console.log('User expenses response:', response.data);
    return response.data;
  },

  getAllExpenses: async (params: any = {}): Promise<Expense[]> => {
    const response = await api.get(`${baseUrl}`, { params });
    return response.data;
  },

  updateExpense: async (id: string, expenseData: Partial<ExpenseRequest>): Promise<Expense> => {
    // Convert frontend data to backend format
    const backendData: any = {};
    if (expenseData.title) backendData.title = expenseData.title;
    if (expenseData.description) backendData.description = expenseData.description;
    if (expenseData.amount) backendData.amount = expenseData.amount;
    if (expenseData.currency) backendData.currency = expenseData.currency.toUpperCase();
    if (expenseData.categoryId) backendData.category = expenseData.categoryId;
    if (expenseData.expenseDate) backendData.expenseDate = expenseData.expenseDate;
    
    const response = await api.put<Expense>(`${baseUrl}/${id}`, backendData);
    return response.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`${baseUrl}/${id}`);
  },

  // Expense workflow operations
  submitExpense: async (id: string): Promise<Expense> => {
    const response = await api.post<Expense>(`${baseUrl}/${id}/submit`);
    return response.data;
  },

  // Submit an expense for approval using the workflow endpoint
  submitExpenseForApproval: async (id: string): Promise<Expense> => {
    const response = await api.post<Expense>(`${workflowBaseUrl}/${id}/submit`);
    return response.data;
  },

  approveExpense: async (id: string, comments?: string): Promise<Expense> => {
    const actorId = localStorage.getItem('userId');
    const response = await api.post<Expense>(`${workflowBaseUrl}/${id}/approve`, {
      actorId,
      comments
    });
    return response.data;
  },

  rejectExpense: async (id: string, comments: string): Promise<Expense> => {
    const actorId = localStorage.getItem('userId');
    const response = await api.post<Expense>(`${workflowBaseUrl}/${id}/reject`, {
      actorId,
      comments
    });
    return response.data;
  },

  requestChanges: async (id: string, comments: string): Promise<Expense> => {
    const actorId = localStorage.getItem('userId');
    const response = await api.post<Expense>(`${workflowBaseUrl}/${id}/request-changes`, {
      actorId,
      comments
    });
    return response.data;
  },

  // Get approval history for an expense
  getApprovalHistory: async (expenseId: string): Promise<ApprovalHistory> => {
    const response = await api.get<ApprovalHistory>(`${workflowBaseUrl}/${expenseId}/history`);
    return response.data;
  },

  // Get pending approvals for current user
  getPendingApprovalsForUser: async (params: any = {}): Promise<Expense[]> => {
    const response = await api.get<Expense[]>(`${workflowBaseUrl}/pending-approvals`, { params });
    return response.data;
  },

  // Get workflow statistics
  getWorkflowStatistics: async (): Promise<WorkflowStatistics[]> => {
    const response = await api.get<WorkflowStatistics[]>(`${workflowBaseUrl}/stats`);
    return response.data;
  },

  // Approval workflow steps
  getApprovalSteps: async (expenseId: string): Promise<ApprovalStep[]> => {
    const response = await api.get<ApprovalStep[]>(`${workflowBaseUrl}/${expenseId}/steps`);
    return response.data;
  },

  // For approvers - get pending approvals (paginated)
  getPendingApprovals: async (params?: ExpenseFilterParams): Promise<PaginatedResponse<Expense>> => {
    const response = await api.get<PaginatedResponse<Expense>>(`${workflowBaseUrl}/pending`, { params });
    return response.data;
  },

  // Take approval action on an expense
  takeAction: async (expenseId: string, action: ApprovalAction, comments?: string): Promise<Expense> => {
    const actorId = localStorage.getItem('userId');
    const response = await api.post<Expense>(`${workflowBaseUrl}/${expenseId}/action`, { 
      action, 
      comments,
      actorId 
    });
    return response.data;
  }
};

export default expenseService; 