import axios from '@/config/axios';

export const learningPathApi = {
  getMyPath: async () => {
    const response = await axios.get(`/student/learning-path`);
    return response.data.data;
  },

  refreshPath: async () => {
    const response = await axios.post(`/student/learning-path/refresh`);
    return response.data.data;
  },

  getSuggestions: async (limit: number = 5) => {
    const response = await axios.get(
      `/student/learning-path/suggestions?limit=${limit}`,
    );
    return response.data.data;
  },

  getAiHint: async (dto: {
    exerciseId: number;
    submissionId?: number;
    userCode: string;
    question: string;
    language: string;
  }) => {
    const response = await axios.post(`/student/ai/hint`, dto);
    return response.data.data;
  },
};

