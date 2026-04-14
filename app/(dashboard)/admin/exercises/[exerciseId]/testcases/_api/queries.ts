import { useQuery } from '@tanstack/react-query';
import axios from '@/config/axios';
import { Testcase } from '@/components/admin/TestcaseEditor';

export interface ExerciseDetailResponse {
  id: number;
  title: string;
  description: string;
  testCases: Testcase[];
}

export const useExerciseDetail = (exerciseId?: string | number) => {
  return useQuery({
    queryKey: ['exerciseDetail', exerciseId],
    queryFn: async () => {
      const { data } = await axios.get<ExerciseDetailResponse>(`/exercises/${exerciseId}`);
      return data;
    },
    enabled: !!exerciseId,
  });
};
