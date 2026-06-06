"use client";

import React from "react";
import ChatBotLayout from "@/components/ChatbotLayout";
import { Database } from "lucide-react";

export default function DatabasePage() {
  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-y-auto bg-default-50 dark:bg-[#0A0A0A] p-8 font-sans scrollbar-hide">
        <div className="flex flex-col items-center justify-start min-h-full w-full py-6">
          <div className="w-full max-w-4xl text-left bg-white dark:bg-[#111111] p-8 rounded-3xl border border-default-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto">
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-default-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                    Database Connectors
                  </h1>
                  <p className="text-sm text-default-500 mt-1">
                    Connect and manage your database resources using Google MCP Toolbox.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center py-12 text-default-500">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Database connection interface is under construction.</p>
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
