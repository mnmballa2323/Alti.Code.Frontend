"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Panel, Group, Separator } from "react-resizable-panels";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useSession } from "next-auth/react";
import "@copilotkit/react-ui/styles.css";

import { RootState } from "@/store";
import Sidebar from "@/components/sidebar";
import GhostEditor from "@/components/ghost-editor";

/**
 * Persistent layout wrapper for authenticated application routes.
 */
export function PersistentLayout({ children }: { children: React.ReactNode }) {
  const { isGhostEditorOpen } = useSelector((state: RootState) => state.ui);
  const { data: session } = useSession();
  const [isTauri, setIsTauri] = useState(false);
  const [headers, setHeaders] = useState<Record<string, string>>({});

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).__TAURI_INTERNALS__ !== undefined
    ) {
      setIsTauri(true);
    }
  }, []);

  useEffect(() => {
    const token =
      session?.user?.accessToken ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (token) {
      setHeaders({
        Authorization: `Bearer ${token}`,
      });
    } else {
      setHeaders({});
    }
  }, [session]);

  const copilotRuntimeUrl =
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1") +
    "/copilot";

  return (
    <CopilotKit headers={headers} runtimeUrl={copilotRuntimeUrl}>
      <CopilotSidebar
        Button={() => null}
        defaultOpen={false}
        labels={{
          title: "Inso Copilot",
          initial:
            "Hi! 👋 How can I assist you with your code or deployments today?",
        }}
      >
        <div className="flex flex-col w-full h-screen overflow-hidden bg-[#F4F4F6] dark:bg-background">
          {/* Title Bar */}
          {isTauri && (
            <div
              data-tauri-drag-region
              className="w-full h-10 bg-white dark:bg-black border-b border-default-100 flex items-center justify-between z-[100] shrink-0 cursor-default"
            />
          )}

          {/* Main Body */}
          <div className="flex w-full flex-1 overflow-hidden relative">
            {/* Sidebar */}
            <div className="z-30 relative h-full shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
              <React.Suspense
                fallback={
                  <div className="w-72 h-full bg-[#F4F4F6] dark:bg-sidebar" />
                }
              >
                <Sidebar />
              </React.Suspense>
            </div>

            {/* Content Area */}
            {isGhostEditorOpen ? (
              /* Side-by-Side: Editor (left) + Content (right), resizable */
              <Group
                key="with-editor"
                className="flex-1 overflow-hidden z-10 relative"
                orientation="horizontal"
              >
                {/* Left: Ghost Editor */}
                <Panel
                  className="h-full flex flex-col bg-[#F4F4F6] dark:bg-background shadow-[inset_6px_0_12px_rgba(0,0,0,0.02)]"
                  defaultSize={40}
                  minSize={20}
                >
                  <GhostEditor />
                </Panel>

                {/* Resize Handle */}
                <Separator className="w-2 md:w-1 mx-[-2px] h-full flex items-center justify-center bg-transparent hover:bg-primary/20 active:bg-primary/50 cursor-col-resize transition-all shrink-0 z-50 group">
                  <div className="w-1 h-8 rounded-full bg-default-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Separator>

                {/* Right: Prompt Swarm / Chat */}
                <Panel
                  className="h-full bg-[#F4F4F6] dark:bg-background border-l border-default-100 flex flex-col"
                  defaultSize={60}
                  minSize={30}
                >
                  <div className="flex-1 w-full flex flex-col overflow-hidden">
                    {children}
                  </div>
                </Panel>
              </Group>
            ) : (
              /* Full-width content — no resizable panel wrapper needed */
              <div className="flex-1 h-full bg-[#F4F4F6] dark:bg-background flex flex-col overflow-hidden z-10 relative shadow-[inset_6px_0_12px_rgba(0,0,0,0.02)]">
                {children}
              </div>
            )}
          </div>
        </div>
      </CopilotSidebar>
    </CopilotKit>
  );
}

export default function ChatBotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
