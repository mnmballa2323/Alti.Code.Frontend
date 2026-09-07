"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const isChatting = useAppSelector(
    (state) => state.messages.isChatting && state.messages.messages.length > 0,
  );

  const [activePromptMode, setActivePromptMode] = useState<
    "chat" | "search" | "research"
  >("chat");

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(
      setChatContext({ sessionId: null, model: "chat", domain: "Chat" }),
    );

    const handleChatSubTabChange = (
      e: CustomEvent<"chat" | "search" | "research">,
    ) => {
      if (e.detail) {
        setActivePromptMode(e.detail);
      }
    };

    window.addEventListener(
      "inso-chat-subtab-change",
      handleChatSubTabChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        "inso-chat-subtab-change",
        handleChatSubTabChange as EventListener,
      );
    };
  }, [dispatch]);

  const handleFirstMessageSend = (
    prompt: string,
    mode?: string,
    domain?: string,
    language?: string,
    ragMode?: "auto" | "forced" | "disabled",
    ragSources?: string[],
  ) => {
    const onNavigationFulfilled = (newSessionId: string) => {
      router.push(`/chat/${newSessionId}`);
    };

    dispatch(
      sendMessage({
        prompt,
        model:
          activePromptMode === "research"
            ? "Deep Research"
            : activePromptMode === "search"
              ? "Web Search"
              : defaultModel || mode || "Smart Routing",
        domain:
          activePromptMode === "research"
            ? "Research"
            : activePromptMode === "search"
              ? "Search"
              : "Chat",
        language,
        sessionId: sessionId,
        ragMode,
        ragSources,
        ...(sessionId === null ? { onFulfilled: onNavigationFulfilled } : {}),
        token,
      }),
    );
  };

  const getPromptPlaceholder = () => {
    if (activePromptMode === "research") return "Research anything...";
    if (activePromptMode === "search") return "Search anything...";

    return "Chat your code...";
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-transparent flex flex-col h-full font-sans w-full">
        {/* Dynamic Content */}
        {isChatting ? (
          <div className="flex flex-col h-full w-full items-center justify-between px-6 py-4 gap-4 relative z-10">
            <div className="flex flex-col w-full h-full max-w-full">
              <div className="w-full flex-grow overflow-y-auto scroll-smooth scrollbar-none pb-4">
                <MessageContainer />
              </div>
              <div className="w-full mt-auto">
                <PromptInputFullLineWithBottomActions
                  hideAgents={true}
                  leftActionsOverride={null}
                  placeholder={getPromptPlaceholder()}
                  showModelDropdown={false}
                  singleHeight={true}
                  onSend={handleFirstMessageSend}
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="relative flex flex-1 w-full flex-col items-center justify-start pt-[35vh] overflow-hidden bg-[#DFDFDF] dark:bg-[#161616] bg-none"
            style={{ backgroundImage: "none" }}
          >
            <div className="flex w-full flex-col items-center gap-6 z-20 px-6 md:px-12 lg:px-16">
              <div className="flex flex-col items-center text-center z-30 mb-6 h-[40px] justify-center">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={activePromptMode}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-semibold tracking-tight text-foreground"
                    exit={{ opacity: 0, y: -5 }}
                    initial={{ opacity: 0, y: 5 }}
                    style={{ fontFamily: "var(--font-secondary)" }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    {activePromptMode === "research"
                      ? "Deep Research"
                      : activePromptMode === "search"
                        ? "Web Search"
                        : "Codebase Chat"}
                  </motion.h1>
                </AnimatePresence>
              </div>
              <div className="flex w-full flex-col gap-4 max-w-2xl lg:max-w-3xl">
                <PromptInputFullLineWithBottomActions
                  leftActionsOverride={null}
                  placeholder={getPromptPlaceholder()}
                  showModelDropdown={false}
                  singleHeight={true}
                  onSend={handleFirstMessageSend}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
}
