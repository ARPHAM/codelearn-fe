import axios from '@/config/axios';

export const examApi = {
  getExams: async (params?: any) => {
    const response = await axios.get('/exam', { params });
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
};
