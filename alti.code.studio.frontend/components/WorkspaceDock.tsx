"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Plus, ExternalLink, X, Settings2, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { RootState } from "@/store";
import {
  removeTab,
  setActiveTab,
  WorkspaceTab,
} from "@/store/tabsSlice";
import { setActiveWorkspace } from "@/store/systemSlice";
import { setActiveProject } from "@/lib/project";
import { Tooltip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";

export function WorkspaceDock() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [isDockExpanded, setIsDockExpanded] = React.useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("inso_dock_expanded");
      return stored === "true";
    }
    return false;
  });

  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [tabToRemove, setTabToRemove] = React.useState<string | null>(null);

  const handleToggleDockClick = () => {
    setIsDockExpanded((prev) => {
      const next = !prev;
      localStorage.setItem("inso_dock_expanded", String(next));
      return next;
    });
  };

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
    setTabToRemove(tabId);
    setIsConfirmOpen(true);
  };

  const confirmRemoveWorkspace = () => {
    if (tabToRemove) {
      dispatch(removeTab(tabToRemove));
      setTabToRemove(null);
    }
    setIsConfirmOpen(false);
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
    <div className={cn(
      "dark h-full bg-[#070B16] border-r border-white/5 flex flex-col select-none shrink-0 z-[120] relative transition-all duration-300 ease-in-out",
      isDockExpanded ? "w-64 min-w-[256px]" : "w-[88px] min-w-[88px]"
    )}>
      {/* Top Spacer / Header Area matching Sidebar header heights (40px titlebar + 52px menu + 68px search = 160px) */}
      <div
        onClick={handleToggleDockClick}
        className={cn(
          "h-[160px] w-full border-b border-default-200 flex-none flex items-start relative group transition-colors cursor-pointer hover:bg-white/[0.02] pt-[76px]",
          isDockExpanded ? "px-4 justify-between" : "justify-center"
        )}
      >
        {isDockExpanded ? (
          <>
            <div className="flex items-center gap-2">
              <img
                alt="Inso Logo Icon"
                className="w-5 h-5 object-contain"
                src="/assets/logo-icon-white.png?v=2"
              />
              <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest pl-1">Workspaces</span>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all">
              <PanelLeftClose className="size-4" />
            </div>
          </>
        ) : (
          <div className="relative w-9 h-9 flex items-center justify-center">
            {/* Logo Icon - Visible by default, fades out on hover */}
            <img
              alt="Inso Logo Icon"
              className="w-5 h-5 object-contain opacity-100 group-hover:opacity-0 transition-opacity duration-200"
              src="/assets/logo-icon-white.png?v=2"
            />
            {/* Toggle button - Hidden by default, fades in on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <PanelLeftOpen className="size-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Workspaces List */}
      <div className={cn(
        "flex-1 w-full flex flex-col gap-2.5 overflow-y-auto scrollbar-none pt-4",
        isDockExpanded ? "px-3" : "items-center px-2"
      )}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const initials = getInitials(tab.title);

          if (isDockExpanded) {
            return (
              <div
                key={tab.id}
                onClick={() => handleWorkspaceClick(tab)}
                className={cn(
                  "group relative flex items-center justify-between w-full h-11 px-3 rounded-xl cursor-pointer transition-all duration-200",
                  isActive
                    ? "bg-white/10 border border-white/10"
                    : "hover:bg-white/5 border border-transparent"
                )}
              >
                {/* Left active line */}
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-md" />
                )}
                
                <div className="flex items-center gap-3 min-w-0">
                  {/* Workspace Initial Box */}
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold tracking-wider shrink-0 transition-all",
                    isActive ? "bg-white/15 text-white" : "bg-white/5 text-gray-400 group-hover:text-white"
                  )}>
                    {initials}
                  </div>

                  {/* Text Label */}
                  <span className={cn(
                    "text-xs font-medium truncate max-w-[120px] transition-colors",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                  )}>
                    {tab.title}
                  </span>
                </div>

                {/* Close/Detach workspace buttons showing on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 pl-1">
                  <Tooltip
                    content="Detach Window"
                    placement="top"
                    closeDelay={0}
                    delay={300}
                    classNames={{
                      content: "bg-white text-zinc-900 border border-zinc-200 px-2 py-1 text-[9px] rounded-md shadow-lg font-medium",
                    }}
                  >
                    <Button
                      isIconOnly
                      size="sm"
                      className="w-5 h-5 min-w-[20px] bg-transparent hover:bg-white/10 text-gray-400 hover:text-white rounded-md flex items-center justify-center transition-colors"
                      onClick={(e) => handleDetachWorkspace(e, tab)}
                    >
                      <ExternalLink className="size-3" />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    content="Remove Workspace"
                    placement="top"
                    closeDelay={0}
                    delay={300}
                    classNames={{
                      content: "bg-white text-zinc-900 border border-zinc-200 px-2 py-1 text-[9px] rounded-md shadow-lg font-medium",
                    }}
                  >
                    <Button
                      isIconOnly
                      size="sm"
                      className="w-5 h-5 min-w-[20px] bg-transparent hover:bg-white/10 text-gray-400 hover:text-white rounded-md flex items-center justify-center transition-colors"
                      onClick={(e) => handleCloseWorkspace(e, tab.id)}
                    >
                      <X className="size-3" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            );
          }

          // Collapsed (original square block)
          return (
            <Tooltip
              key={tab.id}
              content={tab.title}
              placement="right"
              closeDelay={0}
              delay={300}
              classNames={{
                content: "bg-white text-zinc-900 border border-zinc-200 px-3 py-1.5 text-xs rounded-lg shadow-xl font-medium tracking-wide",
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
      <div className={cn(
        "mt-auto border-t border-default-200 w-full flex flex-col justify-center h-[73px]",
        isDockExpanded ? "px-3" : "items-center"
      )}>
        {isDockExpanded ? (
          <Button
            onClick={handleAddNewWorkspace}
            className="w-full h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-white flex items-center justify-center gap-2 transition-all text-xs font-semibold"
            variant="flat"
          >
            <Plus className="size-3.5" />
            <span>Connect Workspace</span>
          </Button>
        ) : (
          <Tooltip
            content="Open New Project Workspace"
            placement="right"
            closeDelay={0}
            delay={300}
            classNames={{
              content: "bg-white text-zinc-900 border border-zinc-200 px-3 py-1.5 text-xs rounded-lg shadow-xl font-medium tracking-wide",
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
        )}
      </div>

      <Modal
        hideCloseButton
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        placement="center"
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "bg-white text-black max-w-[280px] rounded-2xl overflow-hidden shadow-2xl border border-zinc-100",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <div className="flex flex-col items-center pt-5 text-center">
              <h3 className="text-[15px] font-bold text-zinc-950 px-4">Remove Workspace</h3>
              <p className="text-xs text-zinc-500 mt-1.5 px-5 pb-5 leading-relaxed">
                Are you sure you want to remove this workspace?
              </p>
              
              {/* Divider */}
              <div className="w-full border-t border-zinc-150" />
              
              {/* Actions Grid */}
              <div className="flex w-full h-11">
                <button
                  onClick={onClose}
                  className="flex-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors border-r border-zinc-150 h-full flex items-center justify-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveWorkspace}
                  className="flex-1 text-xs font-bold text-red-600 hover:bg-zinc-50 transition-colors h-full flex items-center justify-center cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
