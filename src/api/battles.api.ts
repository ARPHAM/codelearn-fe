import axios from '@/config/axios';

export const battlesApi = {
  getActiveBattles: () => 
    axios.get(`/battles/active`),

  
  challenge: (opponentId: string, duration: number = 300, topic: string = 'All') => 
    axios.post(`/battles/challenge`, { opponentId, duration, topic }),
  
  accept: (id: string) => 
    axios.post(`/battles/${id}/accept`),
    
  cancel: (id: string) =>
    axios.post(`/battles/${id}/cancel`),
    
  submitCode: (id: string, code: string) =>
    axios.post(`/battles/${id}/submit`, { code }),

  getResult: (id: string) =>
    axios.get(`/battles/${id}/result`),
};
