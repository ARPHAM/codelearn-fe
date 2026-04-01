import { useEffect } from 'react';
import { socket } from './socket';

/**
 * Initializes the singleton socket connection on mount and
 * logs the connection status.
 */
export const useSocket = () => {
    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        const onConnect = () => console.log('Socket connected:', socket.id);
        const onDisconnect = (reason: string) => console.log('Socket disconnected:', reason);
        const onError = (error: any) => console.error('Socket error:', error);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('error', onError);

        // We do not disconnect on unmount here to allow the singleton 
        // to be reused globally if needed. Disconnect will be handled 
        // at the room level or application root.
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('error', onError);
        };
    }, []);

    return socket;
};
