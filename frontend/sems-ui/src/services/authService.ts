import api from './api';
import { User } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('Attempting login with credentials:', credentials);
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    console.log('Login response:', response.data);
    // Store token and user ID in localStorage for persistence
    localStorage.setItem('token', response.data.token);
    if (response.data.user) {
      localStorage.setItem('userId', response.data.user.id);
    }
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    // Ensure 'role' field is set to 'USER' if not provided
    const userDataWithRole = {
      ...userData,
      role: userData.role || 'USER'
    };
    console.log('Registering user with data:', userDataWithRole);
    const response = await api.post<User>('/auth/register', userDataWithRole);
    console.log('Registration response:', response.data);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      console.log('Fetching current user');
      const response = await api.get<User>('/users/me');
      console.log('Current user response:', response.data);
      // Store user ID in localStorage
      if (response.data && response.data.id) {
        localStorage.setItem('userId', response.data.id);
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem('token') !== null;
  }
};

export default authService; 