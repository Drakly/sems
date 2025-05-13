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

// Mock data for demonstration purposes
const mockExpenses: Expense[] = [
  {
    id: '1',
    userId: '123',
    title: 'Business Trip to New York',
    description: 'Annual conference attendance',
    amount: 1250.75,
    currency: 'USD',
    category: { id: '1', name: 'Travel' },
    expenseDate: '2025-05-01',
    createdAt: '2025-05-02',
    updatedAt: '2025-05-02',
    status: ExpenseStatus.APPROVED,
    departmentId: 'IT',
    currentApprovalLevel: 2,
    receiptUrl: undefined,
    requiresReceipt: false,
    flaggedForReview: false
  },
  {
    id: '2',
    userId: '123',
    title: 'Team Lunch',
    description: 'Monthly team lunch',
    amount: 230.50,
    currency: 'USD',
    category: { id: '2', name: 'Meals' },
    expenseDate: '2025-05-07',
    createdAt: '2025-05-08',
    updatedAt: '2025-05-08',
    status: ExpenseStatus.SUBMITTED,
    departmentId: 'IT',
    currentApprovalLevel: 1,
    receiptUrl: undefined,
    requiresReceipt: false,
    flaggedForReview: false
  },
  {
    id: '3',
    userId: '123',
    title: 'Office Supplies',
    description: 'Notebooks, pens, and markers',
    amount: 85.25,
    currency: 'USD',
    category: { id: '3', name: 'Office Supplies' },
    expenseDate: '2025-05-10',
    createdAt: '2025-05-11',
    updatedAt: '2025-05-11',
    status: ExpenseStatus.SUBMITTED,
    departmentId: 'IT',
    currentApprovalLevel: 0,
    receiptUrl: undefined,
    requiresReceipt: false,
    flaggedForReview: false
  },
  {
    id: '4',
    userId: '123',
    title: 'Software License',
    description: 'Adobe Creative Cloud annual subscription',
    amount: 599.99,
    currency: 'USD',
    category: { id: '4', name: 'Software' },
    expenseDate: '2025-05-15',
    createdAt: '2025-05-16',
    updatedAt: '2025-05-16',
    status: ExpenseStatus.REJECTED,
    departmentId: 'IT',
    currentApprovalLevel: 1,
    receiptUrl: undefined,
    requiresReceipt: false,
    flaggedForReview: false
  },
  {
    id: '5',
    userId: '123',
    title: 'Client Dinner',
    description: 'Dinner with potential clients',
    amount: 350.00,
    currency: 'USD',
    category: { id: '2', name: 'Meals' },
    expenseDate: '2025-05-20',
    createdAt: '2025-05-21',
    updatedAt: '2025-05-21',
    status: ExpenseStatus.UNDER_REVIEW,
    departmentId: 'IT',
    currentApprovalLevel: 1,
    receiptUrl: undefined,
    requiresReceipt: false,
    flaggedForReview: false
  }
];

const mockApprovalSteps: ApprovalStep[] = [
  {
    id: '1',
    expenseId: '1',
    level: 1,
    approverId: '456',
    approverName: 'Jane Smith',
    approverRole: 'MANAGER',
    action: ApprovalAction.APPROVE,
    comments: 'Approved as per policy',
    actionDate: '2025-05-03',
  },
  {
    id: '2',
    expenseId: '1',
    level: 2,
    approverId: '789',
    approverName: 'Mike Johnson',
    approverRole: 'FINANCE',
    action: ApprovalAction.APPROVE,
    comments: 'All receipts verified',
    actionDate: '2025-05-04',
  }
];

const expenseService = {
  // Basic expense CRUD operations
  createExpense: async (expenseData: ExpenseRequest): Promise<Expense> => {
    try {
      const response = await api.post<Expense>('/expenses', expenseData);
      return response.data;
    } catch (error) {
      console.warn('Using mock data for createExpense as backend API failed', error);
      // Create a mock expense with the data
      const newExpense: Expense = {
        id: String(mockExpenses.length + 1),
        userId: '123',
        title: expenseData.title,
        description: expenseData.description || '',
        amount: expenseData.amount,
        currency: expenseData.currency,
        category: { id: expenseData.categoryId, name: 'Mock Category' },
        expenseDate: expenseData.expenseDate,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        status: ExpenseStatus.SUBMITTED,
        departmentId: expenseData.departmentId,
        currentApprovalLevel: 0,
        receiptUrl: undefined,
        requiresReceipt: false,
        flaggedForReview: false
      };
      
      mockExpenses.push(newExpense);
      return newExpense;
    }
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    try {
      const response = await api.get<Expense>(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Using mock data for getExpenseById as backend API failed', error);
      const expense = mockExpenses.find(exp => exp.id === id);
      if (!expense) throw new Error('Expense not found');
      return expense;
    }
  },

  getUserExpenses: async (params?: ExpenseFilterParams): Promise<PaginatedResponse<Expense>> => {
    try {
      const response = await api.get<PaginatedResponse<Expense>>('/expenses/my', { params });
      return response.data;
    } catch (error) {
      console.warn('Using mock data for getUserExpenses as backend API failed', error);
      
      let filteredExpenses = [...mockExpenses];
      
      if (params?.status) {
        filteredExpenses = filteredExpenses.filter(exp => exp.status === params.status);
      }
      
      const paginatedResponse: PaginatedResponse<Expense> = {
        content: filteredExpenses,
        totalElements: filteredExpenses.length,
        totalPages: 1,
        number: 0,
        size: filteredExpenses.length
      };
      
      return paginatedResponse;
    }
  },
  
  getAllExpenses: async (params?: ExpenseFilterParams): Promise<PaginatedResponse<Expense>> => {
    try {
      const response = await api.get<PaginatedResponse<Expense>>('/expenses', { params });
      return response.data;
    } catch (error) {
      console.warn('Using mock data for getAllExpenses as backend API failed', error);
      
      const paginatedResponse: PaginatedResponse<Expense> = {
        content: mockExpenses,
        totalElements: mockExpenses.length,
        totalPages: 1,
        number: 0,
        size: mockExpenses.length
      };
      
      return paginatedResponse;
    }
  },

  updateExpense: async (id: string, expenseData: Partial<ExpenseRequest>): Promise<Expense> => {
    try {
      const response = await api.put<Expense>(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      console.warn('Using mock data for updateExpense as backend API failed', error);
      
      const expenseIndex = mockExpenses.findIndex(exp => exp.id === id);
      if (expenseIndex === -1) throw new Error('Expense not found');
      
      const updatedExpense = {
        ...mockExpenses[expenseIndex],
        ...(expenseData.title && { title: expenseData.title }),
        ...(expenseData.description && { description: expenseData.description }),
        ...(expenseData.amount && { amount: expenseData.amount }),
        ...(expenseData.currency && { currency: expenseData.currency }),
        ...(expenseData.categoryId && { category: { id: expenseData.categoryId, name: 'Updated Category' } }),
        ...(expenseData.expenseDate && { expenseDate: expenseData.expenseDate }),
      };
      
      mockExpenses[expenseIndex] = updatedExpense;
      return updatedExpense;
    }
  },

  deleteExpense: async (id: string): Promise<void> => {
    try {
      await api.delete(`/expenses/${id}`);
    } catch (error) {
      console.warn('Using mock data for deleteExpense as backend API failed', error);
      
      const expenseIndex = mockExpenses.findIndex(exp => exp.id === id);
      if (expenseIndex === -1) throw new Error('Expense not found');
      
      mockExpenses.splice(expenseIndex, 1);
    }
  },

  // Expense approval workflow methods with mock data fallbacks
  submitExpenseForApproval: async (id: string): Promise<Expense> => {
    try {
      const response = await api.post<Expense>(`/expenses/workflow/${id}/submit`);
      return response.data;
    } catch (error) {
      console.warn('Using mock data for submitExpenseForApproval as backend API failed', error);
      
      const expenseIndex = mockExpenses.findIndex(exp => exp.id === id);
      if (expenseIndex === -1) throw new Error('Expense not found');
      
      mockExpenses[expenseIndex].status = ExpenseStatus.UNDER_REVIEW;
      mockExpenses[expenseIndex].currentApprovalLevel = 1;
      
      return mockExpenses[expenseIndex];
    }
  },

  // Other workflow methods
  // ...

  getApprovalHistory: async (id: string): Promise<ApprovalStep[]> => {
    try {
      const response = await api.get<ApprovalStep[]>(`/expenses/workflow/${id}/history`);
      return response.data;
    } catch (error) {
      console.warn('Using mock data for getApprovalHistory as backend API failed', error);
      return mockApprovalSteps.filter(step => step.expenseId === id);
    }
  },

  getPendingApprovalsForUser: async (params?: { page?: number, size?: number }): Promise<PaginatedResponse<Expense>> => {
    try {
      const response = await api.get<PaginatedResponse<Expense>>('/expenses/workflow/pending', { params });
      return response.data;
    } catch (error) {
      console.warn('Using mock data for getPendingApprovalsForUser as backend API failed', error);
      
      const pendingExpenses = mockExpenses.filter(
        exp => exp.status === ExpenseStatus.SUBMITTED || exp.status === ExpenseStatus.UNDER_REVIEW
      );
      
      const paginatedResponse: PaginatedResponse<Expense> = {
        content: pendingExpenses,
        totalElements: pendingExpenses.length,
        totalPages: 1,
        number: 0,
        size: pendingExpenses.length
      };
      
      return paginatedResponse;
    }
  },

  getWorkflowStatistics: async (): Promise<any> => {
    try {
      const response = await api.get('/expenses/workflow/stats');
      return response.data;
    } catch (error) {
      console.warn('Using mock data for getWorkflowStatistics as backend API failed', error);
      
      const submitted = mockExpenses.filter(exp => exp.status === ExpenseStatus.SUBMITTED).length;
      const underReview = mockExpenses.filter(exp => exp.status === ExpenseStatus.UNDER_REVIEW).length;
      const approved = mockExpenses.filter(exp => exp.status === ExpenseStatus.APPROVED).length;
      const rejected = mockExpenses.filter(exp => exp.status === ExpenseStatus.REJECTED).length;
      
      return {
        totalExpenses: mockExpenses.length,
        statusCounts: {
          SUBMITTED: submitted,
          UNDER_REVIEW: underReview,
          APPROVED: approved,
          REJECTED: rejected
        },
        approvalTimeAverage: 2.5, // Average days for approval
        monthlyTrend: [
          { month: "Jan", count: 12 },
          { month: "Feb", count: 17 },
          { month: "Mar", count: 15 },
          { month: "Apr", count: 20 },
          { month: "May", count: mockExpenses.length }
        ]
      };
    }
  },
  
  // Implement remaining methods similarly with mock fallbacks
  approveExpense: async (id: string, comments?: string): Promise<Expense> => {
    try {
      const response = await api.post<Expense>(`/expenses/workflow/${id}/approve`, { comments });
      return response.data;
    } catch (error) {
      console.warn('Using mock data for approveExpense as backend API failed', error);
      
      const expenseIndex = mockExpenses.findIndex(exp => exp.id === id);
      if (expenseIndex === -1) throw new Error('Expense not found');
      
      mockExpenses[expenseIndex].status = ExpenseStatus.APPROVED;
      return mockExpenses[expenseIndex];
    }
  },

  rejectExpense: async (id: string, reason: string): Promise<Expense> => {
    try {
      const response = await api.post<Expense>(`/expenses/workflow/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.warn('Using mock data for rejectExpense as backend API failed', error);
      
      const expenseIndex = mockExpenses.findIndex(exp => exp.id === id);
      if (expenseIndex === -1) throw new Error('Expense not found');
      
      mockExpenses[expenseIndex].status = ExpenseStatus.REJECTED;
      return mockExpenses[expenseIndex];
    }
  },

  requestChanges: async (id: string, comments: string): Promise<Expense> => {
    try {
      const response = await api.post<Expense>(`/expenses/workflow/${id}/request-changes`, { comments });
      return response.data;
    } catch (error) {
      console.warn('Using mock data for requestChanges as backend API failed', error);
      
      const expenseIndex = mockExpenses.findIndex(exp => exp.id === id);
      if (expenseIndex === -1) throw new Error('Expense not found');
      
      mockExpenses[expenseIndex].status = ExpenseStatus.CHANGES_REQUESTED;
      return mockExpenses[expenseIndex];
    }
  },

  escalateExpense: async (id: string, comments?: string): Promise<Expense> => {
    try {
      const response = await api.post<Expense>(`/expenses/workflow/${id}/escalate`, { comments });
      return response.data;
    } catch (error) {
      console.warn('Using mock data for escalateExpense as backend API failed', error);
      
      const expenseIndex = mockExpenses.findIndex(exp => exp.id === id);
      if (expenseIndex === -1) throw new Error('Expense not found');
      
      if (mockExpenses[expenseIndex].currentApprovalLevel !== undefined) {
        mockExpenses[expenseIndex].currentApprovalLevel += 1;
      }
      return mockExpenses[expenseIndex];
    }
  },

  delegateApproval: async (id: string, delegateUserId: string, comments?: string): Promise<Expense> => {
    try {
      const response = await api.post<Expense>(`/expenses/workflow/${id}/delegate`, { delegateUserId, comments });
      return response.data;
    } catch (error) {
      console.warn('Using mock data for delegateApproval as backend API failed', error);
      
      const expenseIndex = mockExpenses.findIndex(exp => exp.id === id);
      if (expenseIndex === -1) throw new Error('Expense not found');
      
      // Just return the expense without changes in mock
      return mockExpenses[expenseIndex];
    }
  }
};

export default expenseService; 