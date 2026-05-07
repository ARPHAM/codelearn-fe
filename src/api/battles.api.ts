import axios from '@/config/axios';

export const battlesApi = {
  getActiveBattles: async () => {
    const response = await axios.get(`/battle/active`);
    return response.data.data;
  },

  challenge: async (opponentId: string, duration: number = 300, topic: string = 'All') => {
    const response = await axios.post(`/battle/challenge`, { opponentId, duration, topic });
    return response.data.data;
  },
  
  accept: async (id: string) => {
    const response = await axios.post(`/battle/${id}/accept`);
    return response.data.data;
  },
  
  cancel: async (id: string) => {
    const response = await axios.post(`/battle/${id}/cancel`);
    return response.data.data;
  },
  
  surrender: async (id: string) => {
    const response = await axios.post(`/battle/${id}/surrender`);
    return response.data.data;
  },
    
  submitCode: async (id: string, code: string) => {
    const response = await axios.post(`/battle/${id}/submit`, { code });
    return response.data.data;
  },

  getResult: async (id: string) => {
    const response = await axios.get(`/battle/${id}/result`);
    return response.data.data;
  },
};
