import axios from '@/config/axios';

export interface QuestionBank {
  id: number;
  name: string;
  type: string;
  description?: string;
  items?: BankItem[];
}

export interface BankItem {
  id: number;
  problem: {
    id: number;
    title: string;
    difficulty: string;
    type: string;
  };
  note?: string;
  createdAt: string;
}

export const bankApi = {
  createBank: async (data: { name: string; type: string; description?: string }) => {
    const response = await axios.post(`/bank`, data);
    return response.data.data;
  },

  getBanks: async () => {
    const response = await axios.get(`/bank`);
    return response.data.data;
  },

  getBankDetail: async (id: string) => {
    const response = await axios.get(`/bank/${id}`);
    return response.data.data;
  },

  addItem: async (bankId: string, problemId: number, difficulty?: string, note?: string) => {
    const response = await axios.post(`/bank/${bankId}/items`, { problemId, difficulty, note });
    return response.data.data;
  },

  deleteItem: async (itemId: number) => {
    const response = await axios.delete(`/bank/items/${itemId}`);
    return response.data.data;
  },
};
