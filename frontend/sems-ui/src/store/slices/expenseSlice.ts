import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Expense, ExpenseStatus, ApprovalHistory, ApprovalAction, WorkflowStatistics } from '../../types';
import expenseService from '../../services/expenseService';

interface ExpenseState {
  userExpenses: Expense[];
  pendingApprovals: Expense[];
  workflowStats: WorkflowStatistics | null;
  currentExpense: Expense | null;
  approvalHistory: ApprovalHistory | null;
  isLoading: boolean;
  error: string | null;
  selectedExpense: Expense | null;
  allExpenses: Expense[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

const initialState: ExpenseState = {
  userExpenses: [],
  pendingApprovals: [],
  workflowStats: null,
  currentExpense: null,
  approvalHistory: null,
  isLoading: false,
  error: null,
  selectedExpense: null,
  allExpenses: [],
  pagination: {
    page: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  }
};

// Async thunks
export const getUserExpenses = createAsyncThunk(
  'expenses/getUserExpenses',
  async (params: any, { rejectWithValue }) => {
    try {
      console.log('Getting user expenses with params:', params);
      const response = await expenseService.getUserExpenses(params);
      console.log('User expenses response:', response);
      return response;
    } catch (error: any) {
      console.error('Error fetching user expenses:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch expenses'
      );
    }
  }
);

export const getExpenseById = createAsyncThunk(
  'expenses/getExpenseById',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Getting expense by id:', id);
      const response = await expenseService.getExpenseById(id);
      console.log('Expense detail response:', response);
      return response;
    } catch (error: any) {
      console.error('Error fetching expense by id:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch expense details'
      );
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expense: any, { rejectWithValue }) => {
    try {
      console.log('Creating expense:', expense);
      const response = await expenseService.createExpense(expense);
      console.log('Create expense response:', response);
      return response;
    } catch (error: any) {
      console.error('Error creating expense:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to create expense'
      );
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, expense }: { id: string; expense: Partial<Expense> }, { rejectWithValue }) => {
    try {
      console.log('Updating expense:', { id, expense });
      const response = await expenseService.updateExpense(id, expense);
      console.log('Update expense response:', response);
      return response;
    } catch (error: any) {
      console.error('Error updating expense:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update expense'
      );
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Deleting expense:', id);
      await expenseService.deleteExpense(id);
      console.log('Expense deleted successfully');
      return id;
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to delete expense'
      );
    }
  }
);

export const submitExpenseForApproval = createAsyncThunk(
  'expenses/submitForApproval',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Submitting expense for approval:', id);
      const response = await expenseService.submitExpenseForApproval(id);
      console.log('Submit for approval response:', response);
      return response;
    } catch (error: any) {
      console.error('Error submitting expense for approval:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to submit expense for approval'
      );
    }
  }
);

export const getApprovalHistory = createAsyncThunk(
  'expenses/getApprovalHistory',
  async (expenseId: string, { rejectWithValue }) => {
    try {
      console.log('Getting approval history for expense:', expenseId);
      const response = await expenseService.getApprovalHistory(expenseId);
      console.log('Approval history response:', response);
      return { expenseId, history: response };
    } catch (error: any) {
      console.error('Error fetching approval history:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch approval history'
      );
    }
  }
);

export const getPendingApprovalsForUser = createAsyncThunk(
  'expenses/getPendingApprovals',
  async (params: any, { rejectWithValue }) => {
    try {
      console.log('Getting pending approvals with params:', params);
      const response = await expenseService.getPendingApprovalsForUser(params);
      console.log('Pending approvals response:', response);
      return response;
    } catch (error: any) {
      console.error('Error fetching pending approvals:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch pending approvals'
      );
    }
  }
);

export const getWorkflowStatistics = createAsyncThunk(
  'expenses/getWorkflowStatistics',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Getting workflow statistics');
      const response = await expenseService.getWorkflowStatistics();
      console.log('Workflow statistics response:', response);
      return response;
    } catch (error: any) {
      console.error('Error fetching workflow statistics:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch workflow statistics'
      );
    }
  }
);

export const approveExpense = createAsyncThunk(
  'expenses/approveExpense',
  async ({ id, comments }: { id: string; comments?: string }, { rejectWithValue }) => {
    try {
      console.log('Approving expense:', id, comments);
      const response = await expenseService.approveExpense(id, comments);
      console.log('Approve expense response:', response);
      return response;
    } catch (error: any) {
      console.error('Error approving expense:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to approve expense'
      );
    }
  }
);

export const rejectExpense = createAsyncThunk(
  'expenses/rejectExpense',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      console.log('Rejecting expense:', id, reason);
      const response = await expenseService.rejectExpense(id, reason);
      console.log('Reject expense response:', response);
      return response;
    } catch (error: any) {
      console.error('Error rejecting expense:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to reject expense'
      );
    }
  }
);

export const requestExpenseChanges = createAsyncThunk(
  'expenses/requestChanges',
  async ({ id, comments }: { id: string; comments: string }, { rejectWithValue }) => {
    try {
      console.log('Requesting changes for expense:', id, comments);
      const response = await expenseService.requestChanges(id, comments);
      console.log('Request changes response:', response);
      return response;
    } catch (error: any) {
      console.error('Error requesting changes for expense:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to request changes for expense'
      );
    }
  }
);

export const getAllExpenses = createAsyncThunk(
  'expenses/getAllExpenses',
  async (params: any, { rejectWithValue }) => {
    try {
      console.log('Getting all expenses with params:', params);
      const response = await expenseService.getAllExpenses(params);
      console.log('All expenses response:', response);
      return response;
    } catch (error: any) {
      console.error('Error fetching all expenses:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch all expenses'
      );
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearCurrentExpense: (state) => {
      state.currentExpense = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get User Expenses
      .addCase(getUserExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userExpenses = action.payload;
      })
      .addCase(getUserExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Expense By Id
      .addCase(getExpenseById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getExpenseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExpense = action.payload;
        state.selectedExpense = action.payload;
      })
      .addCase(getExpenseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Expense
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

      // Update Expense
      .addCase(updateExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExpense = action.payload;
        state.selectedExpense = action.payload;
        const index = state.userExpenses.findIndex(expense => expense.id === action.payload.id);
        if (index !== -1) {
          state.userExpenses[index] = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Expense
      .addCase(deleteExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userExpenses = state.userExpenses.filter(expense => expense.id !== action.payload);
        if (state.currentExpense && state.currentExpense.id === action.payload) {
          state.currentExpense = null;
        }
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Submit Expense For Approval
      .addCase(submitExpenseForApproval.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitExpenseForApproval.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentExpense) {
          state.currentExpense = action.payload;
        }
        if (state.selectedExpense) {
          state.selectedExpense = action.payload;
        }
        const index = state.userExpenses.findIndex(expense => expense.id === action.payload.id);
        if (index !== -1) {
          state.userExpenses[index] = action.payload;
        }
      })
      .addCase(submitExpenseForApproval.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Approval History
      .addCase(getApprovalHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getApprovalHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalHistory = action.payload.history;
      })
      .addCase(getApprovalHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Pending Approvals
      .addCase(getPendingApprovalsForUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingApprovalsForUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingApprovals = action.payload;
      })
      .addCase(getPendingApprovalsForUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Workflow Statistics
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
      })
      
      // Approve Expense
      .addCase(approveExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentExpense && state.currentExpense.id === action.payload.id) {
          state.currentExpense = action.payload;
        }
        if (state.selectedExpense && state.selectedExpense.id === action.payload.id) {
          state.selectedExpense = action.payload;
        }
      })
      .addCase(approveExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Reject Expense
      .addCase(rejectExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentExpense && state.currentExpense.id === action.payload.id) {
          state.currentExpense = action.payload;
        }
        if (state.selectedExpense && state.selectedExpense.id === action.payload.id) {
          state.selectedExpense = action.payload;
        }
      })
      .addCase(rejectExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Request Changes
      .addCase(requestExpenseChanges.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestExpenseChanges.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentExpense && state.currentExpense.id === action.payload.id) {
          state.currentExpense = action.payload;
        }
        if (state.selectedExpense && state.selectedExpense.id === action.payload.id) {
          state.selectedExpense = action.payload;
        }
      })
      .addCase(requestExpenseChanges.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get All Expenses
      .addCase(getAllExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allExpenses = action.payload;
      })
      .addCase(getAllExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentExpense, clearError, setPage, setPageSize } = expenseSlice.actions;
export default expenseSlice.reducer; 