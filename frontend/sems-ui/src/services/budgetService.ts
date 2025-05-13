import api from './api';
import { Budget, PaginatedResponse } from '../types';

export interface BudgetRequest {
  name: string;
  description?: string;
  amount: number;
  startDate: string;
  endDate: string;
  departmentId?: string;
  projectId?: string;
  categoryId?: string;
}

export interface BudgetFilterParams {
  departmentId?: string;
  projectId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  size?: number;
}

const budgetService = {
  createBudget: async (budgetData: BudgetRequest): Promise<Budget> => {
    const response = await api.post<Budget>('/budgets', budgetData);
    return response.data;
  },

  getBudgetById: async (id: string): Promise<Budget> => {
    const response = await api.get<Budget>(`/budgets/${id}`);
    return response.data;
  },

  getAllBudgets: async (params?: BudgetFilterParams): Promise<PaginatedResponse<Budget>> => {
    const response = await api.get<PaginatedResponse<Budget>>('/budgets', { params });
    return response.data;
  },

  getDepartmentBudgets: async (departmentId: string, params?: BudgetFilterParams): Promise<PaginatedResponse<Budget>> => {
    const queryParams = { ...params, departmentId };
    const response = await api.get<PaginatedResponse<Budget>>('/budgets', { params: queryParams });
    return response.data;
  },

  getProjectBudgets: async (projectId: string, params?: BudgetFilterParams): Promise<PaginatedResponse<Budget>> => {
    const queryParams = { ...params, projectId };
    const response = await api.get<PaginatedResponse<Budget>>('/budgets', { params: queryParams });
    return response.data;
  },

  updateBudget: async (id: string, budgetData: Partial<BudgetRequest>): Promise<Budget> => {
    const response = await api.put<Budget>(`/budgets/${id}`, budgetData);
    return response.data;
  },

  deleteBudget: async (id: string): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },

  getBudgetAnalytics: async (id: string): Promise<any> => {
    const response = await api.get(`/budgets/${id}/analytics`);
    return response.data;
  },

  getBudgetUtilization: async (params?: BudgetFilterParams): Promise<any> => {
    const response = await api.get('/budgets/utilization', { params });
    return response.data;
  }
};

export default budgetService; 