import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

import { SOCKET_URL } from "@/lib/config";

export type WsStatus = "connected" | "disconnected" | "reconnecting" | "failed";

export interface SocketState {
  socket: Socket | null;
  status: WsStatus;
  /** Number of reconnect attempts made so far in the current disconnection. */
  reconnectAttempt: number;
}

const MAX_RECONNECT_ATTEMPTS = 5;
/** Exponential backoff delays in milliseconds: 1s, 2s, 4s, 8s, 16s */
const BACKOFF_DELAYS = [1000, 2000, 4000, 8000, 16000];

/**
 * Enhanced WebSocket hook with structured reconnect state.
 *
 * Returns { socket, status, reconnectAttempt } so callers can render
 * appropriate UI feedback (e.g. <WsBanner />) based on connection health.
 */
export const useSocket = (): SocketState => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<WsStatus>("disconnected");
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);

  const clearReconnectTimer = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  const connect = useCallback(() => {
    // Clean up any existing socket before creating a new one
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    }

    const socketIo = io(SOCKET_URL, {
      transports: ["websocket"],
      // Disable socket.io's built-in reconnection — we manage it ourselves
      reconnection: false,
    });

    socketRef.current = socketIo;
    setSocket(socketIo);

    socketIo.on("connect", () => {
      setStatus("connected");
      attemptRef.current = 0;
      setReconnectAttempt(0);
      clearReconnectTimer();
      console.log("🟢 Socket connected:", socketIo.id);
    });

    socketIo.on("disconnect", (reason) => {
      console.warn(`🔴 Socket disconnected: ${reason}`);
      scheduleReconnect();
    });

    socketIo.on("connect_error", (err) => {
      console.error(`🔴 Socket connect_error: ${err.message}`);
      scheduleReconnect();
    });
  }, []);

  const scheduleReconnect = useCallback(() => {
    clearReconnectTimer();

    if (attemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setStatus("failed");
      console.error("❌ Socket: exceeded max reconnect attempts. Giving up.");

      return;
    }

    const delay =
      BACKOFF_DELAYS[Math.min(attemptRef.current, BACKOFF_DELAYS.length - 1)];

    attemptRef.current += 1;
    setReconnectAttempt(attemptRef.current);
    setStatus("reconnecting");

    console.log(
      `🟡 Socket: reconnect attempt ${attemptRef.current}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`,
    );
    reconnectTimer.current = setTimeout(() => connect(), delay);
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      clearReconnectTimer();
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
    };
  }, [connect]);

  return { socket, status, reconnectAttempt };
};
