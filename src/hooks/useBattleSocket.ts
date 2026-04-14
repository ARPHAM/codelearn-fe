import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useBattleSocket = (battleId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [battleData, setBattleData] = useState<any>(null);
  const [timer, setTimer] = useState<number>(0);
  const [progress, setProgress] = useState<{ [userId: string]: number }>({});
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const s = io(`${SOCKET_URL}/battles`);
    setSocket(s);

    if (battleId) {
      s.emit('join_battle', { battleId });
    }

    s.on('battle_started', (data) => {
      setBattleData(data);
      setIsStarted(true);
    });

    s.on('battle_timer_update', (data) => {
      setTimer(data.remainingSeconds);
    });

    s.on('code_progress', (data) => {
      setProgress(prev => ({
        ...prev,
        [data.userId]: data.percent
      }));
    });

    s.on('battle_cancelled', (data) => {
      alert(`Trận đấu đã bị hủy: ${data.reason}`);
      setIsStarted(false);
    });

    return () => {
      s.disconnect();
    };
  }, [battleId]);

  return { socket, battleData, timer, progress, isStarted };
};
