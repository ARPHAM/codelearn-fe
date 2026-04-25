import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLecturerProblems,
  getStudentProblems,
  getProblemDetail,
  getStudentProblemDetail,
  createProblem,
  updateProblem,
  getAdminProblems,
  approveProblemVersion,
  rejectProblemVersion,
  CreateProblemDto,
  ProblemDetailResponse,
  StudentProblemDetailResponse
} from '@/api/problems.api';

export const useLecturerProblems = (params?: { page?: number; limit?: number; search?: string; filter?: string; difficulty?: string; status?: string; courseId?: string }) => {
  return useQuery({
    queryKey: ['lecturer-problems', params],
    queryFn: () => getLecturerProblems(params),
  });
};

export const useStudentProblems = (params?: { page?: number; limit?: number; search?: string; filter?: string; difficulty?: string; status?: string }) => {
  return useQuery({
    queryKey: ['student-problems', params],
    queryFn: () => getStudentProblems(params),
  });
};

export const useAdminProblems = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: string;
  status?: string;
  authorId?: string;
}) => {
  return useQuery({
    queryKey: ['admin-problems', params],
    queryFn: () => getAdminProblems(params),
  });
};

export const useProblemDetail = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['problem-detail', id],
    queryFn: () => getProblemDetail(id),
    enabled: !!id && enabled,
  });
};

export const useStudentProblemDetail = (slug: string, enabled: boolean = true) => {
  return useQuery<StudentProblemDetailResponse>({
    queryKey: ['student-problem-detail', slug],
    queryFn: () => getStudentProblemDetail(slug),
    enabled: !!slug && enabled,
  });
};

export const useCreateProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProblemDto) => createProblem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lecturer-problems'] });
    },
  });
};

export const useUpdateProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; data: CreateProblemDto }) => updateProblem(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lecturer-problems'] });
      queryClient.invalidateQueries({ queryKey: ['problem-detail', variables.id] });
    },
  });
};

export const useApproveProblemVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => approveProblemVersion(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-problems'] });
      queryClient.invalidateQueries({ queryKey: ['lecturer-problems'] });
      queryClient.invalidateQueries({ queryKey: ['student-problems'] });
    },
  });
};

export const useRejectProblemVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => rejectProblemVersion(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-problems'] });
      queryClient.invalidateQueries({ queryKey: ['lecturer-problems'] });
    },
  });
};
