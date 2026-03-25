import { useMutation } from '@tanstack/react-query';
import axios from '@/config/axios';

export interface RunCodeRequest {
  problemVersionId?: number; // Depending on API shape
  problemId?: number; // Sometimes problemId is sufficient
  languageId: number;
  code: string;
  input: string;
}

export interface RunCodeResponse {
  id: string | number;
  status: string;
}

export const useRunCode = () => {
  return useMutation({
    mutationFn: async (payload: RunCodeRequest) => {
      const { data } = await axios.post<RunCodeResponse>('/run', payload);
      return data;
    },
  });
};

export interface SubmitCodeRequest {
  problemVersionId?: number;
  problemId?: number;
  languageId: number;
  code: string;
}

export interface SubmitCodeResponse {
  id: string | number;
  status: string;
}

export const useSubmitCode = () => {
  return useMutation({
    mutationFn: async (payload: SubmitCodeRequest) => {
      const { data } = await axios.post<SubmitCodeResponse>('/submissions', payload);
      return data;
    },
  });
};
