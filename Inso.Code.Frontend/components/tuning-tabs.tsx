"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Shield,
  Database,
  FolderGit2,
  Webhook,
  Blocks,
  Plug,
} from "lucide-react";
import { useMemo } from "react";

const TABS = [
  { key: "/instructions", icon: BookOpen, label: "Instructions" },
  { key: "/guardrails", icon: Shield, label: "Guardrails" },
  { key: "/knowledge", icon: Database, label: "Data" },
  { key: "/repository", icon: FolderGit2, label: "Repository" },
  { key: "/apis", icon: Webhook, label: "API" },
  { key: "/sdk", icon: Blocks, label: "SDK" },
  { key: "/mcp", icon: Plug, label: "MCP" },
];

export function TuningTabs() {
  const pathname = usePathname();

  const activeKey = useMemo(() => {
    return TABS.some((t) => t.key === pathname) ? pathname : "/instructions";
  }, [pathname]);

  return (
    <nav className="flex flex-nowrap overflow-x-auto scrollbar-hide items-center gap-1 bg-white dark:bg-black border border-default-200 dark:border-default-100 p-1 rounded-lg shadow-sm">
      {TABS.map(({ key, icon: Icon, label }) => {
        const isActive = activeKey === key;

        return (
          <Link
            key={key}
            className={`flex items-center gap-1.5 px-2 h-8 rounded-md text-sm font-medium transition-all duration-150 whitespace-nowrap ${
              isActive
                ? "bg-[#0000ff] text-white border border-[#0000ff]"
                : "bg-transparent border border-transparent text-default-500 hover:text-foreground hover:bg-default-50 dark:hover:bg-default-100/50"
            }`}
            href={key}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
      {/* Spacer to fix browser bug where right padding is lost in scrollable flex containers */}
      <div aria-hidden="true" className="min-w-[4px] w-[4px] h-1 shrink-0" />
    </nav>
  );
}
