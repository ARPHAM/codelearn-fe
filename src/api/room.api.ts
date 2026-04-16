import axios from '@/config/axios';

export interface Room {
  id: string;
  name: string;
  description?: string;
  type: 'PAIR' | 'GROUP' | 'CLASS';
  status: 'ONLINE' | 'OFFLINE';
  createdBy: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  participantsCount: number;
  createdAt: string;
}

export const roomApi = {
  getRooms: async () => {
    const response = await axios.get('/room');
    return response.data.data;
  },
  getMyRooms: async () => {
    const response = await axios.get('/room/my-rooms');
    return response.data.data;
  },
  getRoomDetail: async (id: string) => {
    const response = await axios.get(`/room/${id}`);
    return response.data.data;
  },
  createRoom: async (data: any) => {
    const response = await axios.post('/room', data);
    return response.data.data;
  },
  joinRoom: async (id: string, data: any) => {
    const response = await axios.post(`/room/${id}/join`, data);
    return response.data.data;
  },
  leaveRoom: async (id: string) => {
    const response = await axios.post(`/room/${id}/leave`, {});
    return response.data.data;
  },
  getParticipants: async (id: string) => {
    const response = await axios.get(`/room/${id}/participants`);
    return response.data.data;
  },
};
