import axios from '@/config/axios';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  msg?: string; // Tương thích với format cũ
}

export interface ChatRequest {
  messages: ChatMessage[];
  codeContext?: string;
  problemContext?: {
    title: string;
    description: string;
  };
}

export const aiApi = {
  chat: async (data: ChatRequest) => {
    const response = await axios.post('/ai/chat', data);
    return response.data.data;
  },
};
