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
  getSemesters: async () => {
    const response = await axios.get('/course/semesters');
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
  createCourse: async (data: any) => {
    const response = await axios.post('/course', data);
    return response.data.data;
  },
  assignUsers: async (id: string, data: any) => {
    const response = await axios.post(`/course/${id}/users`, data);
    return response.data.data;
  },
  getCourseUsers: async (id: string, params?: any) => {
    const response = await axios.get(`/course/${id}/users`, { params });
    return response.data.data;
  },
  updateCourse: async (id: string, data: any) => {
    const response = await axios.patch(`/course/${id}`, data);
    return response.data.data;
  },
  deleteCourse: async (id: string) => {
    const response = await axios.delete(`/course/${id}`);
    return response.data.data;
  },
  removeUser: async (courseId: string, userId: string) => {
    const response = await axios.delete(`/course/${courseId}/users/${userId}`);
    return response.data.data;
  },
};
