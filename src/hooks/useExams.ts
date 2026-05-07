import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examApi } from '@/api/exam.api';

export const useExamsByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['exams', courseId],
    queryFn: () => examApi.getExamsByCourse(courseId),
    enabled: !!courseId && courseId !== 'new',
  });
};

export const useExamDetail = (id: string) => {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => examApi.getExamDetail(id),
    enabled: !!id && id !== 'new',
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

export const useLogViolation = () => {
  return useMutation({
    mutationFn: ({ id, metadata }: { id: string; metadata: any }) => 
      examApi.logViolation(id, metadata),
  });
};

export const useFinishExam = () => {
  return useMutation({
    mutationFn: (id: string) => examApi.finishExam(id),
  });
};

export const useExamResult = (id: string) => {
  return useQuery({
    queryKey: ['exam-result', id],
    queryFn: () => examApi.getExamResult(id),
    enabled: !!id && id !== 'new',
  });
};

export const useExamMonitoring = (id: string) => {
  return useQuery({
    queryKey: ['exam-monitoring', id],
    queryFn: () => examApi.getExamMonitoring(id),
    enabled: !!id && id !== 'new',
    refetchInterval: 5000, // Tự động làm mới mỗi 5 giây để giám sát thời gian thực
  });
};

export const useStudentLogs = (examId: string, userId: string) => {
  return useQuery({
    queryKey: ['exam-student-logs', examId, userId],
    queryFn: () => examApi.getStudentLogs(examId, userId),
    enabled: !!examId && !!userId,
  });
};

export const useUpcomingExams = () => {
  return useQuery({
    queryKey: ['upcoming-exams'],
    queryFn: () => examApi.getUpcomingExams(),
  });
};
