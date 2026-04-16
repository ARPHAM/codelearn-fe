import axios from '@/config/axios';

export const courseApi = {
  getCourses: async (params?: any) => {
    const response = await axios.get('/course', { params });
    return response.data.data;
  },
  getCourseDetail: async (id: string) => {
    const response = await axios.get(`/course/${id}`);
    return response.data.data;
  },
  enroll: async (courseId: string) => {
    const response = await axios.post(`/course/${courseId}/enroll`);
    return response.data.data;
  },
  getMyCourses: async () => {
    const response = await axios.get('/course/me');
    return response.data.data;
  },
};
