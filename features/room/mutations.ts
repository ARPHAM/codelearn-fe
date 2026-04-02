import { useMutation, useQueryClient } from '@tanstack/react-query';
import { joinRoomApi, leaveRoomApi, createRoomApi } from './api';

export const useCreateRoom = () => {
    return useMutation({
        mutationFn: createRoomApi,
    });
};

export const useJoinRoom = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (roomId: string) => joinRoomApi(roomId),
        onSuccess: (data, roomId, context) => {
            queryClient.invalidateQueries({ queryKey: ['room_participants', roomId] });
            if (options?.onSuccess) options.onSuccess(data, roomId, context);
        },
        ...options
    });
};

export const useLeaveRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (roomId: string) => leaveRoomApi(roomId),
        onSuccess: (_, roomId) => {
            queryClient.invalidateQueries({ queryKey: ['room_participants', roomId] });
        },
    });
};
