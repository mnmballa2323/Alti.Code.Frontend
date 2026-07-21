"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Panel, Group, Separator } from "react-resizable-panels";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import "@copilotkit/react-ui/styles.css";

import type { RootState } from "@/store";

import Sidebar from "@/components/sidebar";
import GhostEditor from "@/components/ghost-editor";
import { WorkspaceDock } from "@/components/WorkspaceDock";
import { addTab } from "@/store/tabsSlice";
import { setActiveWorkspace } from "@/store/systemSlice";
import { setActiveProject } from "@/lib/project";

/**
 * Persistent layout wrapper for authenticated application routes.
 */
export function PersistentLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isGhostEditorOpen } = useSelector((state: RootState) => state.ui);
  const { data: session } = useSession();
  const pathname = usePathname();
  const isNoSidebarRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/owner") ||
    pathname?.startsWith("/support") ||
    pathname === "/login" ||
    pathname === "/";
  const [isTauri, setIsTauri] = useState(false);
  const [headers, setHeaders] = useState<Record<string, string>>({});

  const { tabs, activeTabId } = useSelector((state: RootState) => state.tabs);
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const workspaceName = activeTab?.title || "local-workspace";

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getPageTitle = () => {
    if (pathname === "/new-chat" || pathname === "/chat") return "Let's Chat";
    if (pathname?.startsWith("/chat/")) return "Chat Session";
    const segment = pathname?.split("/").pop() || "";

    if (!segment) return "Home";

    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };
  const pageTitle = getPageTitle();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const projectParam = searchParams.get("project");

      if (projectParam) {
        dispatch(
          addTab({
            title: projectParam,
            projectPath: projectParam,
            activeView: pathname || "/chat",
            chatSessionId: null,
          }),
        );
        dispatch(setActiveWorkspace(projectParam));
        setActiveProject({ id: projectParam, name: projectParam });
      }
    }
  }, [dispatch, pathname]);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("inso_sidebar_open");

      setIsSidebarOpen(stored === null ? true : stored === "true");
    }

    const handleSidebarState = (e: Event) => {
      const customEvent = e as CustomEvent;

      setIsSidebarOpen(customEvent.detail);
    };

    window.addEventListener("sidebar-state-change", handleSidebarState);

    return () => {
      window.removeEventListener("sidebar-state-change", handleSidebarState);
    };
  }, []);

  const handleToggleSidebar = () => {
    window.dispatchEvent(
      new CustomEvent("toggle-sidebar", { detail: !isSidebarOpen }),
    );
  };

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
        <div className="relative w-full h-screen overflow-hidden bg-background">
          {/* Title Bar */}
          {isTauri && (
            <div className="absolute top-0 left-0 w-full h-10 bg-transparent flex items-center justify-between z-[100] select-none pointer-events-none">
              {/* Left spacer for macOS window traffic light buttons: draggable */}
              <div
                data-tauri-drag-region
                className="w-[76px] h-full shrink-0 pointer-events-auto cursor-default"
              />
              {/* Center spacer where tabs/content are: clickable/pass-through */}
              <div className="flex-grow h-full pointer-events-none" />
              {/* Right spacer for dragging: draggable */}
              <div
                data-tauri-drag-region
                className="w-[60px] h-full shrink-0 pointer-events-auto cursor-default"
              />
            </div>
          )}

          {/* Main Body */}
          <div className="flex w-full h-full overflow-hidden relative">
            {/* Workspace Dock */}
            {!isNoSidebarRoute && <WorkspaceDock />}

            {/* Sidebar */}
            {!isNoSidebarRoute && (
              <div className="z-[110] relative h-full max-h-full overflow-hidden shrink-0">
                <React.Suspense
                  fallback={
                    <div className="w-80 h-full bg-default-100 dark:bg-sidebar" />
                  }
                >
                  <Sidebar />
                </React.Suspense>
              </div>
            )}

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
                  className="h-full flex flex-col bg-default-100 dark:bg-default-50"
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
                  className="h-full bg-default-100 dark:bg-default-50 border-l border-default-100 flex flex-col"
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
              <div className="flex-1 h-full flex flex-col overflow-hidden bg-default-100 dark:bg-default-50 z-10 relative">
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
