"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@heroui/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


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
    language?: string
  ) => {
    const onNavigationFulfilled = (newSessionId: string) => {
      router.push(`/chat/${newSessionId}`);
    };

    dispatch(
      sendMessage({
        prompt,
        model: isResearchMode ? "Deep Research" : (mode || "Agent"),
        domain: isResearchMode ? "Research" : "Chat", // Enforce Chat Workspace Guardrails or Research intercept
        language,
        sessionId: sessionId,
        ...(sessionId === null ? { onFulfilled: onNavigationFulfilled } : {}),
        token,
      })
    );
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-white dark:bg-background flex flex-col h-full font-sans w-full">
        {/* Standardized Header - Left-Aligned Chat Session */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-50 relative w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900">
                {isResearchMode ? "Deep Research" : "Chat Session"}
              </h1>
            </div>
          </div>
        </div>

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
                  placeholder={isResearchMode ? "Enter research objective (e.g., Perform a zero-trust architecture audit...)" : "Enter your prompt here..."}
                  onSend={handleFirstMessageSend}
                  rightActions={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Search
                          className={cn(
                            "size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95",
                            isResearchMode
                              ? "bg-primary border-primary shadow-sm shadow-primary/40 scale-105"
                              : "bg-black border-gray-300 hover:border-primary hover:text-primary",
                          )}
                          onClick={() => setIsResearchMode(!isResearchMode)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{isResearchMode ? "Disable Deep Research" : "Deep Research"}</p>
                      </TooltipContent>
                    </Tooltip>
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-1 w-full flex-col items-center justify-center overflow-hidden">
            <div className="flex w-full flex-col items-center gap-6 z-20 px-6 mt-[-5vh]">
              <div className="flex flex-col items-center text-center z-30 mb-6">
                <h1
                  className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80"
                  style={{ fontFamily: "var(--font-secondary)" }}
                >
                  Let's Chat
                </h1>
              </div>

              <div className="flex w-full flex-col gap-4 max-w-2xl">
                <PromptInputFullLineWithBottomActions
                  hideAgents={true}
                  hideDropdown={true}
                  placeholder={isResearchMode ? "Enter research objective (e.g., Perform a zero-trust architecture audit...)" : "Enter your prompt here..."}
                  onSend={handleFirstMessageSend}
                  rightActions={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Search
                          className={cn(
                            "size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95",
                            isResearchMode
                              ? "bg-primary border-primary shadow-sm shadow-primary/40 scale-105"
                              : "bg-black border-gray-300 hover:border-primary hover:text-primary",
                          )}
                          onClick={() => setIsResearchMode(!isResearchMode)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{isResearchMode ? "Disable Deep Research" : "Deep Research"}</p>
                      </TooltipContent>
                    </Tooltip>
                  }
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
