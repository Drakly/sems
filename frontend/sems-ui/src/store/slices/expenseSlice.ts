import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Expense, ApprovalStep, PaginatedResponse } from '../../types';
import expenseService, { ExpenseRequest, ExpenseFilterParams } from '../../services/expenseService';

interface ExpenseState {
  userExpenses: Expense[];
  allExpenses: Expense[];
  pendingApprovals: Expense[];
  selectedExpense: Expense | null;
  approvalHistory: ApprovalStep[];
  workflowStats: any;
  isLoading: boolean;
  error: string | null;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

const initialState: ExpenseState = {
  userExpenses: [],
  allExpenses: [],
  pendingApprovals: [],
  selectedExpense: null,
  approvalHistory: [],
  workflowStats: null,
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
export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData: ExpenseRequest, { rejectWithValue }) => {
    try {
      return await expenseService.createExpense(expenseData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create expense');
    }
  }
);

export const getUserExpenses = createAsyncThunk(
  'expenses/getUserExpenses',
  async (params: ExpenseFilterParams = {}, { rejectWithValue }) => {
    try {
      return await expenseService.getUserExpenses(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }
);

export const getAllExpenses = createAsyncThunk(
  'expenses/getAllExpenses',
  async (params: ExpenseFilterParams = {}, { rejectWithValue }) => {
    try {
      return await expenseService.getAllExpenses(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all expenses');
    }
  }
);

export const getExpenseById = createAsyncThunk(
  'expenses/getExpenseById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await expenseService.getExpenseById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense details');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, data }: { id: string; data: Partial<ExpenseRequest> }, { rejectWithValue }) => {
    try {
      return await expenseService.updateExpense(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update expense');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string, { rejectWithValue }) => {
    try {
      await expenseService.deleteExpense(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete expense');
    }
  }
);

// Approval workflow thunks
export const submitExpenseForApproval = createAsyncThunk(
  'expenses/submitForApproval',
  async (id: string, { rejectWithValue }) => {
    try {
      return await expenseService.submitExpenseForApproval(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit expense for approval');
    }
  }
);

export const approveExpense = createAsyncThunk(
  'expenses/approveExpense',
  async ({ id, comments }: { id: string; comments?: string }, { rejectWithValue }) => {
    try {
      return await expenseService.approveExpense(id, comments);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve expense');
    }
  }
);

export const rejectExpense = createAsyncThunk(
  'expenses/rejectExpense',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      return await expenseService.rejectExpense(id, reason);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject expense');
    }
  }
);

export const requestExpenseChanges = createAsyncThunk(
  'expenses/requestChanges',
  async ({ id, comments }: { id: string; comments: string }, { rejectWithValue }) => {
    try {
      return await expenseService.requestChanges(id, comments);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request changes');
    }
  }
);

export const getApprovalHistory = createAsyncThunk(
  'expenses/getApprovalHistory',
  async (id: string, { rejectWithValue }) => {
    try {
      return await expenseService.getApprovalHistory(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch approval history');
    }
  }
);

export const getPendingApprovals = createAsyncThunk(
  'expenses/getPendingApprovals',
  async (params: { page?: number; size?: number } = {}, { rejectWithValue }) => {
    try {
      return await expenseService.getPendingApprovalsForUser(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending approvals');
    }
  }
);

export const getWorkflowStatistics = createAsyncThunk(
  'expenses/getWorkflowStatistics',
  async (_, { rejectWithValue }) => {
    try {
      return await expenseService.getWorkflowStatistics();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workflow statistics');
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedExpense: (state) => {
      state.selectedExpense = null;
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
      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userExpenses.unshift(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get user expenses
      .addCase(getUserExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        const paginatedResponse = action.payload as PaginatedResponse<Expense>;
        state.userExpenses = paginatedResponse.content;
        state.pagination = {
          totalElements: paginatedResponse.totalElements,
          totalPages: paginatedResponse.totalPages,
          currentPage: paginatedResponse.number,
          pageSize: paginatedResponse.size,
        };
      })
      .addCase(getUserExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get all expenses
      .addCase(getAllExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        const paginatedResponse = action.payload as PaginatedResponse<Expense>;
        state.allExpenses = paginatedResponse.content;
        state.pagination = {
          totalElements: paginatedResponse.totalElements,
          totalPages: paginatedResponse.totalPages,
          currentPage: paginatedResponse.number,
          pageSize: paginatedResponse.size,
        };
      })
      .addCase(getAllExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get expense by ID
      .addCase(getExpenseById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getExpenseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedExpense = action.payload;
      })
      .addCase(getExpenseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update expense
      .addCase(updateExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedExpense = action.payload;
        
        // Update in the user expenses list
        const index = state.userExpenses.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.userExpenses[index] = action.payload;
        }
        
        // Update in the all expenses list
        const allIndex = state.allExpenses.findIndex(e => e.id === action.payload.id);
        if (allIndex !== -1) {
          state.allExpenses[allIndex] = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userExpenses = state.userExpenses.filter(expense => expense.id !== action.payload);
        state.allExpenses = state.allExpenses.filter(expense => expense.id !== action.payload);
        if (state.selectedExpense?.id === action.payload) {
          state.selectedExpense = null;
        }
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Workflow actions
      .addCase(submitExpenseForApproval.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedExpense = action.payload;
        
        // Update in the user expenses list
        const index = state.userExpenses.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.userExpenses[index] = action.payload;
        }
      })
      
      .addCase(approveExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update in the pending approvals list
        state.pendingApprovals = state.pendingApprovals.filter(e => e.id !== action.payload.id);
        
        // Update the expense if it's selected
        if (state.selectedExpense?.id === action.payload.id) {
          state.selectedExpense = action.payload;
        }
      })
      
      .addCase(rejectExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update in the pending approvals list
        state.pendingApprovals = state.pendingApprovals.filter(e => e.id !== action.payload.id);
        
        // Update the expense if it's selected
        if (state.selectedExpense?.id === action.payload.id) {
          state.selectedExpense = action.payload;
        }
      })
      
      // Get approval history
      .addCase(getApprovalHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getApprovalHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalHistory = action.payload;
      })
      .addCase(getApprovalHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get pending approvals
      .addCase(getPendingApprovals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingApprovals.fulfilled, (state, action) => {
        state.isLoading = false;
        const paginatedResponse = action.payload as PaginatedResponse<Expense>;
        state.pendingApprovals = paginatedResponse.content;
      })
      .addCase(getPendingApprovals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get workflow statistics
      .addCase(getWorkflowStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWorkflowStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workflowStats = action.payload;
      })
      .addCase(getWorkflowStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedExpense, setPage, setPageSize } = expenseSlice.actions;
export default expenseSlice.reducer; 