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
    <div className="flex w-full flex-col mb-4">
      <Tabs
        aria-label="Connector Options"
        classNames={{
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary",
        }}
        selectedKey={selectedKey}
        variant="underlined"
        onSelectionChange={(key) => router.push(key as string)}
      >
        <Tab
          key="/connect-apps"
          title={
            <div className="flex items-center space-x-2">
              <LayoutGrid className="w-4 h-4" />
              <span>Apps</span>
            </div>
          }
        />
        <Tab
          key="/database"
          title={
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4" />
              <span>Database</span>
            </div>
          }
        />
        <Tab
          key="/cloud"
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
