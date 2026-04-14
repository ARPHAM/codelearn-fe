import axios from '@/config/axios';

export const analyticsApi = {
  getCourseAnalytics: (courseId: string) => 
    axios.get(`/analytics/course/${courseId}`),
  
  getStudentAnalytics: (studentId: string) => 
    axios.get(`/analytics/student/${studentId}`),
  
  getLecturerDashboard: () => 
    axios.get(`/analytics/lecturer/dashboard`),
};

export const notificationsApi = {
  broadcast: (dto: { courseId: string; target: string; message: string; channels: string[] }) =>
    axios.post(`/notifications/broadcast`, dto),
};
