"use client";

import { Tabs, Tab } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Shield, Database, FolderGit2, Webhook, Blocks, Plug } from "lucide-react";
import { Key, useCallback, useMemo } from "react";

const TAB_KEYS = ["/instructions", "/guardrails", "/knowledge", "/repository", "/apis", "/sdk", "/mcp"];

export function TuningTabs() {
  const router = useRouter();
  const pathname = usePathname();

  // Only set selectedKey if pathname matches a valid tab
  const activeKey = useMemo(() => {
    return TAB_KEYS.includes(pathname) ? pathname : "/instructions";
  }, [pathname]);

  const handleSelectionChange = useCallback(
    (key: Key) => {
      const route = key as string;
      if (route && route !== pathname) {
        router.push(route);
      }
    },
    [router, pathname],
  );

  return (
    <div className="flex w-full items-center justify-center h-full">
      <style dangerouslySetInnerHTML={{__html: `
        [data-slot="prev-button"],
        [data-slot="next-button"],
        button[aria-label="Previous tabs"],
        button[aria-label="Next tabs"],
        [data-slot="base"] > button:not([role="tab"]),
        .nextui-tabs-container > button:not([role="tab"]),
        div[class*="tabs"] > button:not([role="tab"]) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          width: 0 !important;
          height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          border: none !important;
        }
      `}} />
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
        selectedKey={activeKey}
        onSelectionChange={handleSelectionChange}
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
        <Tab
          key="/repository"
          title={
            <div className="flex items-center space-x-2">
              <FolderGit2 className="w-4 h-4" />
              <span>Repository</span>
            </div>
          }
        />
        <Tab
          key="/apis"
          title={
            <div className="flex items-center space-x-2">
              <Webhook className="w-4 h-4" />
              <span>API</span>
            </div>
          }
        />
        <Tab
          key="/sdk"
          title={
            <div className="flex items-center space-x-2">
              <Blocks className="w-4 h-4" />
              <span>SDK</span>
            </div>
          }
        />
        <Tab
          key="/mcp"
          title={
            <div className="flex items-center space-x-2">
              <Plug className="w-4 h-4" />
              <span>MCP</span>
            </div>
          }
        />
      </Tabs>
    </div>
  );
}
