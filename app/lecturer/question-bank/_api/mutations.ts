import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/config/axios';
import { toast } from '@/components/ui/Toast';

export interface CreateExerciseDto {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  languages: string[];
  score: number;
  courseId?: string;
  testCases: { input: string; output: string; hidden: boolean }[];
  hints: string[];
  initialCode?: Record<string, string>; // custom field to handle default code per language
}

export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExerciseDto) => {
      const response = await axios.post('/exercises', data);
      return response.data;
    },
    onSuccess: () => {
      toast({ type: 'success', title: 'Tạo câu hỏi thành công!', message: 'Câu hỏi mới đã được thêm vào ngân hàng.' });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: (error: any) => {
      toast({ type: 'error', title: 'Tạo câu hỏi thất bại!', message: error.response?.data?.message || 'Đã có lỗi xảy ra.' });
    },
  });
};
