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
  createBank: (data: { name: string; type: string; description?: string }) =>
    axios.post(`/banks`, data),

  getBanks: () =>
    axios.get(`/banks`),

  getBankDetail: (id: string) =>
    axios.get(`/banks/${id}`),

  addItem: (bankId: string, problemId: number, note?: string) =>
    axios.post(`/banks/${bankId}/items`, { problemId, note }),

  deleteItem: (itemId: number) =>
    axios.delete(`/banks/items/${itemId}`),
};
