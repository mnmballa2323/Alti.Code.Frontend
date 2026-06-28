"use client";

import React, { useState, Suspense } from "react";

import ChatBotLayout from "@/components/ChatbotLayout";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";

function FunctionsPageContent() {
  const [promptValue, setPromptValue] = useState("");

  const handleSend = (prompt: string) => {
    // For now, just clear the prompt or handle the action
    setPromptValue("");
  };

  return (
    <ChatBotLayout>
      <div className="flex h-full w-full relative bg-transparent">
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="relative flex flex-1 w-full flex-col items-center justify-start pt-[35vh] overflow-hidden animate-in fade-in duration-300">
            <div className="flex w-full flex-col items-center gap-6 z-20 px-6 max-w-2xl">
              <div className="flex flex-col items-center text-center z-30 mb-6">
                <h1
                  className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80"
                  style={{ fontFamily: "var(--font-secondary)" }}
                >
                  Create New Function
                </h1>
              </div>

              <div className="flex w-full flex-col gap-4 max-w-2xl">
                <PromptInputFullLineWithBottomActions
                  hideAgents={true}
                  hideDropdown={true}
                  placeholder="e.g. Format Stripe webhooks and extract the customer email..."
                  prompt={promptValue}
                  setPrompt={setPromptValue}
                  onSend={handleSend}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}

export default function FunctionsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full bg-transparent" />
      }
    >
      <FunctionsPageContent />
    </Suspense>
  );
}
