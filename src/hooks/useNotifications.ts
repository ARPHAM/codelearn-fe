import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { notificationApi, Notification } from '@/api/notification.api';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications({ page: 1, limit: 20 }),
  });

  // Real-time listener
  useEffect(() => {
    const s = io(`${SOCKET_URL}/notifications`, {
      withCredentials: true,
      transports: ['websocket'],
    });

    s.on('connect', () => {
      console.log('[useNotifications] Connected to notifications namespace');
    });

    s.on('notification_received', (newNotification: Notification) => {
      console.log('[useNotifications] Received new notification:', newNotification);
      
      // Update cache
      queryClient.setQueryData(['notifications'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: [newNotification, ...oldData.items],
          unreadCount: oldData.unreadCount + 1,
          total: oldData.total + 1,
        };
      });
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [queryClient]);

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: data?.items || [],
    unreadCount: data?.unreadCount || 0,
    total: data?.total || 0,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
  };
};
