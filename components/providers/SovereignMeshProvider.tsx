"use client";

import React, { useEffect, useState } from "react";

import { API_URL } from "@/lib/config";
import { useSocket } from "@/hooks/useSocket";

export const SovereignMeshProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { status, socket } = useSocket();
  const [meshCoherence, setMeshCoherence] = useState(false);

  useEffect(() => {
    // Phase 48: Sovereign Unified Mesh Handshake
    // Ensure the frontend successfully hits the backend mesh validation endpoint.
    const verifyMesh = async () => {
      try {
        const response = await fetch(`${API_URL}/sovereign/mesh-status`);

        if (response.ok) {
          const data = await response.json();

          if (data.status === "OMEGA_LEVEL_COHERENCE") {
            setMeshCoherence(true);
            console.info("🌐 [SovereignMesh] Triple-Cloud Coherence Verified.");
          }
        }
      } catch (err) {
        console.warn("⚠️ [SovereignMesh] Backend Mesh unreachable.", err);
      }
    };

    verifyMesh();
    // Poll the health of the isolated mesh every 60 seconds
    const interval = setInterval(verifyMesh, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (socket && status === "connected") {
      socket.emit("frontend.client.connected");
      console.info(
        "📡 [SovereignMesh] WebSocket successfully anchored to backend event bus.",
      );
    }
  }, [socket, status]);

  return (
    <>
      {/* Invisible global provider that ensures backend <-> frontend integration */}
      {children}
    </>
  );
};
