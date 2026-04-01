import { useEffect, useState, useRef } from 'react';
import { socket } from './socket';

interface UseRoomSocketProps {
    roomId: string;
    enabled?: boolean;
    onUserJoined?: (data: { userId: string }) => void;
    onUserLeft?: (data: { userId: string; isHost?: boolean }) => void;
    onCodeUpdate?: (data: { userId: string, filePath: string, content: string }) => void;
    onFileSwitched?: (data: { userId: string, filePath: string }) => void;
}

export type SessionStatus = 'ACTIVE' | 'CLOSING' | 'CLOSED';

export const useRoomSocket = ({
    roomId,
    enabled = true,
    onUserJoined,
    onUserLeft,
    onCodeUpdate,
    onFileSwitched,
}: UseRoomSocketProps) => {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [sessionStatus, setSessionStatus] = useState<SessionStatus>('ACTIVE');
    const [closingTimeLeft, setClosingTimeLeft] = useState<number | null>(null);

    // isolate deps: store latest callbacks in ref to prevent re-binding socket events continuously
    const callbacksRef = useRef({ onUserJoined, onUserLeft, onCodeUpdate, onFileSwitched });
    
    useEffect(() => {
        callbacksRef.current = { onUserJoined, onUserLeft, onCodeUpdate, onFileSwitched };
    }, [onUserJoined, onUserLeft, onCodeUpdate, onFileSwitched]);

    // Timer logic managed internally by the hook
    useEffect(() => {
        if (sessionStatus === 'CLOSING' && closingTimeLeft !== null) {
            const interval = setInterval(() => {
                setClosingTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [sessionStatus, closingTimeLeft]);

    useEffect(() => {
        if (!roomId || enabled === false) return;

        // Connect if not already connected (using global singleton)
        if (!socket.connected) {
            socket.connect();
        } else {
            // Already connected, just join
            socket.emit('join_room', { roomId });
            setIsConnected(true);
        }

        // ---------- CONNECTION LISTENERS ----------
        const handleConnect = () => {
            setIsConnected(true);
            // Auto reconnect to room upon socket reconnection
            socket.emit('join_room', { roomId });
        };
        const handleDisconnect = () => setIsConnected(false);

        // ---------- EVENT LISTENERS ----------
        const handleUserJoined = (data: { userId: string }) => callbacksRef.current.onUserJoined?.(data);
        const handleUserLeft = (data: { userId: string, isHost?: boolean }) => {
            callbacksRef.current.onUserLeft?.(data);
            
            // Host Safety Fallback: immediately trigger closing if host abandons
            if (data.isHost && sessionStatus !== 'CLOSING' && sessionStatus !== 'CLOSED') {
                setSessionStatus('CLOSING');
                if (closingTimeLeft === null) setClosingTimeLeft(300);
            }
        };
        const handleCodeUpdate = (data: { userId: string, filePath: string, content: string }) => callbacksRef.current.onCodeUpdate?.(data);
        const handleFileSwitched = (data: { userId: string, filePath: string }) => callbacksRef.current.onFileSwitched?.(data);

        // ---------- SESSION LIFECYCLE ----------
        const handleRoomActive = () => {
            setSessionStatus('ACTIVE');
            setClosingTimeLeft(null);
        };
        
        const handleRoomClosing = (data?: { remainingSeconds?: number }) => {
            setSessionStatus('CLOSING');
            setClosingTimeLeft(data?.remainingSeconds ?? 300); // sync countdown with server
        };
        
        const handleRoomClosed = () => {
            setSessionStatus('CLOSED');
            setClosingTimeLeft(0);
        };

        // Bind
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        socket.on('user_joined', handleUserJoined);
        socket.on('user_left', handleUserLeft);
        socket.on('code_update', handleCodeUpdate);
        socket.on('file_switched', handleFileSwitched);

        socket.on('room_active', handleRoomActive);
        socket.on('room_closing_in_5_minutes', handleRoomClosing);
        socket.on('room_closed', handleRoomClosed);

        return () => {
            socket.emit('leave_room', { roomId });
            
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);

            socket.off('user_joined', handleUserJoined);
            socket.off('user_left', handleUserLeft);
            socket.off('code_update', handleCodeUpdate);
            socket.off('file_switched', handleFileSwitched);

            socket.off('room_active', handleRoomActive);
            socket.off('room_closing_in_5_minutes', handleRoomClosing);
            socket.off('room_closed', handleRoomClosed);
            
            // DO NOT socket.disconnect() ! We preserve the singleton!
        };
    }, [roomId, enabled]); // re-run if roomId or enabled state changes

    return { isConnected, sessionStatus, closingTimeLeft };
};
