"use client";

import { Tabs, Tab } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Shield, Database } from "lucide-react";

export function TuningTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex w-full items-center h-full">
      <Tabs
        aria-label="Tuning Options"
        classNames={{
          tabList:
            "bg-default-100 dark:bg-default-50 p-1 rounded-lg border-none shadow-inner",
          cursor: "bg-white dark:bg-default-200 shadow-sm rounded-md",
          tab: "h-8 px-4",
          tabContent:
            "group-data-[selected=true]:text-foreground text-default-500 font-medium text-sm",
        }}
        selectedKey={pathname}
      >
        <Tab
          key="/instructions"
          href="/instructions"
          title={
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Instructions</span>
            </div>
          }
        />
        <Tab
          key="/guardrails"
          href="/guardrails"
          title={
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Guardrails</span>
            </div>
          }
        />
        <Tab
          key="/knowledge"
          href="/knowledge"
          title={
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Data</span>
            </div>
          }
        />
      </Tabs>
    </div>
  );
}
