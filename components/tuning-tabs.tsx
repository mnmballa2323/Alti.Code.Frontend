"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Shield, Database } from "lucide-react";
import { useMemo } from "react";

const TABS = [
  { key: "/instructions", icon: BookOpen, label: "Instructions" },
  { key: "/guardrails", icon: Shield, label: "Guardrails" },
  { key: "/knowledge", icon: Database, label: "Knowledge" },
];

export function TuningTabs() {
  const pathname = usePathname();

  const activeKey = useMemo(() => {
    if (pathname === "/guardrails" || pathname?.startsWith("/guardrails/")) {
      return "/guardrails";
    }
    if (pathname === "/knowledge" || pathname?.startsWith("/knowledge/")) {
      return "/knowledge";
    }

    return "/instructions";
  }, [pathname]);

  return (
    <nav
      className="flex flex-nowrap overflow-x-auto scrollbar-hide items-center gap-1 bg-white dark:bg-black border border-default-200 dark:border-default-100 p-1 rounded-lg shadow-sm relative"
      style={{ zIndex: 9999, pointerEvents: "auto" }}
    >
      {TABS.map(({ key, icon: Icon, label }) => {
        const isActive = activeKey === key;

        return (
          <Link
            key={key}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer select-none ${
              isActive
                ? "bg-[#0000ff] text-white border border-[#0000ff] shadow-sm font-semibold"
                : "bg-transparent border border-transparent text-default-500 hover:text-foreground hover:bg-default-50 dark:hover:bg-default-100/50"
            }`}
            href={key}
            style={{
              pointerEvents: "auto",
              position: "relative",
              zIndex: 9999,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
      <div aria-hidden="true" className="min-w-[4px] w-[4px] h-1 shrink-0" />
    </nav>
  );
}
