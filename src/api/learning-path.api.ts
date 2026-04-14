import axios from '@/config/axios';

export const learningPathApi = {
  getMyPath: () => 
    axios.get(`/student/learning-path`),
  
  refreshPath: () => 
    axios.post(`/student/learning-path/refresh`),
  
  getSuggestions: (limit: number = 5) => 
    axios.get(`/student/learning-path/suggestions?limit=${limit}`),
  
  getAiHint: (dto: { exerciseId: number; submissionId?: number; userCode: string; question: string; language: string }) => 
    axios.post(`/student/ai/hint`, dto),
};

