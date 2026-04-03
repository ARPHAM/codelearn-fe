import { useQuery } from '@tanstack/react-query';
import { getRoom, getParticipants, getWorkspaceFiles, getMyRoomsApi } from './api';

export const useRoom = (roomId: string) => {
    return useQuery({
        queryKey: ['room', roomId],
        queryFn: () => getRoom(roomId),
        enabled: !!roomId,
    });
};

export const useParticipants = (roomId: string) => {
    return useQuery({
        queryKey: ['room_participants', roomId],
        queryFn: () => getParticipants(roomId),
        enabled: !!roomId,
    });
};

export const useWorkspaceFiles = (workspaceId?: string) => {
    return useQuery({
        queryKey: ['workspace_files', workspaceId],
        queryFn: () => getWorkspaceFiles(workspaceId!),
        enabled: !!workspaceId,
    });
};

export const useMyRooms = () => {
    return useQuery({
        queryKey: ['my_rooms'],
        queryFn: getMyRoomsApi,
    });
};
