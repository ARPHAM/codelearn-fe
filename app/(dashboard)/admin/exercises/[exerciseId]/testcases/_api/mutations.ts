import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/config/axios';
import { Testcase } from '@/components/admin/TestcaseEditor';
import { toast } from '@/components/ui/Toast';

export const useUpdateExerciseTestcases = (exerciseId?: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testcases: Testcase[]) => {
      const { data } = await axios.put(`/exercises/${exerciseId}`, { testCases: testcases });
      return data;
    },
    onSuccess: () => {
      toast({ type: 'success', title: 'Testcases Saved', message: 'Testcases completely updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['exerciseDetail', exerciseId] });
    },
    onError: (err: any) => {
      toast({ type: 'error', title: 'Save Failed', message: err.message || 'An error occurred while saving.' });
    }
  });
};
