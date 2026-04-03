import axios from '@/config/axios';

export interface RoomData {
    id: string;
    name: string;
    description?: string;
    type: 'MEETING' | 'CODE';
    problemId?: number | null;
    status: 'OPEN' | 'CLOSED';
    createdBy: string;
    maxParticipants: number;
    createdAt: string;
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
    // Map 'path' to 'filePath' to maintain consistency with frontend
    return (res.data.data || []).map((f: any) => ({
        ...f,
        filePath: f.filePath || f.path
    }));
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

/**
 * Fetch my rooms
 */
export const getMyRoomsApi = async (): Promise<RoomData[]> => {
    const res = await axios.get('/rooms/my-rooms');
    return res.data.data;
};

/**
 * Update room info
 */
export const updateRoomApi = async (id: string, data: Partial<RoomData>): Promise<RoomData> => {
    const res = await axios.patch(`/rooms/${id}`, data);
    return res.data.data;
};

/**
 * Create a new file in workspace
 */
export const createFileApi = async (workspaceId: string, filePath: string, content: string = ''): Promise<WorkspaceFile> => {
    // New spec: Use 'filePath' in body, workspaceId in URL
    const res = await axios.post(`/workspaces/${workspaceId}/files`, { filePath, content });
    return res.data.data;
};

/**
 * Delete a file from workspace
 */
export const deleteFileApi = async (workspaceId: string, filePath: string): Promise<void> => {
    // filePath can contain slashes, so it might need careful URL encoding or use a query param/body
    // But according to spec: DELETE /workspaces/:workspaceId/files/*
    await axios.delete(`/workspaces/${workspaceId}/files/${filePath}`);
};
