import axios from '@/config/axios';

export const exerciseApi = {
  getExercises: async (params?: any) => {
    const response = await axios.get('/exercise', { params });
    return response.data.data;
  },
  getExercisesByCourse: async (courseId: string) => {
    const response = await axios.get('/exercise', { params: { courseId } });
    return response.data.data;
  },
  getExerciseDetail: async (id: number | string) => {
    const response = await axios.get(`/exercise/${id}`);
    return response.data.data;
  },
  createExercise: async (data: any) => {
    const response = await axios.post('/exercise', data);
    return response.data.data;
  },
  updateExercise: async (id: number | string, data: any) => {
    const response = await axios.put(`/exercise/${id}`, data);
    return response.data.data;
  },
  submitForApproval: async (id: number | string) => {
    const response = await axios.post(`/exercise/${id}/submit-approval`);
    return response.data.data;
  },
  approveExercise: async (id: number | string) => {
    const response = await axios.post(`/exercise/${id}/approve`);
    return response.data.data;
  },
  rejectExercise: async (id: number | string) => {
    const response = await axios.post(`/exercise/${id}/reject`);
    return response.data.data;
  },
};
