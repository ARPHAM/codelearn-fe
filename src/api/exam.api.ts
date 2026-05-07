import axios from '@/config/axios';

export const examApi = {
  ping: async () => {
    const response = await axios.get('/exam/ping');
    return response.data;
  },
  createExam: async (data: any) => {
    const response = await axios.post('/exam/create', data);
    return response.data.data;
  },
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
  logViolation: async (id: string, metadata: any) => {
    const response = await axios.post(`/exam/${id}/log-violation`, metadata);
    return response.data.data;
  },
  finishExam: async (id: string) => {
    const response = await axios.post(`/exam/${id}/finish`);
    return response.data.data;
  },
  getExamResult: async (id: string) => {
    const response = await axios.get(`/exam/${id}/result`);
    return response.data.data;
  },
  getExamMonitoring: async (id: string) => {
    const response = await axios.get(`/exam/${id}/monitoring`);
    return response.data.data;
  },
  getStudentLogs: async (id: string, userId: string) => {
    const response = await axios.get(`/exam/${id}/monitoring/${userId}`);
    return response.data.data;
  },
  regradeExam: async (id: string) => {
    const response = await axios.post(`/exam/${id}/regrade`);
    return response.data.data;
  },
  recalculateScores: async (id: string) => {
    const response = await axios.post(`/exam/${id}/recalculate-scores`);
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
  rejectExam: async (id: string) => {
    const response = await axios.patch(`/exam/${id}/reject`);
    return response.data.data;
  },
  getUpcomingExams: async () => {
    const response = await axios.get('/exam/my-upcoming');
    return response.data.data;
  }
};
