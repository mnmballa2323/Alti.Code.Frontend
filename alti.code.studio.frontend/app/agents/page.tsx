"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ChatBotLayout from "@/components/ChatbotLayout";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import { AppDispatch, RootState } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";

export default function AgentArcadePage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session } = useSession();
  const [inputValue, setInputValue] = useState("");

  const handleSend = (prompt: string) => {
    window.dispatchEvent(
      new CustomEvent("open-agent-modal", { detail: prompt })
    );
    setInputValue("");
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-transparent flex flex-col h-full font-sans w-full">
        <div className="relative flex flex-1 w-full flex-col items-center justify-center overflow-hidden">
          <div className="flex w-full flex-col items-center gap-6 z-20 px-6 mt-[-5vh]">
            <div className="flex flex-col items-center text-center z-30 mb-6">
              <h1
                className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80"
                style={{ fontFamily: "var(--font-secondary)" }}
              >
                New Agent
              </h1>
            </div>

            <div className="flex w-full flex-col gap-4 max-w-2xl">
              <PromptInputFullLineWithBottomActions
                hideAgents={true}
                hideDropdown={true}
                placeholder="Describe your new agent..."
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
              />
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
