export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export enum ExpenseStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  CANCELLED = 'CANCELLED'
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: Category;
  status: ExpenseStatus | string;
  createdBy: Partial<User>;
  userId: string;
  createdAt: string;
  expenseDate: string;
  lastModifiedAt: string;
  updatedAt: string;
  receipt?: string;
  comments?: string;
  requiresReceipt: boolean;
  flaggedForReview: boolean;
}

export interface ApprovalStep {
  id: string;
  expenseId: string;
  action: ApprovalAction | string;
  actionBy: Partial<User>;
  actionDate: string;
  comments?: string;
  level?: number;
  approverId?: string;
  approverName?: string;
  approverRole?: string;
}

export type ApprovalHistory = ApprovalStep[];

export enum ApprovalAction {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  CANCELLED = 'CANCELLED'
}

export interface WorkflowStatistics {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  changesRequestedCount: number;
  averageApprovalTime: number;
  byDepartment?: {
    [department: string]: {
      pendingCount: number;
      approvedCount: number;
      rejectedCount: number;
    }
  };
}

export interface Budget {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  spent: number;
  available: number;
  utilizationPercentage: number;
  startDate: string;
  endDate: string;
  departmentId?: string;
  department?: string;
  categoryId?: string;
  category?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiError {
  status: number;
  message: string;
} 