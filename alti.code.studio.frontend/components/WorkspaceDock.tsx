"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Plus, ExternalLink, X, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RootState } from "@/store";
import {
  removeTab,
  setActiveTab,
  WorkspaceTab,
} from "@/store/tabsSlice";
import { setActiveWorkspace } from "@/store/systemSlice";
import { setActiveProject } from "@/lib/project";
import { Tooltip, Button } from "@heroui/react";

export function WorkspaceDock() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { tabs, activeTabId } = useSelector((state: RootState) => state.tabs);

  const getInitials = (title: string) => {
    if (!title) return "";
    const parts = title.split(/[.\-_\s]+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return title.substring(0, 2).toUpperCase();
  };

  const handleWorkspaceClick = (tab: WorkspaceTab) => {
    dispatch(setActiveTab(tab.id));
    dispatch(setActiveWorkspace(tab.projectPath));
    setActiveProject({ id: tab.projectPath, name: tab.title });
    router.push(tab.activeView);
  };

  const handleCloseWorkspace = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    dispatch(removeTab(tabId));
  };

  const handleAddNewWorkspace = () => {
    window.dispatchEvent(new CustomEvent("open-workspace-selector"));
  };

  const handleDetachWorkspace = async (e: React.MouseEvent, tab: WorkspaceTab) => {
    e.stopPropagation();
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("spawn_project_window", { slug: tab.projectPath });
      dispatch(removeTab(tab.id));
    } catch (err) {
      console.error("Failed to spawn project window via Tauri:", err);
    }
  };

  return (
    <div className="w-[68px] min-w-[68px] h-full bg-[#070B16] border-r border-white/5 flex flex-col items-center pt-4 select-none shrink-0 z-40">
      {/* Scrollable Workspaces List */}
      <div className="flex-1 w-full flex flex-col items-center gap-3 overflow-y-auto scrollbar-none px-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const initials = getInitials(tab.title);

          return (
            <Tooltip
              key={tab.id}
              content={tab.title}
              placement="right"
              closeDelay={0}
              delay={300}
              classNames={{
                content: "bg-white text-default-900 border border-default-200 px-3 py-1.5 text-xs rounded-lg shadow-xl font-medium tracking-wide",
              }}
            >
              <div
                onClick={() => handleWorkspaceClick(tab)}
                className="group relative flex items-center justify-center w-11 h-11 cursor-pointer"
              >
                {/* Left Active Indicator Bar (Discord style) */}
                {isActive && (
                  <div className="absolute left-[-8px] w-1 h-7 bg-primary rounded-r-md transition-all duration-300" />
                )}

                {/* Workspace Icon / Initial square */}
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center text-xs font-semibold tracking-wider transition-all duration-200 relative",
                    isActive
                      ? "bg-white/10 text-white shadow-sm border border-white/10"
                      : "bg-transparent border border-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:rounded-xl"
                  )}
                >
                  {initials}
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>

      {/* Footer Actions (Plus Button) */}
      <div className="mt-auto border-t border-white/5 w-full flex flex-col items-center justify-center h-[74px] pb-5 pt-0">
        <Tooltip
          content="Open New Project Workspace"
          placement="right"
          closeDelay={0}
          delay={300}
          classNames={{
            content: "bg-white text-default-900 border border-default-200 px-3 py-1.5 text-xs rounded-lg shadow-xl font-medium tracking-wide",
          }}
        >
          <Button
            isIconOnly
            onClick={handleAddNewWorkspace}
            className="w-9 h-9 min-w-[36px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white flex items-center justify-center transition-all"
            size="sm"
            variant="flat"
          >
            <Plus className="size-3.5" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
