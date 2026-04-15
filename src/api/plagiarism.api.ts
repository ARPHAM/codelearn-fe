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
  check: (exerciseId: string, threshold: number = 70) =>
    axios.post(`/plagiarism/check/${exerciseId}`, { threshold }),

  getResults: (exerciseId: string) =>
    axios.get(`/plagiarism/${exerciseId}/results`),

  flag: (id: string, reason: string) =>
    axios.post(`/plagiarism/flag`, { id, reason }),
};
