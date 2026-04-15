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
  getRooms: () => axios.get('/rooms'),
  getMyRooms: () => axios.get('/rooms/my-rooms'),
  getRoomDetail: (id: string) => axios.get(`/rooms/${id}`),
  createRoom: (data: any) => axios.post('/rooms', data),
  joinRoom: (id: string, data: any) => axios.post(`/rooms/${id}/join`, data),
  leaveRoom: (id: string) => axios.post(`/rooms/${id}/leave`, {}),
  getParticipants: (id: string) => axios.get(`/rooms/${id}/participants`),
};
