import axios from '@/config/axios';

export interface Submission {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  exercise: {
    id: number;
    title: string;
  };
  language: string;
  score: number;
  status: 'PENDING' | 'PASS' | 'FAIL' | 'PARTIAL';
  executionTime?: number;
  memoryUsage?: number;
  results?: any;
  createdAt: string;
}

export const submissionsApi = {
  getExerciseSubmissions: async (exerciseId: string, params?: any) => {
    const response = await axios.get(`/exercise/${exerciseId}/submission`, { params });
    return response.data.data;
  },
  
  getSubmissionDetail: async (id: string) => {
    const response = await axios.get(`/submission/${id}/result`);
    return response.data.data;
  },

  updateScore: async (id: string, score: number) => {
    const response = await axios.patch(`/submission/${id}/score`, { score });
    return response.data.data;
  },
};
