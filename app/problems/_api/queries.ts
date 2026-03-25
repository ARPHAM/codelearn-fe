import { useQuery } from '@tanstack/react-query';
import axios from '@/config/axios';

export interface GetProblemsParams {
  difficulty?: string;
  tags?: string; // Comma separated tags
  page?: number;
  limit?: number;
  search?: string;
}

export interface ProblemSummary {
  id: number;
  slug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  acceptanceRate?: number;
}

export interface PaginatedProblems {
  items: ProblemSummary[];
  total: number;
  page: number;
  totalPages: number;
}

const fetchProblems = async (params: GetProblemsParams): Promise<PaginatedProblems> => {
  const { data } = await axios.get('/problems', { params });
  return data;
};

export const useProblems = (params: GetProblemsParams) => {
  return useQuery({
    queryKey: ['problems', params],
    queryFn: () => fetchProblems(params),
    placeholderData: (previousData) => previousData, // keep previous data while fetching new page
  });
};
