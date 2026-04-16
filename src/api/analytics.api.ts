import axios from '@/config/axios';

export const analyticsApi = {
  getCourseAnalytics: async (courseId: string) => {
    const response = await axios.get(`/analytics/course/${courseId}`);
    return response.data.data;
  },

  getStudentAnalytics: async (studentId: string) => {
    const response = await axios.get(`/analytics/student/${studentId}`);
    return response.data.data;
  },

  getLecturerDashboard: async () => {
    const response = await axios.get(`/analytics/lecturer/dashboard`);
    return response.data.data;
  },
};

export const notificationsApi = {
  broadcast: async (dto: {
    courseId: string;
    target: string;
    message: string;
    channels: string[];
  }) => {
    const response = await axios.post(`/notifications/broadcast`, dto);
    return response.data.data;
  },
};
