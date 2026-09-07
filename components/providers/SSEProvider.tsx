"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import { fetchEventSource } from "@microsoft/fetch-event-source";

import { API_URL } from "@/lib/config";
import {
  executeOsCommand,
  readOsFile,
  writeOsFile,
  listOsDirectory,
} from "@/lib/tauri-ipc";

// ---------------------------------------------------------------------------
// Context — exposes SSE connection state to any child component
// ---------------------------------------------------------------------------
interface SSEContextValue {
  /** true while the EventSource is healthy and receiving messages */
  isConnected: boolean;
  /** non-null when the connection has failed */
  connectionError: string | null;
  /** dismiss the error banner manually */
  dismissError: () => void;
}

const SSEContext = createContext<SSEContextValue>({
  isConnected: false,
  connectionError: null,
  dismissError: () => {},
});

export const useSSE = () => useContext(SSEContext);

// ---------------------------------------------------------------------------
// SSEProvider
// ---------------------------------------------------------------------------
const MAX_RETRY_DELAY_MS = 30_000; // cap back-off at 30 s
const INITIAL_RETRY_DELAY_MS = 3_000;

export const SSEProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const dismissError = useCallback(() => setConnectionError(null), []);

  useEffect(() => {
    let unmounted = false;
    let ctrl: AbortController | null = null;

    const apiUrl = API_URL;

    const connect = () => {
      if (unmounted) return;

      const url = `${apiUrl}/synapse/stream`;

      ctrl = new AbortController();

      fetchEventSource(url, {
        signal: ctrl.signal,
        onopen: async (response) => {
          if (unmounted) return;
          if (
            response.ok &&
            response.headers.get("content-type")?.includes("text/event-stream")
          ) {
            setIsConnected(true);
            setConnectionError(null);
            toast.success("Connected to Real-Time Updates", {
              id: "sse-connected",
              duration: 3000,
            });
          }
        },
        onmessage: (event) => {
          if (unmounted) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === "connected") {
              return;
            }

            if (data.type === "broadcast") {
              toast(
                `📢 ${data.from}: ${data.payload.message || "New Broadcast"}`,
                {
                  icon: "📡",
                  duration: 5000,
                },
              );

              return;
            }

            if (data.type === "os_command") {
              const { action, command, args, path, content, callbackUrl } =
                data.payload;

              const runAction = async () => {
                try {
                  let result: any;

                  toast.loading(`[Swarm] Running native OS action: ${action}`, {
                    id: "os_action",
                  });

                  if (action === "execute") {
                    result = await executeOsCommand(command, args || []);
                  } else if (action === "read") {
                    result = await readOsFile(path);
                  } else if (action === "write") {
                    await writeOsFile(path, content);
                    result = "Success";
                  } else if (action === "list") {
                    result = await listOsDirectory(path);
                  } else {
                    throw new Error(`Unknown OS action: ${action}`);
                  }

                  toast.success(`[Swarm] Native action complete`, {
                    id: "os_action",
                  });

                  if (callbackUrl) {
                    await fetch(callbackUrl, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ success: true, result }),
                    });
                  }
                } catch (err: any) {
                  toast.error(`[Swarm] Native action failed: ${err.message}`, {
                    id: "os_action",
                  });
                  if (callbackUrl) {
                    await fetch(callbackUrl, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        success: false,
                        error: err.message,
                      }),
                    });
                  }
                }
              };

              runAction();

              return;
            }
          } catch (e) {
            console.error("❌ [SSE] Failed to parse message", e);
          }
        },
        onerror: (err) => {
          if (unmounted) return;
          console.error("❌ [SSE] Connection lost", err);
          setIsConnected(false);
          setConnectionError("Live connection lost. Retrying…");
          // fetchEventSource automatically handles retries under the hood
        },
      });
    };

    connect();

    return () => {
      unmounted = true;
      if (ctrl) ctrl.abort();
    };
  }, []);

  return (
    <SSEContext.Provider value={{ isConnected, connectionError, dismissError }}>
      {/* Dismissible connection-error banner */}
      {connectionError && (
        <div
          aria-live="assertive"
          role="alert"
          style={{
            position: "fixed",
            bottom: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.65rem 1.1rem",
            borderRadius: "0.6rem",
            background: "rgba(30,30,30,0.95)",
            border: "1px solid rgba(239,68,68,0.5)",
            color: "#fca5a5",
            fontSize: "0.875rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            maxWidth: "calc(100vw - 2rem)",
          }}
        >
          {/* Pulsing dot */}
          <span
            style={{
              display: "inline-block",
              width: "0.55rem",
              height: "0.55rem",
              borderRadius: "50%",
              background: "#ef4444",
              animation: "sse-pulse 1.5s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          <span>{connectionError}</span>
          <button
            aria-label="Dismiss connection error"
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              fontSize: "1rem",
              lineHeight: 1,
              padding: "0 0.25rem",
            }}
            onClick={dismissError}
          >
            ✕
          </button>
          <style>{`
            @keyframes sse-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `}</style>
        </div>
      )}
      {children}
    </SSEContext.Provider>
  );
};
