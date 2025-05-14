export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId: string;
  departmentName?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Expense {
  id: string;
  userId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: Category;
  status: ExpenseStatus;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  receiptUrl?: string;
  departmentId?: string;
  projectId?: string;
  currentApprovalLevel?: number;
  rejectionReason?: string;
  requiresReceipt: boolean;
  flaggedForReview: boolean;
  reviewComments?: string;
}

export interface Category {
  id: string;
  name: string;
}

export enum ExpenseStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED'
}

export interface ApprovalStep {
  id: string;
  level: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  expenseId: string;
  action: ApprovalAction;
  comments?: string;
  actionDate: string;
}

export enum ApprovalAction {
  SUBMIT = 'SUBMIT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REQUEST_CHANGES = 'REQUEST_CHANGES',
  ESCALATE = 'ESCALATE',
  DELEGATE = 'DELEGATE'
}

export interface ApprovalLevel {
  id: string;
  level: number;
  name: string;
  description?: string;
  departmentId?: string;
  roleId?: string;
  minAmountThreshold: number;
  maxAmountThreshold?: number;
  requiresReceipt: boolean;
  isActive: boolean;
  requiredApprovers?: number;
}

export interface Budget {
  id: string;
  name: string;
  description?: string;
  amount: number;
  startDate: string;
  endDate: string;
  departmentId?: string;
  projectId?: string;
  categoryId?: string;
  consumed: number;
  remaining: number;
  status: BudgetStatus;
}

export enum BudgetStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPLETED = 'DEPLETED'
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiError {
  status: number;
  message: string;
}

// ApprovalHistory type for tracking approval steps
export type ApprovalHistory = ApprovalStep[];

// WorkflowStatistics type for expense approval statistics
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