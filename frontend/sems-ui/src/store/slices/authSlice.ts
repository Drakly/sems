import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';
import authService, { LoginRequest, RegisterRequest } from '../../services/authService';

// Check if token exists in localStorage on initial load
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');

const initialState: AuthState = {
  user: null,
  token: token,
  isAuthenticated: !!token,
  isLoading: false,
  error: null,
};

console.log('AuthSlice initial state:', { 
  token: token ? 'Token exists' : 'No token', 
  isAuthenticated: !!token,
  userId: userId || 'Not set'
});

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      console.log('Login thunk called with:', credentials);
      const response = await authService.login(credentials);
      console.log('Login thunk response:', response);
      return response;
    } catch (error: any) {
      console.error('Login thunk error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Login failed. Please check your credentials.'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      console.log('Register thunk called with:', userData);
      const response = await authService.register(userData);
      console.log('Register thunk response:', response);
      return response;
    } catch (error: any) {
      console.error('Register thunk error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Registration failed. Please try again.'
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Get current user thunk called');
      const response = await authService.getCurrentUser();
      console.log('Get current user response:', response);
      return response;
    } catch (error: any) {
      console.error('Get current user error:', error);
      // Clear token if user fetch fails
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch user information'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    console.log('Logout thunk called');
    authService.logout();
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('Login fulfilled:', action.payload);
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        console.error('Login rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
        // Don't clear existing auth state on login failure
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        console.log('Register fulfilled:', action.payload);
        state.isLoading = false;
        // Don't authenticate after registration
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        console.error('Register rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        console.log('Get current user fulfilled:', action.payload);
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        console.error('Get current user rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        console.log('Logout fulfilled');
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer; 