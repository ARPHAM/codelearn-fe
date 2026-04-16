import axios from '@/config/axios';

export interface PlagiarismResult {
  exerciseId: number;
  pairs: PlagiarismPair[];
  summary: {
    totalSubmissions: number;
    detectedPairs: number;
    highRiskPairs: number;
  };
}

export interface PlagiarismPair {
  id: string;
  submissionA: any;
  submissionB: any;
  studentA: string;
  studentB: string;
  similarity: number;
  matchingLines: string;
  status: 'PENDING' | 'FLAGGED' | 'RESOLVED';
}

export const plagiarismApi = {
  check: async (exerciseId: string, threshold: number = 70) => {
    const response = await axios.post(`/plagiarism/check/${exerciseId}`, {
      threshold,
    });
    return response.data.data;
  },

  getResults: async (exerciseId: string) => {
    const response = await axios.get(`/plagiarism/${exerciseId}/results`);
    return response.data.data;
  },

  flag: async (id: string, reason: string) => {
    const response = await axios.post(`/plagiarism/flag`, { id, reason });
    return response.data.data;
  },
};
