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
    <nav className="flex flex-wrap items-center gap-1 bg-default-100 dark:bg-default-50 p-1 rounded-lg shadow-inner">
      {TABS.map(({ key, icon: Icon, label }) => {
        const isActive = activeKey === key;

        return (
          <Link
            key={key}
            className={[
              "flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium transition-all duration-150 whitespace-nowrap",
              isActive
                ? "bg-white dark:bg-default-200 text-foreground shadow-sm"
                : "bg-transparent text-default-500 hover:text-foreground hover:bg-white/50 dark:hover:bg-default-200/50",
            ].join(" ")}
            href={key}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
