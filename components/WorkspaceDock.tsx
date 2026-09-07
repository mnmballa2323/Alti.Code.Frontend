"use client";

import type { RootState } from "@/store";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { Plus, ExternalLink, X } from "lucide-react";
import { Tooltip, Button, Modal, ModalContent } from "@heroui/react";

import { cn } from "@/lib/utils";
import {
  addTab,
  removeTab,
  setActiveTab,
  setActiveWorkspaceTab,
  WorkspaceTab,
} from "@/store/tabsSlice";
import { setActiveWorkspace } from "@/store/systemSlice";
import { setActiveProject } from "@/lib/project";

export function WorkspaceDock() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const [activeModeOverride, setActiveModeOverride] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    setActiveModeOverride(null);
  }, [pathname]);

  React.useEffect(() => {
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent;

      if (customEvent.detail) {
        setActiveModeOverride(customEvent.detail);
      }
    };

    window.addEventListener("inso-mode-change", handleModeChange);

    return () => {
      window.removeEventListener("inso-mode-change", handleModeChange);
    };
  }, []);

  const currentMode = (activeModeOverride ||
    (pathname?.startsWith("/chat")
      ? "chat"
      : pathname?.startsWith("/create")
        ? "create"
        : pathname?.startsWith("/cowork")
          ? "cowork"
          : "code")) as "chat" | "code" | "create" | "cowork";

  const isDockExpanded = false;
  const handleToggleDockClick = () => {};
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [tabToRemove, setTabToRemove] = React.useState<string | null>(null);
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = React.useState(false);
  const [newSpaceName, setNewSpaceName] = React.useState("");

  const { tabs, activeTabIds, activeWorkspaceId } = useSelector(
    (state: RootState) => state.tabs,
  );
  const activeWorkspace = useSelector(
    (state: RootState) => state.system.activeWorkspace,
  );
  const activeTabId =
    activeWorkspaceId ||
    activeTabIds[currentMode] ||
    activeTabIds.code ||
    (tabs.length > 0 ? tabs[0].id : null);

  const getInitials = (title: string) => {
    if (!title) return "";
    const parts = title.split(/[.\-_\s]+/);

    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return title.substring(0, 2).toUpperCase();
  };

  const handleWorkspaceClick = (tab: WorkspaceTab) => {
    dispatch(setActiveWorkspaceTab(tab.id));
    dispatch(setActiveTab({ id: tab.id, mode: currentMode }));
    dispatch(setActiveWorkspace(tab.projectPath));
    setActiveProject({ id: tab.projectPath, name: tab.title });
  };

  const handleHomeClick = () => {
    dispatch(setActiveTab({ id: null, mode: currentMode }));
    dispatch(setActiveWorkspace(""));
    setActiveProject({ id: "", name: "" });
    if (currentMode === "create") {
      router.push("/create");
    } else if (currentMode === "cowork") {
      router.push("/cowork");
    } else if (currentMode === "chat") {
      router.push("/chat");
    } else {
      router.push("/code");
    }
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
    if (currentMode === "chat" || currentMode === "create") {
      setIsCreateSpaceOpen(true);
    } else {
      window.dispatchEvent(new CustomEvent("open-workspace-selector"));
    }
  };

  const handleDetachWorkspace = async (
    e: React.MouseEvent,
    tab: WorkspaceTab,
  ) => {
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
    <div
      className={cn(
        "dark h-screen max-h-screen overflow-hidden bg-black border-r border-white/10 flex flex-col select-none shrink-0 z-[120] relative transition-all duration-300 ease-in-out",
        isDockExpanded ? "w-64 min-w-[256px]" : "w-[88px] min-w-[88px]",
      )}
    >
      {/* Top Header Spacer (52px) to align with Sidebar header */}
      <div className="h-[52px] w-full flex-none select-none" />

      {/* Scrollable Workspaces List */}
      <div
        className={cn(
          "flex-1 w-full flex flex-col gap-2.5 overflow-y-auto scrollbar-none pt-3",
          isDockExpanded ? "px-3" : "items-center px-2",
        )}
      >
        {isDockExpanded ? (
          <div
            className={cn(
              "group relative flex items-center justify-between w-full h-11 px-3 rounded-xl transition-all duration-200 select-none cursor-pointer border border-[#0000ff]",
              !activeTabId
                ? "bg-[#0000ff]/30 text-white shadow-[0_0_22px_rgba(0,0,255,0.9)] border-2 border-[#0000ff] font-bold"
                : "bg-[#0000ff]/10 text-blue-300 shadow-[0_0_10px_rgba(0,0,255,0.4)] hover:text-white hover:bg-[#0000ff]/25",
            )}
            onClick={handleHomeClick}
          >
            {!activeTabId && (
              <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#0000ff] shadow-[0_0_10px_rgba(0,0,255,0.8)] rounded-r-md" />
            )}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                  !activeTabId
                    ? "bg-white/20 text-white"
                    : "bg-[#0000ff]/20 text-blue-300 group-hover:text-white",
                )}
              >
                <img
                  alt="Alti Code Studio"
                  className="w-4 h-4 invert opacity-90"
                  src="/neutral-workspace.png"
                />
              </div>
              <span
                className={cn(
                  "text-xs font-medium truncate max-w-[120px] transition-colors",
                  !activeTabId
                    ? "text-white font-semibold"
                    : "text-blue-200 group-hover:text-white",
                )}
              >
                Alti Code Studio
              </span>
            </div>
          </div>
        ) : (
          <div
            className="group relative flex items-center justify-center w-11 h-11 select-none cursor-pointer"
            onClick={handleHomeClick}
          >
            {!activeTabId && (
              <div className="absolute left-[-8px] w-1 h-7 bg-[#0000ff] shadow-[0_0_10px_rgba(0,0,255,0.8)] rounded-r-md transition-all duration-300" />
            )}
            <div
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 relative border border-[#0000ff]",
                !activeTabId
                  ? "bg-[#0000ff]/30 text-white shadow-[0_0_22px_rgba(0,0,255,0.9)] border-2 border-[#0000ff]"
                  : "bg-[#0000ff]/10 text-blue-300 shadow-[0_0_10px_rgba(0,0,255,0.4)] hover:text-white hover:bg-[#0000ff]/25",
              )}
            >
              <img
                alt="Alti Code Studio"
                className="w-5 h-5 invert opacity-90"
                src="/neutral-workspace.png"
              />
            </div>
          </div>
        )}

        {tabs.map((tab) => {
          const isActive =
            tab.id === activeTabId ||
            (activeWorkspace && tab.projectPath === activeWorkspace);
          const initials = getInitials(tab.title);

          if (isDockExpanded) {
            return (
              <div
                key={tab.id}
                className={cn(
                  "group relative flex items-center justify-between w-full h-11 px-3 rounded-xl cursor-pointer transition-all duration-200 border border-[#0000ff]",
                  isActive
                    ? "bg-[#0000ff]/30 text-white shadow-[0_0_22px_rgba(0,0,255,0.9)] border-2 border-[#0000ff] font-bold"
                    : "bg-[#0000ff]/10 text-blue-300 shadow-[0_0_10px_rgba(0,0,255,0.4)] hover:text-white hover:bg-[#0000ff]/25",
                )}
                onClick={() => handleWorkspaceClick(tab)}
              >
                {/* Left active line */}
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#0000ff] shadow-[0_0_10px_rgba(0,0,255,0.8)] rounded-r-md" />
                )}

                <div className="flex items-center gap-3 min-w-0">
                  {/* Workspace Initial Box */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold tracking-wider shrink-0 transition-all",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#0000ff]/20 text-blue-300 group-hover:text-white",
                    )}
                  >
                    {initials}
                  </div>

                  {/* Text Label */}
                  <span
                    className={cn(
                      "text-xs font-medium truncate max-w-[120px] transition-colors",
                      isActive
                        ? "text-white"
                        : "text-blue-200 group-hover:text-white",
                    )}
                  >
                    {tab.title}
                  </span>
                </div>

                {/* Close/Detach workspace buttons showing on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 pl-1">
                  <Tooltip
                    classNames={{
                      content:
                        "bg-white text-zinc-900 border border-zinc-200 px-2 py-1 text-[9px] rounded-md shadow-lg font-medium",
                    }}
                    closeDelay={0}
                    content="Detach Window"
                    delay={300}
                    placement="top"
                  >
                    <Button
                      isIconOnly
                      className="w-5 h-5 min-w-[20px] bg-transparent hover:bg-white/10 text-gray-400 hover:text-white rounded-md flex items-center justify-center transition-colors"
                      size="sm"
                      onClick={(e) => handleDetachWorkspace(e, tab)}
                    >
                      <ExternalLink className="size-3" />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    classNames={{
                      content:
                        "bg-white text-zinc-900 border border-zinc-200 px-2 py-1 text-[9px] rounded-md shadow-lg font-medium",
                    }}
                    closeDelay={0}
                    content="Remove Workspace"
                    delay={300}
                    placement="top"
                  >
                    <Button
                      isIconOnly
                      className="w-5 h-5 min-w-[20px] bg-transparent hover:bg-white/10 text-gray-400 hover:text-white rounded-md flex items-center justify-center transition-colors"
                      size="sm"
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
              classNames={{
                content:
                  "bg-white text-zinc-900 border border-zinc-200 px-3 py-1.5 text-xs rounded-lg shadow-xl font-medium tracking-wide",
              }}
              closeDelay={0}
              content={tab.title}
              delay={300}
              placement="right"
            >
              <div
                className="group relative flex items-center justify-center w-11 h-11 cursor-pointer"
                onClick={() => handleWorkspaceClick(tab)}
              >
                {/* Left Active Indicator Bar (Blue pill) */}
                {isActive && (
                  <div className="absolute left-[-8px] w-1 h-7 bg-[#0000ff] shadow-[0_0_10px_rgba(0,0,255,0.8)] rounded-r-md transition-all duration-300 z-10" />
                )}

                {/* Workspace Icon / Initial square glowing #0000ff */}
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center text-xs font-semibold tracking-wider transition-all duration-200 relative border border-[#0000ff]",
                    isActive
                      ? "bg-[#0000ff]/30 text-white shadow-[0_0_22px_rgba(0,0,255,0.9)] border-2 border-[#0000ff] font-bold"
                      : "bg-[#0000ff]/10 text-blue-300 shadow-[0_0_10px_rgba(0,0,255,0.4)] hover:text-white hover:bg-[#0000ff]/25",
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
      <div
        className={cn(
          "mt-auto border-t border-default-200 w-full flex flex-col justify-center flex-none",
          isDockExpanded ? "px-3" : "items-center",
        )}
        style={{ height: "76px", minHeight: "76px", maxHeight: "76px" }}
      >
        {isDockExpanded ? (
          <Button
            className="w-full h-9 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg flex items-center justify-center gap-2 transition-all text-xs font-semibold shadow-sm"
            radius="lg"
            variant="flat"
            onClick={handleAddNewWorkspace}
          >
            <Plus className="size-3.5 text-zinc-950" />
            <span>Connect Workspace</span>
          </Button>
        ) : (
          <Tooltip
            classNames={{
              content:
                "bg-white text-zinc-900 border border-zinc-200 px-3 py-1.5 text-xs rounded-lg shadow-xl font-medium tracking-wide",
            }}
            closeDelay={0}
            content="New Project"
            delay={300}
            placement="right"
          >
            <Button
              isIconOnly
              className="w-9 h-9 min-w-[36px] bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg flex items-center justify-center transition-all shadow-sm"
              radius="lg"
              size="sm"
              variant="flat"
              onClick={handleAddNewWorkspace}
            >
              <Plus className="size-4 text-zinc-950 font-bold" />
            </Button>
          </Tooltip>
        )}
      </div>

      <Modal
        hideCloseButton
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "bg-white text-black max-w-[280px] rounded-2xl overflow-hidden shadow-2xl border border-zinc-100",
        }}
        isOpen={isConfirmOpen}
        placement="center"
        onOpenChange={setIsConfirmOpen}
      >
        <ModalContent>
          {(onClose) => (
            <div className="flex flex-col items-center pt-5 text-center">
              <h3 className="text-[15px] font-bold text-zinc-950 px-4">
                Remove Workspace
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 px-5 pb-5 leading-relaxed">
                Are you sure you want to remove this workspace?
              </p>

              {/* Divider */}
              <div className="w-full border-t border-zinc-150" />

              {/* Actions Grid */}
              <div className="flex w-full h-11">
                <button
                  className="flex-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors border-r border-zinc-150 h-full flex items-center justify-center cursor-pointer"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 text-xs font-bold text-red-600 hover:bg-zinc-50 transition-colors h-full flex items-center justify-center cursor-pointer"
                  onClick={confirmRemoveWorkspace}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>

      <Modal
        hideCloseButton
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "bg-[#EBEBEB] text-black w-[350px] max-w-[350px] rounded-2xl overflow-hidden shadow-2xl",
        }}
        isOpen={isCreateSpaceOpen}
        placement="center"
        onOpenChange={setIsCreateSpaceOpen}
      >
        <ModalContent>
          {(onClose) => (
            <div className="flex flex-col w-full">
              <div className="p-5 pb-4 flex flex-col items-center">
                <h3 className="text-[13px] font-bold text-zinc-900 mb-4 tracking-wide">
                  Create A New Space
                </h3>
                <input
                  className="w-full h-10 px-4 rounded-xl bg-white border-none text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200/50 text-black placeholder:text-gray-400 font-medium"
                  placeholder="Enter Space Name"
                  type="text"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newSpaceName.trim()) {
                      dispatch(
                        addTab({
                          title: newSpaceName.trim(),
                          mode: currentMode as any,
                          projectPath: "",
                          activeView:
                            currentMode === "chat" ? "/chat" : "/create",
                          chatSessionId: null,
                        }),
                      );
                      onClose();
                      setNewSpaceName("");
                    }
                  }}
                />
              </div>

              <div className="w-full border-t border-gray-300" />

              <div className="flex w-full h-11">
                <button
                  className="flex-1 text-[13px] font-semibold text-zinc-700 hover:bg-gray-200/50 transition-colors border-r border-gray-300 h-full flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    onClose();
                    setNewSpaceName("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 text-[13px] font-semibold text-zinc-700 hover:bg-gray-200/50 transition-colors h-full flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    if (newSpaceName.trim()) {
                      dispatch(
                        addTab({
                          title: newSpaceName.trim(),
                          mode: currentMode as any,
                          projectPath: "",
                          activeView:
                            currentMode === "chat" ? "/chat" : "/create",
                          chatSessionId: null,
                        }),
                      );
                      onClose();
                      setNewSpaceName("");
                    }
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
