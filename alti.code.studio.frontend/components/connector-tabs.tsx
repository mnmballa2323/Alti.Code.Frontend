"use client";

import { Tabs, Tab } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Server, Cloud } from "lucide-react";

export function ConnectorTabs() {
  const router = useRouter();
  const pathname = usePathname();

  // Handle nested paths for database
  const selectedKey = pathname?.startsWith("/database")
    ? "/database"
    : pathname;

  return (
    <div className="flex w-full items-center justify-center h-full">
      <Tabs
        aria-label="Connector Options"
        classNames={{
          tabList:
            "bg-default-100 dark:bg-default-50 p-1 rounded-lg border-none shadow-inner",
          cursor: "bg-white dark:bg-default-200 shadow-sm rounded-md",
          tab: "h-8 px-4",
          tabContent:
            "group-data-[selected=true]:text-foreground text-default-500 font-medium text-sm",
        }}
        selectedKey={selectedKey}
      >
        <Tab
          key="/connect-apps"
          href="/connect-apps"
          title={
            <div className="flex items-center space-x-2">
              <LayoutGrid className="w-4 h-4" />
              <span>Apps</span>
            </div>
          }
        />
        <Tab
          key="/database"
          href="/database"
          title={
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4" />
              <span>Database</span>
            </div>
          }
        />
        <Tab
          key="/cloud"
          href="/cloud"
          title={
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4" />
              <span>Cloud</span>
            </div>
          }
        />
      </Tabs>
    </div>
  );
}
