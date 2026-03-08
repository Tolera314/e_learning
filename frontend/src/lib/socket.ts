import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private static instance: SocketService;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public connect(token: string): Socket {
        if (this.socket) return this.socket;

        const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';
        this.socket = io(url, {
            auth: { token },
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Connected to real-time chat service');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        return this.socket;
    }

    public getSocket(): Socket | null {
        return this.socket;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = SocketService.getInstance();
