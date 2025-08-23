import { Budget } from '../types';
import api from './api';

const baseUrl = '/api/v1/budgets';

// Types for budget operations
export interface BudgetRequest {
  name: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  departmentId?: string;
  description?: string;
  categoryId?: string;
}

export interface BudgetFilterParams {
  page?: number;
  size?: number;
  status?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  sort?: string;
}



const budgetService = {
  // Get all budgets with optional filtering
  getAllBudgets: async (params: BudgetFilterParams = {}): Promise<Budget[]> => {
    const response = await api.get(`${baseUrl}`, { params });
    
    // Convert UUIDs to strings for consistency
    const budgets = response.data.map((budget: any) => ({
      ...budget,
      id: budget.id?.toString() || budget.id,
      userId: budget.userId?.toString() || budget.userId,
      departmentId: budget.departmentId?.toString() || budget.departmentId,
      projectId: budget.projectId?.toString() || budget.projectId
    }));
    
    return budgets;
  },

  // Get budgets for a specific department
  getDepartmentBudgets: async (departmentId: string, params: BudgetFilterParams = {}): Promise<Budget[]> => {
    const response = await api.get(`${baseUrl}/department/${departmentId}`, { params });
    return response.data;
  },

  // Get a single budget by ID
  getBudgetById: async (id: string): Promise<Budget> => {
    const response = await api.get(`${baseUrl}/${id}`);
    
    // Convert UUIDs to strings for consistency
    const budget = {
      ...response.data,
      id: response.data.id?.toString() || response.data.id,
      userId: response.data.userId?.toString() || response.data.userId,
      departmentId: response.data.departmentId?.toString() || response.data.departmentId,
      projectId: response.data.projectId?.toString() || response.data.projectId
    };
    
    return budget;
  },

  // Create a new budget
  createBudget: async (budgetData: BudgetRequest): Promise<Budget> => {
    console.log('createBudget - Input data:', budgetData);
    
    // Convert frontend data to backend format
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }
    
    const backendData = {
      name: budgetData.name,
      userId: userId, // Backend expects UUID as string
      amount: budgetData.amount, // Backend converts to BigDecimal
      startDate: budgetData.startDate, // Backend expects LocalDate (YYYY-MM-DD)
      endDate: budgetData.endDate, // Backend expects LocalDate (YYYY-MM-DD)
      departmentId: budgetData.departmentId || null, // Optional UUID
      categoryIds: [], // For now, empty array - can be enhanced later
      projectId: null, // Optional UUID
      active: true
    };
    
    console.log('createBudget - Backend data:', backendData);
    
    try {
      const response = await api.post(`${baseUrl}`, backendData);
      console.log('createBudget - Response:', response.data);
      
      // Convert UUIDs to strings for frontend consistency
      const budget = {
        ...response.data,
        id: response.data.id?.toString() || response.data.id,
        userId: response.data.userId?.toString() || response.data.userId,
        departmentId: response.data.departmentId?.toString() || response.data.departmentId,
        projectId: response.data.projectId?.toString() || response.data.projectId
      };
      
      return budget;
    } catch (error: any) {
      console.error('createBudget failed:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (typeof errorData === 'object' && errorData.message) {
          throw new Error(`Validation error: ${errorData.message}`);
        }
        throw new Error('Invalid budget data. Please check all required fields.');
      }
      
      throw error;
    }
  },

  // Update an existing budget
  updateBudget: async (id: string, budgetData: Partial<BudgetRequest>): Promise<Budget> => {
    const response = await api.put(`${baseUrl}/${id}`, budgetData);
    return response.data;
  },

  // Delete a budget
  deleteBudget: async (id: string): Promise<void> => {
    await api.delete(`${baseUrl}/${id}`);
  },

  // Get budget analytics for a specific budget
  getBudgetAnalytics: async (id: string): Promise<any> => {
    const response = await api.get(`${baseUrl}/${id}/analytics`);
    return response.data;
  },

  // Get budget utilization data (potentially across all budgets)
  getBudgetUtilization: async (params: BudgetFilterParams = {}): Promise<any> => {
    const response = await api.get(`${baseUrl}/utilization`, { params });
    return response.data;
  }
};

export default budgetService; 