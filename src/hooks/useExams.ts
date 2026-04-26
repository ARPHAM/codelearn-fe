import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examApi } from '@/api/exam.api';

export const useExamsByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['exams', courseId],
    queryFn: () => examApi.getExamsByCourse(courseId),
    enabled: !!courseId,
  });
};

export const useExamDetail = (id: string) => {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => examApi.getExamDetail(id),
    enabled: !!id,
  });
};

export const useStartExam = () => {
  return useMutation({
    mutationFn: (id: string) => examApi.startExam(id),
  });
};

export const useRegradeExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examApi.regradeExam(id),
    onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['exam-results', id] });
    }
  });
};
