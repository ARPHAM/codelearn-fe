import axios from '@/config/axios';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (params?: { page?: number; limit?: number }) => {
    const response = await axios.get('/notification', { params });
    return response.data.data;
  },
  markAsRead: async (id: string) => {
    const response = await axios.patch(`/notification/${id}/read`);
    return response.data.data;
  },
  markAllAsRead: async () => {
    const response = await axios.patch('/notification/read-all');
    return response.data.data;
  },
  deleteNotification: async (id: string) => {
    const response = await axios.delete(`/notification/${id}`);
    return response.data.data;
  }
};
