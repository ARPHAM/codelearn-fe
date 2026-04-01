import axios from '@/config/axios';

export interface RoomData {
    id: string;
    name: string;
    description?: string;
}

export interface ParticipantUser {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
}

export interface ParticipantData {
    roomId: string;
    userId: string;
    user: ParticipantUser;
    role: 'HOST' | 'GUEST';
    workspaceId: string;
    joinedAt: string;
}

export interface WorkspaceFile {
    filePath: string;
    content: string;
}

export interface SessionData {
    id: string;
    status: 'ACTIVE' | 'CLOSING' | 'CLOSED';
    closingAt?: number;
    graceRemainingSeconds?: number;
}

export interface RoomSessionResponse {
    room: RoomData;
    session: SessionData | null;
    currentUserRole: 'HOST' | 'GUEST' | null;
}

/**
 * Fetch initial room metadata
 */
export const getRoom = async (roomId: string): Promise<RoomSessionResponse> => {
    const res = await axios.get(`/rooms/${roomId}/session`);
    return res.data.data;
};

/**
 * Fetch initial participants in the room
 */
export const getParticipants = async (roomId: string): Promise<ParticipantData[]> => {
    const res = await axios.get(`/rooms/${roomId}/participants`);
    return res.data.data;
};

/**
 * Fetch workspace files for a specific workspace (Phase 5)
 */
export const getWorkspaceFiles = async (workspaceId: string): Promise<WorkspaceFile[]> => {
    const res = await axios.get(`/workspaces/${workspaceId}/files`);
    return res.data.data;
};

/**
 * Create a new room
 */
export const createRoomApi = async (data: { name: string; description?: string; type?: 'MEETING' | 'CODE' }): Promise<RoomData> => {
    const res = await axios.post('/rooms', data);
    return res.data.data;
};

/**
 * Track user join (REST)
 */
export const joinRoomApi = async (roomId: string): Promise<void> => {
    await axios.post(`/rooms/${roomId}/join`);
};

/**
 * Track user leave (REST)
 */
export const leaveRoomApi = async (roomId: string): Promise<void> => {
    await axios.post(`/rooms/${roomId}/leave`);
};
