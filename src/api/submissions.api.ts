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
  getExerciseSubmissions: (exerciseId: string, params?: any) => 
    axios.get(`/exercises/${exerciseId}/submissions`, { params }),
  
  getSubmissionDetail: (id: string) => 
    axios.get(`/submissions/${id}/result`),

  updateScore: (id: string, score: number) =>
    axios.patch(`/submissions/${id}/score`, { score }),
};
