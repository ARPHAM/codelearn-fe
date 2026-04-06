import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSystemSettings,
  updateSystemSettings,
  getInfrastructureInfo,
  SystemSettings,
} from '@/api/settings.api';

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: getSystemSettings,
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SystemSettings>) => updateSystemSettings(data),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['admin', 'settings'], updatedSettings);
    },
  });
};

export const useInfrastructureInfo = () => {
  return useQuery({
    queryKey: ['admin', 'infrastructure'],
    queryFn: getInfrastructureInfo,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};
