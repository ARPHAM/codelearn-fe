import { useEffect, useState, useRef } from 'react';
import { socket } from './socket';

interface UseRoomSocketProps {
    roomId: string;
    enabled?: boolean;
    onUserJoined?: (data: { userId: string }) => void;
    onUserLeft?: (data: { userId: string; isHost?: boolean }) => void;
    onCodeUpdate?: (data: { userId: string, filePath: string, content: string }) => void;
    onFileSwitched?: (data: { userId: string, filePath: string }) => void;
    onFileCreated?: (file: any) => void;
    onFileDeleted?: (data: { filePath: string, id?: string, workspaceId: string }) => void;
    onFileRenamed?: (data: { oldPath: string, newFile: any, workspaceId: string }) => void;
    onFileUpdated?: (file: any) => void;
    onProblemSelected?: (data: { problemSlug: string }) => void;
}

export type SessionStatus = 'ACTIVE' | 'CLOSING' | 'CLOSED';

export const useRoomSocket = ({
    roomId,
    enabled = true,
    onUserJoined,
    onUserLeft,
    onCodeUpdate,
    onFileSwitched,
    onFileCreated,
    onFileDeleted,
    onFileRenamed,
    onFileUpdated,
    onProblemSelected,
}: UseRoomSocketProps) => {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [sessionStatus, setSessionStatus] = useState<SessionStatus>('ACTIVE');
    const [closingTimeLeft, setClosingTimeLeft] = useState<number | null>(null);
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

    // isolate deps: store latest callbacks in ref to prevent re-binding socket events continuously
    const callbacksRef = useRef({ 
        onUserJoined, onUserLeft, onCodeUpdate, onFileSwitched, 
        onFileCreated, onFileDeleted, onFileRenamed, onFileUpdated, onProblemSelected 
    });
    
    useEffect(() => {
        callbacksRef.current = { 
            onUserJoined, onUserLeft, onCodeUpdate, onFileSwitched, 
            onFileCreated, onFileDeleted, onFileRenamed, onFileUpdated, onProblemSelected 
        };
    }, [onUserJoined, onUserLeft, onCodeUpdate, onFileSwitched, onFileCreated, onFileDeleted, onFileRenamed, onFileUpdated, onProblemSelected]);

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
        const handleDisconnect = () => {
            setIsConnected(false);
            setOnlineUserIds(new Set());
        };

        // ---------- EVENT LISTENERS ----------
        const handleMembersOnline = (data: { roomId: string; userIds: string[] }) => {
            console.log("[useRoomSocket] Members Online:", data.userIds);
            setOnlineUserIds(new Set(data.userIds));
        };
        const handleUserJoined = (data: { userId: string }) => {
            console.log("[useRoomSocket] User Joined:", data.userId);
            setOnlineUserIds(prev => {
                const next = new Set(prev);
                next.add(data.userId);
                return next;
            });
            callbacksRef.current.onUserJoined?.(data);
        };
        const handleUserLeft = (data: { userId: string, isHost?: boolean }) => {
            console.log("[useRoomSocket] User Left:", data.userId);
            setOnlineUserIds(prev => {
                const next = new Set(prev);
                next.delete(data.userId);
                return next;
            });
            callbacksRef.current.onUserLeft?.(data);
            
            // Host Safety Fallback: immediately trigger closing if host abandons
            if (data.isHost && sessionStatus !== 'CLOSING' && sessionStatus !== 'CLOSED') {
                setSessionStatus('CLOSING');
                if (closingTimeLeft === null) setClosingTimeLeft(300);
            }
        };
        const handleCodeUpdate = (data: { userId: string, filePath: string, content: string }) => callbacksRef.current.onCodeUpdate?.(data);
        const handleFileSwitched = (data: { userId: string, filePath: string }) => callbacksRef.current.onFileSwitched?.(data);
        const handleFileCreated = (file: any) => callbacksRef.current.onFileCreated?.(file);
        const handleFileDeleted = (data: { filePath: string, id?: string, workspaceId: string }) => callbacksRef.current.onFileDeleted?.(data);
        const handleFileRenamed = (data: { oldPath: string, newFile: any, workspaceId: string }) => callbacksRef.current.onFileRenamed?.(data);
        const handleFileUpdated = (file: any) => callbacksRef.current.onFileUpdated?.(file);
        const handleProblemSelected = (data: { problemSlug: string }) => callbacksRef.current.onProblemSelected?.(data);

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

        socket.on('room_members_online', handleMembersOnline);
        socket.on('user_joined', handleUserJoined);
        socket.on('user_left', handleUserLeft);
        socket.on('code_update', handleCodeUpdate);
        socket.on('file_switched', handleFileSwitched);
        socket.on('file_created', handleFileCreated);
        socket.on('file_deleted', handleFileDeleted);
        socket.on('file_renamed', handleFileRenamed);
        socket.on('file_updated', handleFileUpdated);
        socket.on('problem_selected', handleProblemSelected);

        socket.on('room_active', handleRoomActive);
        socket.on('room_closing_in_5_minutes', handleRoomClosing);
        socket.on('room_closed', handleRoomClosed);

        return () => {
            socket.emit('leave_room', { roomId });
            
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);

            socket.off('room_members_online', handleMembersOnline);
            socket.off('user_joined', handleUserJoined);
            socket.off('user_left', handleUserLeft);
            socket.off('code_update', handleCodeUpdate);
            socket.off('file_switched', handleFileSwitched);
            socket.off('file_created', handleFileCreated);
            socket.off('file_deleted', handleFileDeleted);
            socket.off('file_renamed', handleFileRenamed);
            socket.off('file_updated', handleFileUpdated);
            socket.off('problem_selected', handleProblemSelected);

            socket.off('room_active', handleRoomActive);
            socket.off('room_closing_in_5_minutes', handleRoomClosing);
            socket.off('room_closed', handleRoomClosed);
            
            // DO NOT socket.disconnect() ! We preserve the singleton!
        };
    }, [roomId, enabled]); // re-run if roomId or enabled state changes

    return { isConnected, sessionStatus, closingTimeLeft, onlineUserIds };
};
