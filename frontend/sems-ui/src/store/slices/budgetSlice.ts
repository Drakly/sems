import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Budget } from '../../types';
import budgetService from '../../services/budgetService';

interface BudgetState {
  budgets: Budget[];
  currentBudget: Budget | null;
  utilizationData: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  currentBudget: null,
  utilizationData: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getBudgets = createAsyncThunk(
  'budgets/getBudgets',
  async (params: any, { rejectWithValue }) => {
    try {
      console.log('Getting budgets with params:', params);
      const response = await budgetService.getAllBudgets(params);
      console.log('Budgets response:', response);
      return response;
    } catch (error: any) {
      console.error('Error fetching budgets:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch budgets'
      );
    }
  }
);

export const getBudgetById = createAsyncThunk(
  'budgets/getBudgetById',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Getting budget by id:', id);
      const response = await budgetService.getBudgetById(id);
      console.log('Budget detail response:', response);
      return response;
    } catch (error: any) {
      console.error('Error fetching budget by id:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch budget details'
      );
    }
  }
);

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budget: any, { rejectWithValue }) => {
    try {
      console.log('Creating budget:', budget);
      const response = await budgetService.createBudget(budget);
      console.log('Create budget response:', response);
      return response;
    } catch (error: any) {
      console.error('Error creating budget:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to create budget'
      );
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, budget }: { id: string; budget: Partial<Budget> }, { rejectWithValue }) => {
    try {
      console.log('Updating budget:', { id, budget });
      const response = await budgetService.updateBudget(id, budget);
      console.log('Update budget response:', response);
      return response;
    } catch (error: any) {
      console.error('Error updating budget:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update budget'
      );
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Deleting budget:', id);
      await budgetService.deleteBudget(id);
      console.log('Budget deleted successfully');
      return id;
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to delete budget'
      );
    }
  }
);

export const getBudgetUtilization = createAsyncThunk(
  'budgets/getUtilization',
  async (params: any, { rejectWithValue }) => {
    try {
      console.log('Getting budget utilization with params:', params);
      const response = await budgetService.getBudgetUtilization(params);
      console.log('Budget utilization response:', response);
      return response;
    } catch (error: any) {
      console.error('Error fetching budget utilization:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch budget utilization'
      );
    }
  }
);

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearCurrentBudget: (state) => {
      state.currentBudget = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Budgets
      .addCase(getBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = action.payload;
      })
      .addCase(getBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Budget By Id
      .addCase(getBudgetById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBudgetById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBudget = action.payload;
      })
      .addCase(getBudgetById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Budget
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

      // Update Budget
      .addCase(updateBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBudget = action.payload;
        const index = state.budgets.findIndex(budget => budget.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Budget
      .addCase(deleteBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = state.budgets.filter(budget => budget.id !== action.payload);
        if (state.currentBudget && state.currentBudget.id === action.payload) {
          state.currentBudget = null;
        }
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Budget Utilization
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

export const { clearCurrentBudget, clearError } = budgetSlice.actions;
export default budgetSlice.reducer; 