import { Budget } from '../types';
import api from './api';

const baseUrl = '/budgets';

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

// Demo data for testing when the backend is not available
const DEMO_UTILIZATION = {
  totalBudget: 50000,
  totalSpent: 23450,
  utilizationPercentage: 46.9,
  byDepartment: [
    { department: 'IT', budget: 15000, spent: 8700, percentage: 58 },
    { department: 'Marketing', budget: 20000, spent: 10200, percentage: 51 },
    { department: 'Finance', budget: 10000, spent: 3550, percentage: 35.5 },
    { department: 'HR', budget: 5000, spent: 1000, percentage: 20 }
  ],
  byCategory: [
    { category: 'Travel', budget: 10000, spent: 7800, percentage: 78 },
    { category: 'Office Supplies', budget: 5000, spent: 2300, percentage: 46 },
    { category: 'Software', budget: 15000, spent: 6200, percentage: 41.3 },
    { category: 'Events', budget: 8000, spent: 3150, percentage: 39.4 },
    { category: 'Other', budget: 12000, spent: 4000, percentage: 33.3 }
  ],
  monthlyTrend: [
    { month: 'Jan', budget: 4167, spent: 3200 },
    { month: 'Feb', budget: 4167, spent: 3900 },
    { month: 'Mar', budget: 4167, spent: 4250 },
    { month: 'Apr', budget: 4167, spent: 3650 },
    { month: 'May', budget: 4167, spent: 4100 },
    { month: 'Jun', budget: 4167, spent: 4350 }
  ]
};

const budgetService = {
  // Get all budgets with optional filtering
  getAllBudgets: async (params: BudgetFilterParams = {}): Promise<any> => {
    try {
      const response = await api.get(`${baseUrl}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all budgets:', error);
      return []; // Return empty array for demo if backend call fails
    }
  },

  // Get budgets for a specific department
  getDepartmentBudgets: async (departmentId: string, params: BudgetFilterParams = {}): Promise<any> => {
    try {
      const response = await api.get(`${baseUrl}/department/${departmentId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching budgets for department ${departmentId}:`, error);
      return []; // Return empty array for demo if backend call fails
    }
  },

  // Get a single budget by ID
  getBudgetById: async (id: string): Promise<Budget> => {
    try {
      const response = await api.get(`${baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error);
      throw error;
    }
  },

  // Create a new budget
  createBudget: async (budgetData: BudgetRequest): Promise<Budget> => {
    try {
      const response = await api.post(`${baseUrl}`, budgetData);
      return response.data;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  },

  // Update an existing budget
  updateBudget: async (id: string, budgetData: Partial<BudgetRequest>): Promise<Budget> => {
    try {
      const response = await api.put(`${baseUrl}/${id}`, budgetData);
      return response.data;
    } catch (error) {
      console.error(`Error updating budget ${id}:`, error);
      throw error;
    }
  },

  // Delete a budget
  deleteBudget: async (id: string): Promise<void> => {
    try {
      await api.delete(`${baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting budget ${id}:`, error);
      throw error;
    }
  },

  // Get budget analytics for a specific budget
  getBudgetAnalytics: async (id: string): Promise<any> => {
    try {
      const response = await api.get(`${baseUrl}/${id}/analytics`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching analytics for budget ${id}:`, error);
      throw error;
    }
  },

  // Get budget utilization data (potentially across all budgets)
  getBudgetUtilization: async (params: BudgetFilterParams = {}): Promise<any> => {
    try {
      const response = await api.get(`${baseUrl}/utilization`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching budget utilization:', error);
      console.log('Returning demo utilization data');
      return DEMO_UTILIZATION; // Return demo data if backend call fails
    }
  }
};

export default budgetService; 