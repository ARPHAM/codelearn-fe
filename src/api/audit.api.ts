import axios from '@/config/axios';

export interface AuditLog {
  id: number;
  userId?: string;
  action: string;
  metadata?: any;
  createdAt: string;
}

export const auditApi = {
  getLogs: (params?: { page?: number; limit?: number; search?: string }) =>
    axios.get('/admin/audit-logs', { params }),
  
  getLogDetail: (id: number) =>
    axios.get(`/admin/audit-logs/${id}`),
};
