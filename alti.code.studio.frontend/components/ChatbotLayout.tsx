"use client";

import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { Code2 } from "lucide-react";
import { Button, cn } from "@heroui/react";
import { Panel, Group, Separator } from "react-resizable-panels";

import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

import { RootState } from "@/store";
import { toggleGhostEditor } from "@/store/uiSlice";
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
  const dispatch = useDispatch();
  const { isGhostEditorOpen } = useSelector((state: RootState) => state.ui);

  // Don't block rendering while session loads — show the layout immediately
  // so the desktop app doesn't appear blank/frozen.

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-white dark:bg-black">
      {/* Title Bar */}
      <div
        data-tauri-drag-region
        className="w-full h-10 bg-white dark:bg-black border-b border-default-100 flex items-center justify-between z-[100] shrink-0 cursor-default"
      >
        <div className="pl-[84px] pointer-events-none">
          <span className="text-[11px] font-bold text-default-400 uppercase tracking-widest opacity-50 select-none">
            Alti Code Studio
          </span>
        </div>

        {/* Ghost Editor Toggle (Developer Mode) */}
        <div className="pr-4 pointer-events-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                isIconOnly
                className={cn(
                  "rounded-lg active:scale-95 transition-all duration-300",
                  isGhostEditorOpen
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-transparent text-default-500 hover:bg-default-100 hover:text-foreground",
                )}
                size="sm"
                variant="flat"
                onClick={() => dispatch(toggleGhostEditor())}
              >
                <Code2
                  className={cn("size-4", isGhostEditorOpen && "text-primary")}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end" side="bottom">
              <p>Toggle Developer Mode</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

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
            direction="horizontal"
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
