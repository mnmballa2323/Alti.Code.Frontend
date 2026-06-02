"use client";

import React from "react";
import { Button } from "@heroui/button";
import ChatBotLayout from "@/components/ChatbotLayout";

export default function CortexPage() {
  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-7xl h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <Button
          className="bg-black dark:bg-white text-white dark:text-black font-semibold shadow-lg rounded-full px-8 py-6 text-sm"
          onPress={() => window.dispatchEvent(new CustomEvent("open-knowledge-modal"))}
        >
          Create Knowledge Folder
        </Button>
      </div>
    </ChatBotLayout>
  );
}
