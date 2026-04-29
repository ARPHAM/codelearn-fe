import { useMutation, useQueryClient } from '@tanstack/react-query';
import { joinRoomApi, leaveRoomApi, createRoomApi, updateRoomApi, RoomData, ParticipantData, approveParticipantApi } from './api';

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
        ...options,
        mutationFn: (roomId: string) => joinRoomApi(roomId),
        onSuccess: (participant: ParticipantData, roomId: string) => {
            console.log("[useJoinRoom] Success! Participant Data:", participant);
            
            // 1. Invalidate to ensure eventual consistency
            queryClient.invalidateQueries({ queryKey: ['room_participants', roomId] });
            queryClient.invalidateQueries({ queryKey: ['room', roomId] });

            // 2. Optimistically update the Room Info (to bypass Lobby)
            queryClient.setQueryData(['room', roomId], (old: any) => {
                if (!old) return old;
                return { ...old, currentUserRole: participant.role || 'GUEST', currentUserStatus: participant.status || 'PENDING' };
            });

            // 3. Optimistically update the Participants List (to show in sidebar)
            queryClient.setQueryData(['room_participants', roomId], (old: any) => {
                const list = Array.isArray(old) ? old : [];
                // Check if already in list to avoid duplicates
                if (list.find((p: any) => p.userId === participant.userId)) return list;
                return [...list, participant];
            });
            
            if (options?.onSuccess) options.onSuccess(participant, roomId);
        },
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
export const useApproveParticipant = (options?: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ roomId, userId }: { roomId: string; userId: string }) => approveParticipantApi(roomId, userId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['room_participants', variables.roomId] });
            if (options?.onSuccess) options.onSuccess();
        },
        ...options
    });
};
