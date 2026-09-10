"use client";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Paperclip } from "lucide-react";

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
import { cn } from "@/lib/utils";

type PromptCategory =
  | "chat"
  | "search"
  | "research"
  | "write"
  | "create"
  | "code"
  | "monitor"
  | "agent";

const PROMPT_CATEGORIES: { id: PromptCategory; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "search", label: "Search" },
  { id: "research", label: "Research" },
  { id: "write", label: "Write" },
  { id: "create", label: "Create" },
  { id: "code", label: "Code" },
  { id: "monitor", label: "Monitor" },
  { id: "agent", label: "Agent" },
];

function CodeHomeContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isChatMode = searchParams.get("mode") === "chat";

  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const sessionId = useAppSelector((state) => state.messages.sessionId);
  const { defaultModel } = useSettingsStore();
  const isChatting = useAppSelector(
    (state) => state.messages.isChatting && state.messages.messages.length > 0,
  );

  const [activeModeState, setActiveModeState] = useState<
    "code" | "chat" | "create" | "cowork"
  >("code");
  const [activePromptMode, setActivePromptMode] = useState<
    "code" | "chat" | "search" | "research"
  >("code");

  useEffect(() => {
    const modeFromUrl = searchParams?.get("mode") as
      | "code"
      | "chat"
      | "create"
      | "cowork"
      | null;

    if (modeFromUrl) {
      setActiveModeState(modeFromUrl);
      if (modeFromUrl === "chat") {
        setActivePromptMode("chat");
      } else if (modeFromUrl === "code") {
        setActivePromptMode("code");
      }
    } else {
      setActiveModeState("code");
      setActivePromptMode("code");
    }

    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const newMode = customEvent.detail as
        | "code"
        | "chat"
        | "create"
        | "cowork";

      if (newMode) {
        setActiveModeState(newMode);
        if (newMode === "chat") {
          setActivePromptMode("chat");
        } else if (newMode === "code") {
          setActivePromptMode("code");
        }
      }
    };

    window.addEventListener("inso-mode-change", handleModeChange);

    return () =>
      window.removeEventListener("inso-mode-change", handleModeChange);
  }, [searchParams]);
  const [activeCategory, setActiveCategory] = useState<PromptCategory>("code");

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(
      setChatContext({ sessionId: null, model: "code", domain: "Code" }),
    );
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

    const categoryLabel =
      PROMPT_CATEGORIES.find((c) => c.id === activeCategory)?.label || "Code";

    dispatch(
      sendMessage({
        prompt,
        model: "Gemini 2.5 Pro",
        domain: categoryLabel,
        mode: activeCategory,
        language,
        sessionId: sessionId,
        ragMode,
        ragSources,
        ...(sessionId === null ? { onFulfilled: onNavigationFulfilled } : {}),
        token,
      }),
    );
  };

  const renderLeftActions = (
    <div className="flex items-center gap-1.5 max-w-full">
      <button
        className="inso-paperclip-btn bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 border border-transparent dark:border-white/5 h-[26px] w-[26px] flex items-center justify-center rounded-md transition-all shrink-0 cursor-pointer"
        type="button"
        title="Attach File"
        onClick={() => {
          const fileInput = document.querySelector(
            'input[type="file"]',
          ) as HTMLInputElement;

          if (fileInput) fileInput.click();
        }}
      >
        <Paperclip className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
      </button>

      {/* 8-Item Menu Toggle: Chat / Search / Research / Write / Create / Code / Monitor / Agent */}
      <div className="flex items-center bg-gray-100/90 dark:bg-[#141416] border border-gray-200/80 dark:border-white/10 rounded-lg p-0.5 gap-0.5 shrink-0">
        {PROMPT_CATEGORIES.map((item) => {
          const isActive = activeCategory === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveCategory(item.id)}
              className={cn(
                "px-2 h-[22px] rounded-md text-[10.5px] font-medium leading-none transition-all duration-150 shrink-0 cursor-pointer select-none",
                isActive
                  ? "bg-white dark:bg-[#252528] text-gray-900 dark:text-white shadow-xs font-semibold"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200/50 dark:hover:bg-white/5",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );

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
                  leftActionsOverride={renderLeftActions}
                  placeholder="Enter prompt here..."
                  showModelDropdown={false}
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
                <h1
                  className="text-4xl font-light tracking-tight text-foreground"
                  style={{ fontFamily: "var(--font-secondary)" }}
                >
                  Let's Build Together
                </h1>
              </div>
              <div className="flex w-full flex-col gap-4 max-w-2xl lg:max-w-3xl">
                <PromptInputFullLineWithBottomActions
                  leftActionsOverride={renderLeftActions}
                  showModelDropdown={false}
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

export default function CodeHome() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full bg-default-50 dark:bg-background" />
      }
    >
      <CodeHomeContent />
    </Suspense>
  );
}
