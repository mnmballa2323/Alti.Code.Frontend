"use client";

import { cn } from "@/lib/utils";

export type ChatSubTab = "chat" | "search" | "research";

interface ChatSubToggleBarProps {
  activeTab: ChatSubTab;
  onTabChange: (tab: ChatSubTab) => void;
}

export default function ChatSubToggleBar({
  activeTab,
  onTabChange,
}: ChatSubToggleBarProps) {
  const tabs = [
    {
      id: "chat" as const,
      label: "Chat",
    },
    {
      id: "search" as const,
      label: "Search",
    },
    {
      id: "research" as const,
      label: "Research",
    },
  ];

  return (
    <div className="flex items-center justify-between bg-[#08080a] border border-[#1c1c22] shadow-[inset_0_0_8px_rgba(0,0,255,0.15)] rounded-xl p-1 w-full gap-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            className={cn(
              "flex items-center justify-center transition-all duration-200 h-[26px] flex-1 rounded-lg text-[11px] font-semibold cursor-pointer select-none border border-transparent",
              isActive
                ? "bg-[#0000ff]/30 text-white border-[#0000ff] shadow-[0_0_10px_rgba(0,0,255,0.6)] font-bold"
                : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
            )}
            type="button"
            onClick={() => onTabChange(tab.id)}
          >
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
