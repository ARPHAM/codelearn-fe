import axios from '@/config/axios';

export const examApi = {
  getExams: async (params?: any) => {
    const response = await axios.get('/exam', { params });
    return response.data.data;
  },
  getExamsByCourse: async (courseId: string) => {
    const response = await axios.get(`/exam/course/${courseId}`);
    return response.data.data;
  },
  getExamDetail: async (id: string) => {
    const response = await axios.get(`/exam/${id}`);
    return response.data.data;
  },
  submitExam: async (id: string, data: any) => {
    const response = await axios.post(`/exam/${id}/submit`, data);
    return response.data.data;
  },
  getResults: async (id: string) => {
    const response = await axios.get(`/exam/${id}/result`);
    return response.data.data;
  },
  startExam: async (id: string) => {
    const response = await axios.post(`/exam/${id}/start`);
    return response.data.data;
  },
  regradeExam: async (id: string) => {
    const response = await axios.post(`/exam/${id}/regrade`);
    return response.data.data;
  },
  submitForApproval: async (id: string) => {
    const response = await axios.post(`/exam/${id}/submit-approval`);
    return response.data.data;
  },
  approveExam: async (id: string) => {
    const response = await axios.patch(`/exam/${id}/approve`);
    return response.data.data;
  },
};
