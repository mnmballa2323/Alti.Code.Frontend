"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Microscope } from "lucide-react";
import { cn } from "@heroui/react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettingsStore } from "@/store/useSettingsStore";
import ChatBotLayout from "@/components/ChatbotLayout";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import MessageContainer from "@/components/message-container";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  sendMessage,
  setChatContext,
  startNewChat,
} from "@/store/messagesSlice";

export default function ChatHome() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const sessionId = useAppSelector((state) => state.messages.sessionId);
  const { defaultModel } = useSettingsStore();
  const isChatting = useAppSelector((state) => state.messages.isChatting);

  const [isResearchMode, setIsResearchMode] = useState(false);

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "chat" }));
  }, [dispatch]);

  const handleFirstMessageSend = (
    prompt: string,
    mode?: string,
    domain?: string,
    language?: string,
  ) => {
    const onNavigationFulfilled = (newSessionId: string) => {
      router.push(`/chat/${newSessionId}`);
    };

    dispatch(
      sendMessage({
        prompt,
        model: isResearchMode
          ? "Deep Research"
          : defaultModel || mode || "Smart Routing",
        domain: isResearchMode ? "Research" : "Chat", // Enforce Chat Workspace Guardrails or Research intercept
        language,
        sessionId: sessionId,
        ...(sessionId === null ? { onFulfilled: onNavigationFulfilled } : {}),
        token,
      }),
    );
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-transparent flex flex-col h-full font-sans w-full">
        {/* Dynamic Content */}
        {isChatting ? (
          <div className="flex flex-col h-full w-full items-center justify-between px-6 py-4 gap-4 relative z-10">
            <div className="flex flex-col w-full h-full max-w-3xl">
              <div className="w-full flex-grow overflow-y-auto scroll-smooth scrollbar-none pb-4">
                <MessageContainer />
              </div>
              <div className="w-full mt-auto">
                <PromptInputFullLineWithBottomActions
                  hideAgents={true}
                  hideDropdown={true}
                  placeholder="Enter prompt here..."
                  rightActions={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Search
                          className={cn(
                            "size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-all active:scale-95",
                            isResearchMode
                              ? "bg-primary border-primary shadow-sm shadow-primary/40"
                              : "bg-black border-gray-300",
                          )}
                          onClick={() => setIsResearchMode(!isResearchMode)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>
                          {isResearchMode
                            ? "Disable Deep Research"
                            : "Deep Research"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  }
                  onSend={handleFirstMessageSend}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-1 w-full flex-col items-center justify-start pt-[35vh] overflow-hidden">
            <div className="flex w-full flex-col items-center gap-6 z-20 px-6">
              <div className="flex flex-col items-center text-center z-30 mb-6">
                <h1
                  className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80 animate-in fade-in duration-300"
                  style={{ fontFamily: "var(--font-secondary)" }}
                >
                  {isResearchMode ? "Deep Research" : "Let's Chat"}
                </h1>
              </div>
              <div className="flex w-full flex-col gap-4 max-w-2xl">
                <PromptInputFullLineWithBottomActions
                  hideAgents={true}
                  hideDropdown={true}
                  placeholder="Enter prompt here..."
                  rightActions={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Microscope
                          className={cn(
                            "size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-all active:scale-95",
                            isResearchMode
                              ? "bg-primary border-primary shadow-sm shadow-primary/40"
                              : "bg-black border-gray-300",
                          )}
                          onClick={() => setIsResearchMode(!isResearchMode)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>
                          {isResearchMode
                            ? "Disable Deep Research"
                            : "Deep Research"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  }
                  showModelDropdown={true}
                  onSend={handleFirstMessageSend}
                />
              </div>
            </div>

            <p className="absolute bottom-8 text-xs font-medium text-default-400 opacity-60 z-20">
              We don&apos;t train on your data. Your chats stay private.
            </p>
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
}
