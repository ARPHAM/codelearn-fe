import axios from '@/config/axios';

export interface LeaderboardItem {
  userId: string;
  name: string;
  rank: number;
  score: number;
  solvedCount: number;
  winRate: number;
  streak: number;
}

export const leaderboardApi = {
  getLeaderboard: (period: string = 'ALL_TIME', limit: number = 10) =>
    axios.get(`/leaderboard?period=${period}&limit=${limit}`),

  
  getMyRank: () =>
    axios.get(`/leaderboard/me`),
};
