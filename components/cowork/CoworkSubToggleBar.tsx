"use client";

import { Activity, Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

export type CoworkSubTab = "tasks" | "inbox";

interface CoworkSubToggleBarProps {
  activeTab: CoworkSubTab;
  onTabChange: (tab: CoworkSubTab) => void;
  ongoingCount?: number;
  inboxCount?: number;
}

export default function CoworkSubToggleBar({
  activeTab,
  onTabChange,
  ongoingCount = 2,
  inboxCount = 3,
}: CoworkSubToggleBarProps) {
  const tabs = [
    {
      id: "tasks" as const,
      label: "Tasks",
      icon: Activity,
      badge: ongoingCount > 0 ? ongoingCount : undefined,
    },
    {
      id: "inbox" as const,
      label: "Inbox",
      icon: Inbox,
      badge: inboxCount > 0 ? inboxCount : undefined,
    },
  ];

  return (
    <div className="flex items-center justify-between bg-[#08080a] border border-[#1c1c22] shadow-[inset_0_0_8px_rgba(0,0,255,0.15)] rounded-xl p-1 w-full gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            className={cn(
              "flex items-center justify-center gap-1.5 transition-all duration-200 h-[26px] flex-1 rounded-lg text-[11px] font-semibold cursor-pointer select-none border border-transparent relative",
              isActive
                ? "bg-[#0000ff]/30 text-white border-[#0000ff] shadow-[0_0_10px_rgba(0,0,255,0.6)] font-bold"
                : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
            )}
            type="button"
            onClick={() => onTabChange(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "ml-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded-full transition-all",
                  isActive
                    ? "bg-[#0000ff] text-white shadow-[0_0_8px_rgba(0,0,255,0.8)]"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/40",
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
