"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Shield,
  Database,
  FolderGit2,
  Webhook,
  Blocks,
  Plug,
  RefreshCw,
} from "lucide-react";
import { useCallback, useMemo } from "react";

const TABS = [
  { key: "/instructions", icon: BookOpen, label: "Instructions" },
  { key: "/guardrails", icon: Shield, label: "Guardrails" },
  { key: "/knowledge", icon: Database, label: "Data" },
  { key: "/repository", icon: FolderGit2, label: "Repository" },
  { key: "/apis", icon: Webhook, label: "API" },
  { key: "/sdk", icon: Blocks, label: "SDK" },
  { key: "/mcp", icon: Plug, label: "MCP" },
  { key: "/loops", icon: RefreshCw, label: "Loops" },
];

export function TuningTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const activeKey = useMemo(() => {
    return TABS.some((t) => t.key === pathname) ? pathname : "/instructions";
  }, [pathname]);

  const handleClick = useCallback(
    (key: string) => {
      if (key !== pathname) router.push(key);
    },
    [router, pathname],
  );

  return (
    <nav className="flex items-center gap-1 bg-default-100 dark:bg-default-50 p-1 rounded-lg shadow-inner">
      {TABS.map(({ key, icon: Icon, label }) => {
        const isActive = activeKey === key;

        return (
          <button
            key={key}
            className={[
              "flex items-center gap-2 px-4 h-8 rounded-md text-sm font-medium transition-all duration-150 whitespace-nowrap",
              isActive
                ? "bg-white dark:bg-default-200 text-foreground shadow-sm"
                : "bg-transparent text-default-500 hover:text-foreground hover:bg-white/50 dark:hover:bg-default-200/50",
            ].join(" ")}
            onClick={() => handleClick(key)}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
