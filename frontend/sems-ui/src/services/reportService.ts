import api from './api';
import { PaginatedResponse } from '../types';

export interface ReportRequest {
  name: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  parameters: Record<string, any>;
  scheduleType?: ScheduleType;
  scheduleConfig?: Record<string, any>;
  recipients?: string[];
}

export enum ReportType {
  EXPENSE_SUMMARY = 'EXPENSE_SUMMARY',
  EXPENSE_DETAIL = 'EXPENSE_DETAIL',
  BUDGET_USAGE = 'BUDGET_USAGE',
  APPROVAL_WORKFLOW = 'APPROVAL_WORKFLOW',
  USER_ACTIVITY = 'USER_ACTIVITY',
  CUSTOM = 'CUSTOM'
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  HTML = 'HTML'
}

export enum ScheduleType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY'
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  parameters: Record<string, any>;
  scheduleType?: ScheduleType;
  scheduleConfig?: Record<string, any>;
  createdBy: string;
  createdAt: string;
  lastRunAt?: string;
  nextRunAt?: string;
  status: ReportStatus;
  recipients?: string[];
}

export enum ReportStatus {
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

const reportService = {
  createReport: async (reportData: ReportRequest): Promise<Report> => {
    const response = await api.post<Report>('/reports', reportData);
    return response.data;
  },

  getReportById: async (id: string): Promise<Report> => {
    const response = await api.get<Report>(`/reports/${id}`);
    return response.data;
  },

  getAllReports: async (params?: { page?: number, size?: number }): Promise<PaginatedResponse<Report>> => {
    const response = await api.get<PaginatedResponse<Report>>('/reports', { params });
    return response.data;
  },

  updateReport: async (id: string, reportData: Partial<ReportRequest>): Promise<Report> => {
    const response = await api.put<Report>(`/reports/${id}`, reportData);
    return response.data;
  },

  deleteReport: async (id: string): Promise<void> => {
    await api.delete(`/reports/${id}`);
  },

  generateReport: async (id: string, parameters?: Record<string, any>): Promise<Blob> => {
    const response = await api.post(`/reports/${id}/generate`, parameters, {
      responseType: 'blob'
    });
    return response.data;
  },

  downloadReportFile: async (id: string, fileId: string): Promise<Blob> => {
    const response = await api.get(`/reports/${id}/files/${fileId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getScheduledReports: async (): Promise<Report[]> => {
    const response = await api.get<Report[]>('/reports/scheduled');
    return response.data;
  },

  getReportFiles: async (id: string): Promise<any[]> => {
    const response = await api.get(`/reports/${id}/files`);
    return response.data;
  }
};

export default reportService; 