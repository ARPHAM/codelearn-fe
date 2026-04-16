import axios from '@/config/axios';

export interface AuditLog {
  id: number;
  userId?: string;
  action: string;
  metadata?: any;
  createdAt: string;
}

export const auditApi = {
  getLogs: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await axios.get('/admin/audit-logs', { params });
    return response.data.data;
  },

  getLogDetail: async (id: number) => {
    const response = await axios.get(`/admin/audit-logs/${id}`);
    return response.data.data;
  },
};
