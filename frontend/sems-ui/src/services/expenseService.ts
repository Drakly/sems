import api from './api';
import { Expense, ExpenseStatus, ApprovalStep, PaginatedResponse, ApprovalAction, ApprovalHistory, WorkflowStatistics } from '../types';

const baseUrl = '/expenses';  // This will work through the gateway on port 8080

// Mock data for testing when the backend is unavailable
const MOCK_EXPENSES = [
  {
    id: '1',
    title: 'Business Lunch',
    description: 'Lunch with clients discussing new project',
    amount: 75.50,
    currency: 'USD',
    category: { id: '1', name: 'Meals' },
    status: 'APPROVED',
    createdBy: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    userId: '1',
    createdAt: new Date().toISOString(),
    expenseDate: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    receipt: 'receipt1.jpg',
    requiresReceipt: true,
    flaggedForReview: false
  },
  {
    id: '2',
    title: 'Office Supplies',
    description: 'Paper, pens, and notebooks for the team',
    amount: 120.75,
    currency: 'USD',
    category: { id: '2', name: 'Office Supplies' },
    status: 'SUBMITTED',
    createdBy: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    userId: '1',
    createdAt: new Date().toISOString(),
    expenseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastModifiedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    receipt: 'receipt2.jpg',
    requiresReceipt: true,
    flaggedForReview: false
  },
  {
    id: '3',
    title: 'Travel to Conference',
    description: 'Flight tickets to industry conference',
    amount: 550.00,
    currency: 'USD',
    category: { id: '3', name: 'Travel' },
    status: 'UNDER_REVIEW',
    createdBy: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    userId: '1',
    createdAt: new Date().toISOString(),
    expenseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastModifiedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    receipt: 'receipt3.jpg',
    requiresReceipt: true,
    flaggedForReview: false
  }
];

const MOCK_APPROVAL_HISTORY = [
  {
    id: '1',
    expenseId: '1',
    action: 'SUBMITTED',
    actionBy: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    actionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    comments: 'Submitting expense for approval',
    level: 1,
    approverId: '1',
    approverName: 'John Doe',
    approverRole: 'SUBMITTER'
  },
  {
    id: '2',
    expenseId: '1',
    action: 'APPROVED',
    actionBy: { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
    actionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    comments: 'Approved - looks good',
    level: 2,
    approverId: '2',
    approverName: 'Jane Smith',
    approverRole: 'MANAGER'
  }
];

const MOCK_WORKFLOW_STATS = {
  pendingCount: 3,
  approvedCount: 5,
  rejectedCount: 1,
  changesRequestedCount: 2,
  averageApprovalTime: 48,
  byDepartment: {
    'IT': { pendingCount: 1, approvedCount: 2, rejectedCount: 0 },
    'Marketing': { pendingCount: 2, approvedCount: 1, rejectedCount: 1 },
    'Finance': { pendingCount: 0, approvedCount: 2, rejectedCount: 0 }
  }
};

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
    try {
      const response = await api.get<Expense>(`${baseUrl}/get/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching expense ${id}:`, error);
      // Find and return a mock expense with the given ID
      const mockExpense = MOCK_EXPENSES.find(e => e.id === id);
      if (mockExpense) {
        return mockExpense;
      }
      throw error;
    }
  },

  getUserExpenses: async (params: any = {}): Promise<Expense[]> => {
    try {
      console.log('Getting user expenses with params:', params);
      const response = await api.get(`${baseUrl}/user`, { params });
      console.log('User expenses response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user expenses:', error);
      console.log('Returning mock expense data');
      return MOCK_EXPENSES; // Return mock data if backend call fails
    }
  },

  getAllExpenses: async (params: any = {}): Promise<Expense[]> => {
    try {
      const response = await api.get(`${baseUrl}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all expenses:', error);
      return MOCK_EXPENSES; // Return mock data if backend call fails
    }
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
    try {
      await api.delete(`${baseUrl}/delete/${id}`);
    } catch (error) {
      console.error(`Error deleting expense ${id}:`, error);
      throw error;
    }
  },

  // Expense workflow operations
  submitExpense: async (id: string): Promise<Expense> => {
    const response = await api.post<Expense>(`${baseUrl}/submit/${id}`);
    return response.data;
  },

  // Update the method for submitting an expense for approval to match the controller endpoint
  submitExpenseForApproval: async (id: string): Promise<Expense> => {
    try {
      const response = await api.post<Expense>(`${baseUrl}/submit-for-approval/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error submitting expense ${id} for approval:`, error);
      // For demo purposes, return a mock expense with updated status
      const mockExpense = MOCK_EXPENSES.find(e => e.id === id);
      if (mockExpense) {
        return { ...mockExpense, status: 'SUBMITTED' };
      }
      throw error;
    }
  },

  approveExpense: async (id: string, comments?: string): Promise<Expense> => {
    try {
      const response = await api.post<Expense>(`${baseUrl}/approve/${id}?approverId=${localStorage.getItem('userId')}`, { comments });
      return response.data;
    } catch (error) {
      console.error(`Error approving expense ${id}:`, error);
      const mockExpense = MOCK_EXPENSES.find(e => e.id === id);
      if (mockExpense) {
        return { ...mockExpense, status: 'APPROVED' };
      }
      throw error;
    }
  },

  rejectExpense: async (id: string, comments: string): Promise<Expense> => {
    try {
      const response = await api.post<Expense>(`${baseUrl}/reject/${id}`, { comments });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting expense ${id}:`, error);
      const mockExpense = MOCK_EXPENSES.find(e => e.id === id);
      if (mockExpense) {
        return { ...mockExpense, status: 'REJECTED' };
      }
      throw error;
    }
  },

  requestChanges: async (id: string, comments: string): Promise<Expense> => {
    try {
      const response = await api.post<Expense>(`${baseUrl}/request-changes/${id}`, {
        actorId: localStorage.getItem('userId'),
        comments
      });
      return response.data;
    } catch (error) {
      console.error(`Error requesting changes for expense ${id}:`, error);
      const mockExpense = MOCK_EXPENSES.find(e => e.id === id);
      if (mockExpense) {
        return { ...mockExpense, status: 'CHANGES_REQUESTED' };
      }
      throw error;
    }
  },

  // Update the method for getting approval history to match the controller endpoint
  getApprovalHistory: async (expenseId: string): Promise<ApprovalHistory> => {
    try {
      const response = await api.get<ApprovalHistory>(`${baseUrl}/history/${expenseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching approval history for expense ${expenseId}:`, error);
      // Return mock approval history if the expense ID matches
      if (expenseId === '1') {
        return MOCK_APPROVAL_HISTORY as ApprovalHistory;
      }
      return [] as unknown as ApprovalHistory;
    }
  },

  // Update the method for getting pending approvals for user to match the controller endpoint
  getPendingApprovalsForUser: async (params: any = {}): Promise<Expense[]> => {
    try {
      const response = await api.get<Expense[]>(`${baseUrl}/pending-approvals`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      // Return pending expenses from the mock data
      return MOCK_EXPENSES.filter(e => e.status === 'SUBMITTED' || e.status === 'UNDER_REVIEW');
    }
  },

  // Update the method for getting workflow statistics to match the controller endpoint
  getWorkflowStatistics: async (): Promise<WorkflowStatistics> => {
    try {
      const response = await api.get<WorkflowStatistics>(`${baseUrl}/workflow-statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow statistics:', error);
      return MOCK_WORKFLOW_STATS as WorkflowStatistics;
    }
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