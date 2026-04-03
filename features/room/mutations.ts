import { useMutation, useQueryClient } from '@tanstack/react-query';
import { joinRoomApi, leaveRoomApi, createRoomApi, updateRoomApi, RoomData } from './api';

export const useCreateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createRoomApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my_rooms'] });
        }
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

export const useUpdateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<RoomData> }) => updateRoomApi(id, data),
        onSuccess: (updatedRoom) => {
            queryClient.invalidateQueries({ queryKey: ['my_rooms'] });
            queryClient.invalidateQueries({ queryKey: ['room', updatedRoom.id] });
        },
    });
};
