"use client";

import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { usePathname } from "next/navigation";

import { API_URL } from "@/lib/config";

interface CursorPoint {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  x: number;
  y: number;
  pathname: string;
}

const SOCKET_URL = API_URL.replace("/api/v1", "");

export function MultiplayerCursorOverlay() {
  const pathname = usePathname();
  const [cursors, setCursors] = useState<Record<string, CursorPoint>>({});
  const socketRef = useRef<any>(null);
  const myIdRef = useRef(`guest_${Math.random().toString(36).slice(2, 6)}`);

  useEffect(() => {
    // Initialize Socket
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_presence", {
        userId: myIdRef.current,
        username: `Engineer-${myIdRef.current.slice(6)}`,
      });
    });

    socket.on("remote_cursor", (payload: CursorPoint) => {
      // Only show cursors on the same page
      if (payload.pathname !== pathname) return;
      // Ignore our own broadcast just in case
      if (payload.userId === myIdRef.current) return;

      setCursors((prev) => ({
        ...prev,
        [payload.userId]: payload,
      }));
    });

    socket.on("user_left", (data: { userId: string }) => {
      setCursors((prev) => {
        const next = { ...prev };

        delete next[data.userId];

        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    // Throttle cursor emission
    let lastEmit = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();

      if (now - lastEmit > 50) {
        // 20hz
        socketRef.current?.emit("cursor_move", {
          x: e.clientX,
          y: e.clientY,
          pathname,
        });
        lastEmit = now;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [pathname]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {Object.values(cursors).map((c) => (
        <div
          key={c.userId}
          className="absolute"
          style={{
            transform: `translate(${c.x}px, ${c.y}px)`,
            transition: "transform 0.05s linear",
          }}
        >
          <svg
            className="drop-shadow-md text-cyan-400"
            fill="none"
            height="36"
            viewBox="0 0 24 36"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.65376 2.15376C5.4057 1.90569 5 2.08139 5 2.43224V28.5678C5 28.9186 5.4057 29.0943 5.65376 28.8462L11 23.5H19.5678C19.9186 23.5 20.0943 23.0943 19.8462 22.8462L5.65376 2.15376Z"
              fill="currentColor"
            />
            <path
              d="M5.65376 2.15376C5.4057 1.90569 5 2.08139 5 2.43224V28.5678C5 28.9186 5.4057 29.0943 5.65376 28.8462L11 23.5H19.5678C19.9186 23.5 20.0943 23.0943 19.8462 22.8462L5.65376 2.15376Z"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
          <div className="absolute top-6 left-4 px-2 py-1 bg-cyan-500 text-black text-[10px] font-bold rounded-md uppercase tracking-wider whitespace-nowrap drop-shadow-sm">
            {c.username}
          </div>
        </div>
      ))}
    </div>
  );
}
