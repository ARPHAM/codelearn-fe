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
  getLeaderboard: async (period: string = 'ALL_TIME', type: string = 'RATING', limit: number = 10) => {
    const response = await axios.get(
      `/leaderboard?period=${period}&type=${type}&limit=${limit}`,
    );
    return response.data.data;
  },

  getMyRank: async () => {
    const response = await axios.get(`/leaderboard/me`);
    return response.data.data;
  },
};
