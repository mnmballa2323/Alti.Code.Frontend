"use client";

import { useState } from "react";
import { cn, Button, Tooltip, ScrollShadow } from "@heroui/react";
import {
  Search,
  Plus,
  MessageSquare,
  FileText,
  Shield,
  Database,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function AgentRightSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("history");
  
  const searchParams = useSearchParams();
  const agentName = searchParams?.get("name") || "Agent Settings";

  const navigationItems = [
    { id: "history", label: "Chat History", icon: MessageSquare },
    { id: "instructions", label: "Instructions", icon: FileText },
    { id: "guardrails", label: "Guardrails", icon: Shield },
    { id: "data", label: "Data", icon: Database },
  ];

  const filteredNavigationItems = navigationItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className={cn(
        "flex h-full flex-col transition-all duration-300 bg-white dark:bg-black border-l border-default-200 shrink-0 z-20",
        isSidebarOpen ? "w-64" : "w-10",
      )}
    >
      {/* Top Section - Brand & Toggle */}
      <div
        className={cn(
          "h-[56px] flex items-center justify-between border-b border-default-200 shrink-0",
          isSidebarOpen ? "pl-4 pr-4" : "px-0 justify-center",
        )}
      >
        <Button
          isIconOnly
          className="-ml-2 text-default-400 hover:text-default-600"
          size="sm"
          variant="light"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <PanelRightClose className="size-4" />
          ) : (
            <PanelRightOpen className="size-4" />
          )}
        </Button>
        <div
          className={cn(
            "flex-1 min-w-0 flex items-center justify-end text-sm font-semibold truncate pl-2",
            !isSidebarOpen && "hidden",
          )}
        >
          {agentName}
        </div>
      </div>

      {/* Search bar and + icon */}
      <div
        className={cn(
          "px-3 py-3 flex items-center gap-2 border-b border-default-200",
          !isSidebarOpen && "hidden",
        )}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-default-400" />
          <input
            className="w-full bg-[#F4F4F6] dark:bg-default-100 border border-default-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tooltip
          showArrow
          classNames={{
            content: "bg-black text-white px-2 py-1 text-xs rounded-md shadow-lg",
          }}
          closeDelay={0}
          content="New"
          delay={0}
          placement="top"
        >
          <Button
            isIconOnly
            className="bg-[#F4F4F6] dark:bg-default-100 border border-default-200 rounded-lg text-default-600 flex-shrink-0"
            size="sm"
            variant="flat"
          >
            <Plus className="size-3.5" />
          </Button>
        </Tooltip>
      </div>

      {/* Navigation icons toggle container */}
      <div
        className={cn(
          "border-b border-default-200",
          isSidebarOpen ? "px-3 py-2" : "py-2 px-1",
        )}
      >
        <div
          className={cn(
            "bg-[#F4F4F6] dark:bg-default-50 rounded-xl p-1",
            isSidebarOpen
              ? "grid grid-cols-4 gap-0.5"
              : "flex flex-col items-center gap-2",
          )}
        >
          {filteredNavigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Tooltip
                key={item.label}
                showArrow
                classNames={{
                  content: "bg-black text-white px-2 py-1 text-xs rounded-md shadow-lg",
                }}
                closeDelay={0}
                content={item.label}
                delay={0}
                placement={isSidebarOpen ? "top" : "left"}
              >
                <Button
                  isIconOnly
                  className={cn(
                    "flex items-center justify-center transition-all duration-200 relative group min-w-0 min-h-0",
                    isSidebarOpen
                      ? "h-[30px] w-full rounded-md"
                      : "h-[30px] w-[30px] rounded-md",
                    isActive
                      ? "bg-white dark:bg-default-100 border border-default-200 text-default-900 dark:text-white shadow-sm"
                      : "bg-transparent border-transparent text-default-400 hover:text-default-700 dark:hover:text-default-200",
                  )}
                  onClick={() => setActiveTab(item.id)}
                >
                  <IconComponent className="size-3.5" />
                  <span className="sr-only">{item.label}</span>
                </Button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {!isSidebarOpen && <div className="flex-1" />}

      {/* Content Area */}
      {isSidebarOpen && (
        <ScrollShadow
          hideScrollBar
          className="flex-1 px-2 mt-1 min-h-0 w-full scrollbar-hide overflow-y-auto"
        >
          <div className="flex flex-col items-center justify-center py-12 text-center w-full opacity-60">
            <span className="text-xs text-default-400">
              No items found.
            </span>
          </div>
        </ScrollShadow>
      )}
    </div>
  );
}
