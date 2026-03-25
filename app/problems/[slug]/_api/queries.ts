import { useQuery } from '@tanstack/react-query';
import axios from '@/config/axios';
import { ProblemData } from '@/components/problem/ProblemDescription';
import { RunResultData } from '@/components/editor/RunPanel';
import { SubmissionResultData } from '@/components/editor/SubmissionPanel';

const FINAL_STATUSES = ['ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILE_ERROR'];

export const useProblem = (slug: string) => {
  return useQuery({
    queryKey: ['problem', slug],
    queryFn: async () => {
      const { data } = await axios.get<ProblemData>(`/problems/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
};

export const useRunResult = (runId: string | number | null) => {
  return useQuery({
    queryKey: ['runResult', runId],
    queryFn: async () => {
      const { data } = await axios.get<RunResultData>(`/run/${runId}`);
      return data;
    },
    enabled: !!runId,
    // Stop polling when we hit a final status
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && FINAL_STATUSES.includes(data.status)) {
        return false;
      }
      return 1000;
    },
  });
};

export const useSubmissionResult = (submissionId: string | number | null) => {
  return useQuery({
    queryKey: ['submissionResult', submissionId],
    queryFn: async () => {
      const { data } = await axios.get<SubmissionResultData>(`/submissions/${submissionId}`);
      return data;
    },
    enabled: !!submissionId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && FINAL_STATUSES.includes(data.status)) {
        return false;
      }
      return 1000;
    },
  });
};
