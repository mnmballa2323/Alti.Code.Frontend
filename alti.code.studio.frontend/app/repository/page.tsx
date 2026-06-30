"use client";
import React from "react";
import ChatBotLayout from "@/components/ChatbotLayout";
import { TuningTabs } from "@/components/tuning-tabs";
import { FolderGit2 } from "lucide-react";

export default function RepositoryPage() {
  return (
    <ChatBotLayout>
      <div className="flex flex-col h-full bg-default-100 dark:bg-default-50">
        {/* Top Navbar */}
        <div className="flex items-center justify-center relative z-50 w-full h-14 px-8 border-b border-default-100 bg-white dark:bg-[#111111] shrink-0">
          <TuningTabs />
        </div>
        <div className="flex-1 overflow-y-auto p-8 font-sans scrollbar-hide flex flex-col items-center justify-center">
          <div className="flex flex-col items-center text-default-400 gap-4 mb-14">
            <FolderGit2 className="w-12 h-12" />
            <p className="text-sm font-medium">Repository integration coming soon...</p>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
