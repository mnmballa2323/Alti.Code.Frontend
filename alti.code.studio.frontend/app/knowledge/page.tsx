"use client";

import React from "react";
import { Button } from "@heroui/button";
import ChatBotLayout from "@/components/ChatbotLayout";

export default function CortexPage() {
  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-7xl h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <Button
          className="bg-white dark:bg-[#27272a] border border-default-200 text-default-800 dark:text-default-200 hover:bg-default-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-medium shadow-[0_2px_10px_rgba(0,0,0,0.04)] rounded-full px-8 py-6 text-sm"
          onPress={() => window.dispatchEvent(new CustomEvent("open-knowledge-modal"))}
        >
          Create Knowledge Folder
        </Button>
      </div>
    </ChatBotLayout>
  );
}
