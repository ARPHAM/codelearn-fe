import { useQuery } from '@tanstack/react-query';
import { getLanguages } from '@/api/languages.api';

export const useLanguages = () => {
  return useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
    staleTime: 1000 * 60 * 60, // 1 hour since languages rarely change
  });
};
