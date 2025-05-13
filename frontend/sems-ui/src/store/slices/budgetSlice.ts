import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Budget, PaginatedResponse } from '../../types';
import budgetService, { BudgetRequest, BudgetFilterParams } from '../../services/budgetService';

interface BudgetState {
  budgets: Budget[];
  selectedBudget: Budget | null;
  budgetAnalytics: any | null;
  utilizationData: any | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

const initialState: BudgetState = {
  budgets: [],
  selectedBudget: null,
  budgetAnalytics: null,
  utilizationData: null,
  isLoading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
  },
};

// Async thunks
export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budgetData: BudgetRequest, { rejectWithValue }) => {
    try {
      return await budgetService.createBudget(budgetData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create budget');
    }
  }
);

export const getBudgetById = createAsyncThunk(
  'budgets/getBudgetById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await budgetService.getBudgetById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budget details');
    }
  }
);

export const getAllBudgets = createAsyncThunk(
  'budgets/getAllBudgets',
  async (params: BudgetFilterParams = {}, { rejectWithValue }) => {
    try {
      return await budgetService.getAllBudgets(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budgets');
    }
  }
);

export const getDepartmentBudgets = createAsyncThunk(
  'budgets/getDepartmentBudgets',
  async ({ departmentId, params }: { departmentId: string; params?: BudgetFilterParams }, { rejectWithValue }) => {
    try {
      return await budgetService.getDepartmentBudgets(departmentId, params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch department budgets');
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, data }: { id: string; data: Partial<BudgetRequest> }, { rejectWithValue }) => {
    try {
      return await budgetService.updateBudget(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update budget');
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: string, { rejectWithValue }) => {
    try {
      await budgetService.deleteBudget(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete budget');
    }
  }
);

export const getBudgetAnalytics = createAsyncThunk(
  'budgets/getBudgetAnalytics',
  async (id: string, { rejectWithValue }) => {
    try {
      return await budgetService.getBudgetAnalytics(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budget analytics');
    }
  }
);

export const getBudgetUtilization = createAsyncThunk(
  'budgets/getBudgetUtilization',
  async (params: BudgetFilterParams = {}, { rejectWithValue }) => {
    try {
      return await budgetService.getBudgetUtilization(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budget utilization data');
    }
  }
);

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedBudget: (state) => {
      state.selectedBudget = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create budget
      .addCase(createBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets.unshift(action.payload);
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get budget by ID
      .addCase(getBudgetById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBudgetById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBudget = action.payload;
      })
      .addCase(getBudgetById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get all budgets
      .addCase(getAllBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        const paginatedResponse = action.payload as PaginatedResponse<Budget>;
        state.budgets = paginatedResponse.content;
        state.pagination = {
          totalElements: paginatedResponse.totalElements,
          totalPages: paginatedResponse.totalPages,
          currentPage: paginatedResponse.number,
          pageSize: paginatedResponse.size,
        };
      })
      .addCase(getAllBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get department budgets
      .addCase(getDepartmentBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDepartmentBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        const paginatedResponse = action.payload as PaginatedResponse<Budget>;
        state.budgets = paginatedResponse.content;
        state.pagination = {
          totalElements: paginatedResponse.totalElements,
          totalPages: paginatedResponse.totalPages,
          currentPage: paginatedResponse.number,
          pageSize: paginatedResponse.size,
        };
      })
      .addCase(getDepartmentBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update budget
      .addCase(updateBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBudget = action.payload;
        
        // Update in the budgets list
        const index = state.budgets.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete budget
      .addCase(deleteBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = state.budgets.filter(budget => budget.id !== action.payload);
        if (state.selectedBudget?.id === action.payload) {
          state.selectedBudget = null;
        }
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get budget analytics
      .addCase(getBudgetAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBudgetAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgetAnalytics = action.payload;
      })
      .addCase(getBudgetAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get budget utilization
      .addCase(getBudgetUtilization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBudgetUtilization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.utilizationData = action.payload;
      })
      .addCase(getBudgetUtilization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedBudget, setPage, setPageSize } = budgetSlice.actions;
export default budgetSlice.reducer; 