"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { Panel, Group, Separator } from "react-resizable-panels";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Search } from "lucide-react";
import { Icon } from "@iconify/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";

import { RootState } from "@/store";
import Sidebar from "@/components/sidebar";
import GhostEditor from "@/components/ghost-editor";

/**
 * Alti Code Studio — Industrial Side-by-Side Layout.
 * Editor (left) + Prompt Swarm (right), resizable via CSS.
 */
export default function ChatBotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken ?? null;
  const dispatch = useDispatch();
  const { isGhostEditorOpen } = useSelector((state: RootState) => state.ui);

  const [repoSearch, setRepoSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("alti.code.studio");
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).__TAURI_INTERNALS__ !== undefined
    ) {
      setIsTauri(true);
    }
  }, []);

  const { data: repos = [], isFetching: isRepoLoading } = useQuery({
    queryKey: ["repos-top", token, repoSearch],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/git/repositories?q=${repoSearch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();

      return data.success ? data.data : [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Don't block rendering while session loads — show the layout immediately
  // so the desktop app doesn't appear blank/frozen.

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-white dark:bg-black">
      {/* Title Bar */}
      {isTauri && (
        <div
          data-tauri-drag-region
          className="w-full h-10 bg-white dark:bg-black border-b border-default-100 flex items-center justify-between z-[100] shrink-0 cursor-default"
        >
          <div className="pointer-events-auto flex items-center h-full pl-[84px]">
            <Dropdown
              className="w-[240px] min-w-[240px] bg-white dark:bg-default-50 border border-default-200 shadow-lg rounded-2xl p-1 z-[150]"
              placement="bottom-start"
            >
              <DropdownTrigger>
                <div className="relative">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-default-100 dark:hover:bg-default-200/50 transition-all border-none cursor-pointer bg-transparent text-default-600 hover:text-default-900 select-none">
                    <Icon
                      className="size-3.5 text-default-400 shrink-0"
                      icon="solar:folder-2-linear"
                    />
                    <span className="text-[12px] font-semibold tracking-tight">
                      {selectedRepo}
                    </span>
                    <ChevronDown className="size-3 text-default-400 shrink-0" />
                  </div>
                </div>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Select Workspace"
                className="p-2"
                disabledKeys={isRepoLoading ? ["searching"] : []}
              >
                <DropdownItem
                  key="search-section"
                  isReadOnly
                  className="cursor-default hover:bg-transparent p-0 mb-2"
                >
                  <div className="px-2 py-1 relative">
                    <input
                      autoFocus
                      className="w-full bg-default-100 border border-default-200 rounded-lg px-8 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground"
                      placeholder="Search repositories..."
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-default-400" />
                    {isRepoLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </DropdownItem>

                <DropdownItem
                  key="current-header"
                  isReadOnly
                  className="text-[10px] font-bold text-default-400 uppercase tracking-widest px-2 mb-1"
                >
                  Available Repositories
                </DropdownItem>

                {repos.map((repo: any) => (
                  <DropdownItem
                    key={repo.fullName}
                    className="rounded-lg h-10 px-2 hover:bg-primary/5 transition-colors"
                    description={repo.private ? "Private" : "Public"}
                    startContent={
                      <div className="p-1.5 rounded-md bg-default-100 text-default-500">
                        <Icon
                          className="size-3.5"
                          icon="solar:folder-2-linear"
                        />
                      </div>
                    }
                    onClick={() => setSelectedRepo(repo.name)}
                  >
                    <span className="text-xs font-medium text-default-700">
                      {repo.name}
                    </span>
                  </DropdownItem>
                ))}

                {repos.length === 0 && !isRepoLoading && (
                  <DropdownItem
                    key="no-repos"
                    isReadOnly
                    className="text-center py-4 text-xs text-default-400 italic"
                  >
                    No repositories found
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="flex w-full flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div className="z-50 relative h-full shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <Sidebar />
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
              className="h-full flex flex-col bg-white dark:bg-black"
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
              className="h-full bg-white dark:bg-black border-l border-default-100 flex flex-col"
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
          <div className="flex-1 h-full bg-white dark:bg-black flex flex-col overflow-hidden z-10 relative">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
