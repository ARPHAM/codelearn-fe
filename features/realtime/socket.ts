import { io, Socket } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create a singleton socket instance
export const socket: Socket = io(URL, {
    autoConnect: false, // connect explicitly when needed
    withCredentials: true,
    transports: ['websocket', 'polling'], // Prioritize websocket for better performance
});
