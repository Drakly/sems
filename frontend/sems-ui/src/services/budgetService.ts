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
    return response.data;
  },

  // Get budgets for a specific department
  getDepartmentBudgets: async (departmentId: string, params: BudgetFilterParams = {}): Promise<Budget[]> => {
    const response = await api.get(`${baseUrl}/department/${departmentId}`, { params });
    return response.data;
  },

  // Get a single budget by ID
  getBudgetById: async (id: string): Promise<Budget> => {
    const response = await api.get(`${baseUrl}/${id}`);
    return response.data;
  },

  // Create a new budget
  createBudget: async (budgetData: BudgetRequest): Promise<Budget> => {
    const response = await api.post(`${baseUrl}`, budgetData);
    return response.data;
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