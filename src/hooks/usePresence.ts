import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { usePathname } from 'next/navigation';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const usePresence = () => {
  const pathname = usePathname();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only run on client
    const s = io(`${SOCKET_URL}/notifications`, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('accessToken'),
      },
    });

    socketRef.current = s;

    const sendHeartbeat = () => {
      if (s.connected) {
        let status = 'ONLINE';
        
        // Determine BUSY status based on URL
        if (pathname.includes('/student/exams/') || 
            pathname.includes('/student/code-battle/') ||
            pathname.includes('/student/problems/code-editor')) {
          status = 'BUSY';
        }

        s.emit('heartbeat', { status });
      }
    };

    // Send immediately on connect
    s.on('connect', () => {
      sendHeartbeat();
    });

    const interval = setInterval(sendHeartbeat, 10000);

    return () => {
      clearInterval(interval);
      s.disconnect();
    };
  }, [pathname]);

  return socketRef.current;
};
