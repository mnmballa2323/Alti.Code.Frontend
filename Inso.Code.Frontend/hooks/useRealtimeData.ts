import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

import { API_URL } from "@/lib/config";

interface UseRealtimeDataOptions {
  channel: string;
  enabled?: boolean;
}

export function useRealtimeData<T>(options: UseRealtimeDataOptions) {
  const { channel, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const wsUrl = API_URL?.replace("/api/v1", "") || "http://localhost:5000";
    const socket = io(wsUrl, {
      transports: ["websocket", "polling"],
      auth: {
        token:
          typeof window !== "undefined" ? localStorage.getItem("token") : null,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on(channel, (payload: T) => setData(payload));

    // Subscribe to the channel
    socket.emit("subscribe", { channel });

    return () => {
      socket.off(channel);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [channel, enabled]);

  const send = useCallback((event: string, payload: unknown) => {
    socketRef.current?.emit(event, payload);
  }, []);

  return { data, isConnected, send };
}
