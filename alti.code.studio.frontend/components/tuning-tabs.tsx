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
          tabList: "gap-6 relative rounded-none p-0 border-b-0",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-14",
          tabContent: "group-data-[selected=true]:text-primary",
        }}
        selectedKey={pathname}
        variant="underlined"
        onSelectionChange={(key) => router.push(key as string)}
      >
        <Tab
          key="/instructions"
          title={
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Instructions</span>
            </div>
          }
        />
        <Tab
          key="/guardrails"
          title={
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Guardrails</span>
            </div>
          }
        />
        <Tab
          key="/knowledge"
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
