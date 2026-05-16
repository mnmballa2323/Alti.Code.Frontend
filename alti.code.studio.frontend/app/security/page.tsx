"use client";

import React from "react";
import { Lock, ShieldAlert } from "lucide-react";
import ChatBotLayout from "@/components/ChatbotLayout";

export default function SecurityPage() {
  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-white dark:bg-background flex flex-col h-full font-sans w-full">
        {/* Standardized Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-50 relative w-full">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-5 text-primary" />
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900">
                Zero-Trust Security & DLP
              </h1>
            </div>

          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-default-50/50">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Lock className="size-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-default-900">
                Security Operations Center
              </h2>
              <p className="text-default-500 max-w-md">
                Zero-trust boundary enforced. All AST analysis and vulnerability
                scans are currently restricted to autonomous backend execution loops.
              </p>
            </div>


          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
