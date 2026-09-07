"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Server, Cloud } from "lucide-react";
import { useCallback } from "react";

const TABS = [
  { key: "/connect-apps", icon: LayoutGrid, label: "Apps" },
  { key: "/database", icon: Server, label: "Database" },
  { key: "/cloud", icon: Cloud, label: "Cloud" },
];

export function ConnectorTabs() {
  const router = useRouter();
  const pathname = usePathname();

  // Handle nested paths for database
  const activeKey = pathname?.startsWith("/database") ? "/database" : pathname;

  const handleClick = useCallback(
    (key: string) => {
      if (key !== pathname) router.push(key);
    },
    [router, pathname],
  );

  return (
    <nav className="flex items-center gap-1 bg-white dark:bg-black border border-default-200 dark:border-default-100 p-1 rounded-lg shadow-sm">
      {TABS.map(({ key, icon: Icon, label }) => {
        const isActive = activeKey === key;

        return (
          <button
            key={key}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer select-none ${
              isActive
                ? "bg-[#0000ff] text-white border border-[#0000ff] shadow-sm font-semibold"
                : "bg-transparent border border-transparent text-default-500 hover:text-foreground hover:bg-default-50 dark:hover:bg-default-100/50"
            }`}
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
