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
  // Test API connectivity
  testConnection: async (): Promise<boolean> => {
    try {
      console.log('Testing API connection to expense service...');
      const response = await api.get(`${baseUrl}`);
      console.log('API connection test successful:', response.status);
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  },
  // Basic expense CRUD operations
  createExpense: async (expenseData: ExpenseRequest): Promise<Expense> => {
    console.log('createExpense - Input data:', expenseData);
    
    // Convert frontend data to backend format
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }
    
    const backendData = {
      userId: userId, // Backend expects UUID as string
      title: expenseData.title,
      description: expenseData.description || '',
      amount: expenseData.amount, // Backend converts to BigDecimal
      currency: expenseData.currency.toUpperCase(), // Backend expects Currency enum (USD, EUR, etc.)
      category: expenseData.categoryId.toUpperCase(), // Backend expects ExpenseCategory enum
      expenseDate: expenseData.expenseDate, // Backend expects LocalDate (YYYY-MM-DD)
      receiptUrl: null // Will be updated after file upload if needed
    };
    
    console.log('createExpense - Backend data:', backendData);
    console.log('createExpense - Making POST request to:', baseUrl);
    
    try {
      const response = await api.post<Expense>(`${baseUrl}`, backendData);
      console.log('createExpense - Response status:', response.status);
      console.log('createExpense - Response data:', response.data);
      
      // Convert the response to ensure proper format
      const expense = {
        ...response.data,
        id: response.data.id?.toString() || response.data.id,
        userId: response.data.userId?.toString() || response.data.userId,
        approvedBy: response.data.approvedBy?.toString() || response.data.approvedBy,
        departmentId: response.data.departmentId?.toString() || response.data.departmentId,
        projectId: response.data.projectId?.toString() || response.data.projectId
      };
      
      return expense;
    } catch (error: any) {
      console.error('createExpense failed:', error);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (!error.response) {
        throw new Error('Network error: Unable to connect to server');
      }
      
      // Provide more specific error messages
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (typeof errorData === 'object' && errorData.message) {
          throw new Error(`Validation error: ${errorData.message}`);
        }
        throw new Error('Invalid expense data. Please check all required fields.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      throw error;
    }
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    const response = await api.get<Expense>(`${baseUrl}/${id}`);
    
    // Convert UUIDs to strings for consistency
    const expense = {
      ...response.data,
      id: response.data.id?.toString() || response.data.id,
      userId: response.data.userId?.toString() || response.data.userId,
      approvedBy: response.data.approvedBy?.toString() || response.data.approvedBy,
      departmentId: response.data.departmentId?.toString() || response.data.departmentId,
      projectId: response.data.projectId?.toString() || response.data.projectId
    };
    
    return expense;
  },

  getUserExpenses: async (params: any = {}): Promise<Expense[]> => {
    const userId = localStorage.getItem('userId');
    console.log('getUserExpenses - userId from localStorage:', userId);
    console.log('getUserExpenses - userId type:', typeof userId);
    
    if (!userId) {
      console.warn('No userId found in localStorage, attempting to get all expenses instead');
      // Fallback to getting all expenses if userId is not available
      try {
        console.log('Falling back to getAllExpenses...');
        return await expenseService.getAllExpenses(params);
      } catch (error) {
        console.error('Fallback getAllExpenses failed:', error);
        throw new Error('User ID not found and unable to fetch expenses. Please log in again.');
      }
    }
    
    try {
      console.log('Getting user expenses for userId:', userId, 'with params:', params);
      console.log('Making request to:', `${baseUrl}/user/${userId}`);
      const response = await api.get(`${baseUrl}/user/${userId}`, { params });
      console.log('User expenses response status:', response.status);
      console.log('User expenses response data:', response.data);
      
      // Handle empty response or null data
      if (!response.data) {
        console.log('getUserExpenses - No data in response, returning empty array');
        return [];
      }
      
      // Ensure we return an array
      if (!Array.isArray(response.data)) {
        console.warn('getUserExpenses - Response data is not an array:', response.data);
        return [];
      }
      
      // Convert UUIDs to strings and ensure proper format
      const expenses = response.data.map(expense => ({
        ...expense,
        id: expense.id?.toString() || expense.id,
        userId: expense.userId?.toString() || expense.userId,
        approvedBy: expense.approvedBy?.toString() || expense.approvedBy,
        departmentId: expense.departmentId?.toString() || expense.departmentId,
        projectId: expense.projectId?.toString() || expense.projectId
      }));
      
      return expenses;
    } catch (error: any) {
      console.error('getUserExpenses failed:', error);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Handle network errors
      if (!error.response) {
        console.error('Network error - no response received for user expenses');
        console.warn('Falling back to getAllExpenses due to network error');
        return await expenseService.getAllExpenses(params);
      }
      
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.warn('User-specific endpoint failed, falling back to all expenses');
        return await expenseService.getAllExpenses(params);
      }
      throw error;
    }
  },

  getAllExpenses: async (params: any = {}): Promise<Expense[]> => {
    console.log('getAllExpenses - Making request to:', baseUrl);
    console.log('getAllExpenses - With params:', params);
    try {
      const response = await api.get(`${baseUrl}`, { params });
      console.log('getAllExpenses - Response status:', response.status);
      console.log('getAllExpenses - Response data:', response.data);
      
      // Handle empty response or null data
      if (!response.data) {
        console.log('getAllExpenses - No data in response, returning empty array');
        return [];
      }
      
      // Ensure we return an array
      if (!Array.isArray(response.data)) {
        console.warn('getAllExpenses - Response data is not an array:', response.data);
        return [];
      }
      
      // Convert UUIDs to strings and ensure proper format
      const expenses = response.data.map(expense => ({
        ...expense,
        id: expense.id?.toString() || expense.id,
        userId: expense.userId?.toString() || expense.userId,
        approvedBy: expense.approvedBy?.toString() || expense.approvedBy,
        departmentId: expense.departmentId?.toString() || expense.departmentId,
        projectId: expense.projectId?.toString() || expense.projectId
      }));
      
      return expenses;
    } catch (error: any) {
      console.error('getAllExpenses failed:', error);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Handle network errors
      if (!error.response) {
        console.error('Network error - no response received');
        throw new Error('Network error: Unable to connect to server');
      }
      
      throw error;
    }
  },

  updateExpense: async (id: string, expenseData: Partial<ExpenseRequest>): Promise<Expense> => {
    // Convert frontend data to backend format
    const backendData: any = {};
    if (expenseData.title) backendData.title = expenseData.title;
    if (expenseData.description) backendData.description = expenseData.description;
    if (expenseData.amount) backendData.amount = expenseData.amount;
    if (expenseData.currency) backendData.currency = expenseData.currency.toUpperCase();
    if (expenseData.categoryId) backendData.category = expenseData.categoryId.toUpperCase();
    if (expenseData.expenseDate) backendData.expenseDate = expenseData.expenseDate;
    
    const response = await api.put<Expense>(`${baseUrl}/${id}`, backendData);
    
    // Convert UUIDs to strings for consistency
    const expense = {
      ...response.data,
      id: response.data.id?.toString() || response.data.id,
      userId: response.data.userId?.toString() || response.data.userId,
      approvedBy: response.data.approvedBy?.toString() || response.data.approvedBy,
      departmentId: response.data.departmentId?.toString() || response.data.departmentId,
      projectId: response.data.projectId?.toString() || response.data.projectId
    };
    
    return expense;
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
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn('No userId found for pending approvals');
      return [];
    }
    
    console.log('Fetching pending approvals from:', `${workflowBaseUrl}/pending`);
    console.log('Using approverId:', userId);
    const token = localStorage.getItem('token');
    console.log('Using token for pending approvals:', token ? 'Present' : 'Missing');
    
    try {
      // Backend expects approverId as query parameter
      const response = await api.get<Expense[]>(`${workflowBaseUrl}/pending`, { 
        params: { approverId: userId, ...params }
      });
      console.log('Pending approvals response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending approvals:', error);
      if (error.response?.status === 403) {
        console.warn('Pending approvals requires authentication - user may need to log in');
      }
      // Return empty array as fallback to prevent UI from breaking
      return [];
    }
  },

  // Get workflow statistics
  getWorkflowStatistics: async (): Promise<WorkflowStatistics[]> => {
    console.log('Fetching workflow statistics from:', `${workflowBaseUrl}/stats`);
    const token = localStorage.getItem('token');
    console.log('Using token for workflow stats:', token ? 'Present' : 'Missing');
    
    try {
      const response = await api.get<WorkflowStatistics[]>(`${workflowBaseUrl}/stats`);
      console.log('Workflow statistics response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching workflow statistics:', error);
      if (error.response?.status === 403) {
        console.warn('Workflow statistics requires authentication - user may need to log in');
      }
      // Return empty array as fallback to prevent UI from breaking
      return [];
    }
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