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
  maxScore: number;
  status: 'accepted' | 'wrong_answer' | 'time_limit' | 'memory_limit' | 'runtime_error' | 'compile_error' | 'queued' | 'pending' | 'running';
  executionTime?: number;
  memoryUsage?: number;
  results?: {
      passed: boolean;
      input: string;
      output: string;
      expected: string;
      error?: string;
      runtime?: number;
      memory?: number;
  }[];
  code: {
      entryFile: string;
      files: { filePath: string; content: string }[];
  } | null;
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

  regradeExercise: async (exerciseId: string) => {
    const response = await axios.post(`/exercise/${exerciseId}/submission/regrade`);
    return response.data.data;
  },
};
