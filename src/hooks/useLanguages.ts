import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLanguages,
  getAdminLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  Language,
} from '@/api/languages.api';

export const useLanguages = () => {
  return useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
    staleTime: 1000 * 60 * 60, // 1 hour since languages rarely change
  });
};

export const useAdminLanguages = () => {
  return useQuery({
    queryKey: ['admin-languages'],
    queryFn: getAdminLanguages,
  });
};

export const useCreateLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Language>) => createLanguage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
  });
};

export const useUpdateLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: number; data: Partial<Language> }) =>
      updateLanguage(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
  });
};

export const useDeleteLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
  });
};
