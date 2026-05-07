import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from '@/components/ui/Toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useBattleSocket = (battleId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [battleData, setBattleData] = useState<any>(null);
  const [timer, setTimer] = useState<number>(0);
  const [progress, setProgress] = useState<{ [userId: string]: number }>({});
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (!battleId) return;

    const s = io(`${SOCKET_URL}/battle`, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('accessToken'),
      },
    });
    setSocket(s);

    // Reset states
    setIsStarted(false);
    setBattleData(null);
    setProgress({});
    setTimer(0);

    s.emit('join_battle', { battleId });

    s.on('battle_started', (data) => {
      console.log('Battle started received:', data);
      setBattleData(data);
      setIsStarted(true);
    });

    s.on('battle_timer_update', (data) => {
      setTimer(data.remainingSeconds);
    });

    s.on('code_progress', (data) => {
      setProgress(prev => ({
        ...prev,
        [data.userId]: data.progress // Backend sends 'progress' field
      }));
    });

    s.on('battle_cancelled', (data) => {
      toast({ type: 'info', title: 'Trận đấu kết thúc', message: data.reason });
      setIsStarted(false);
    });

    s.on('battle_end', (data) => {
      setBattleData((prev: any) => ({ ...prev, winner: data }));
    });

    return () => {
      s.disconnect();
    };
  }, [battleId]);

  return { socket, battleData, timer, progress, isStarted };
};
