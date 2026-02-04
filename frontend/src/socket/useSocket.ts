import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function useSocket() {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL, {
            transports: ["websocket"],
            reconnection: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Connected to socket:", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from socket");
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    return socketRef;
}
