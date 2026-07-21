import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

import { SOCKET_URL } from "@/lib/config";

export interface CrdtUpdate {
  documentId: string;
  delta: string;
  author: string;
  timestamp: number;
}

export const useCRDT = (
  documentId: string | undefined,
  onUpdate: (update: CrdtUpdate) => void,
) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!documentId) return;

    const socketIo = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socketIo.on("connect", () => {
      console.log(`🔌 CRDT Socket Connected for doc: ${documentId}`);
      // Join the CRDT room for this document
      socketIo.emit("crdt:join", { documentId });
    });

    socketIo.on("crdt:sync", (payload) => {
      // Initial payload containing current state
      if (payload.documentId === documentId) {
        onUpdate({
          documentId,
          delta: payload.content || "",
          author: "SYSTEM",
          timestamp: Date.now(),
        });
      }
    });

    socketIo.on("crdt:update", (payload: CrdtUpdate) => {
      if (payload.documentId === documentId) {
        onUpdate(payload);
      }
    });

    setSocket(socketIo);

    return () => {
      socketIo.off("crdt:sync");
      socketIo.off("crdt:update");
      socketIo.disconnect();
    };
  }, [documentId, onUpdate]);

  return socket;
};
