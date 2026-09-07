"use client";

import type { RootState } from "@/store";

import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Paperclip, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const COWORK_MODELS = [
  {
    id: "gemini-3.6-flash",
    label: "Gemini 3.6 Flash High",
    description: "Google Cloud · Vertex AI",
  },
  {
    id: "gemini-3.1-pro",
    label: "Gemini 3.1 Pro",
    description: "Google Cloud · Vertex AI",
  },
  {
    id: "gemini-3.0-ultra",
    label: "Gemini 3.0 Ultra",
    description: "Google Cloud · Vertex AI",
  },
  {
    id: "claude-opus-4.6",
    label: "Claude Opus 4.6",
    description: "Google Cloud · Vertex AI Model Garden",
  },
  {
    id: "claude-sonnet-4.5",
    label: "Claude Sonnet 4.5",
    description: "Google Cloud · Vertex AI Model Garden",
  },
  {
    id: "claude-haiku-4",
    label: "Claude Haiku 4",
    description: "Google Cloud · Vertex AI Model Garden",
  },
  {
    id: "deepseek-coder-v3",
    label: "DeepSeek Coder V3",
    description: "Google Cloud · Vertex AI Model Garden",
  },
  {
    id: "qwen-3-coder",
    label: "Qwen 3 Coder",
    description: "Google Cloud · Vertex AI Model Garden",
  },
  {
    id: "phi-4",
    label: "Phi-4",
    description: "Google Cloud · Vertex AI Model Garden",
  },
];

import ChatBotLayout from "@/components/ChatbotLayout";
import MessageContainer from "@/components/message-container";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import CompletedInboxView from "@/components/cowork/CompletedInboxView";
import { CoworkSubTab } from "@/components/cowork/CoworkSubToggleBar";
import { AppDispatch } from "@/store";
import {
  startNewChat,
  setChatContext,
  sendMessage,
} from "@/store/messagesSlice";

export default function CoworkMode() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const sessionId = useSelector((state: RootState) => state.messages.sessionId);
  const isChatting = useSelector(
    (state: RootState) => state.messages.isChatting,
  );

  const [selectedModel, setSelectedModel] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<CoworkSubTab>("tasks");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(
      setChatContext({ sessionId: null, model: "cowork", domain: "Cowork" }),
    );

    const handleSubTabChange = (e: CustomEvent<CoworkSubTab>) => {
      if (e.detail) {
        setActiveSubTab(e.detail);
      }
    };

    window.addEventListener(
      "inso-cowork-subtab-change",
      handleSubTabChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        "inso-cowork-subtab-change",
        handleSubTabChange as EventListener,
      );
    };
  }, [dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isModelDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [isModelDropdownOpen]);

  const getSelectedModelLabel = () => {
    if (!selectedModel) return "Select Model";

    return (
      COWORK_MODELS.find((m) => m.id === selectedModel)?.label || "Select Model"
    );
  };

  const handleFirstMessageSend = (
    prompt: string,
    mode?: string,
    domain?: string,
    language?: string,
  ) => {
    const onNavigationFulfilled = (newSessionId: string) => {
      router.push(`/cowork/${newSessionId}`);
    };

    dispatch(
      sendMessage({
        prompt,
        model:
          mode || (selectedModel ? getSelectedModelLabel() : "Cowork Agent"),
        domain: "Cowork",
        language,
        sessionId: sessionId,
        ...(sessionId === null ? { onFulfilled: onNavigationFulfilled } : {}),
        token,
      }),
    );
  };

  const renderLeftActions = (
    <div className="flex items-center gap-2">
      <button
        className="inso-paperclip-btn bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 border border-transparent dark:border-white/5 h-[28px] w-[28px] flex items-center justify-center rounded-md transition-all shrink-0 cursor-pointer"
        type="button"
        onClick={() => {
          const fileInput = document.querySelector(
            'input[type="file"]',
          ) as HTMLInputElement;

          if (fileInput) fileInput.click();
        }}
      >
        <Paperclip className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
      </button>

      {/* Model Picker Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          ref={buttonRef}
          className={cn(
            "flex items-center gap-1.5 px-2.5 h-[28px] rounded-md text-[12px] font-normal transition-all cursor-pointer",
            "bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border border-transparent dark:border-white/5",
            "hover:bg-gray-200 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white",
          )}
          type="button"
          onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
        >
          {getSelectedModelLabel()}
          <ChevronDown
            className={cn(
              "w-3 h-3 transition-transform duration-200",
              isModelDropdownOpen && "rotate-180",
            )}
          />
        </button>

        {isModelDropdownOpen && dropdownPosition && (
          <div
            className="fixed w-[240px] bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              zIndex: 99999,
            }}
          >
            <div className="p-1.5 max-h-[220px] overflow-y-auto scrollbar-thin">
              {COWORK_MODELS.map((model) => (
                <button
                  key={model.id}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-left transition-all cursor-pointer text-[12px] font-medium flex flex-col gap-0.5",
                    selectedModel === model.id
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5",
                  )}
                  type="button"
                  onClick={() => {
                    setSelectedModel(model.id);
                    setIsModelDropdownOpen(false);
                  }}
                >
                  <span>{model.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ChatBotLayout>
      {isChatting ? (
        <div className="flex flex-col h-full max-w-full items-center justify-between px-10 py-4 gap-4 bg-background">
          <div className="flex flex-col lg:w-9/12 w-full h-full">
            <div className="w-full flex-grow overflow-y-auto scroll-smooth scrollbar-none pb-4">
              <MessageContainer />
            </div>
            <div className="w-full mt-auto">
              <PromptInputFullLineWithBottomActions
                leftActionsOverride={renderLeftActions}
                showModelDropdown={true}
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
          {activeSubTab === "tasks" ? (
            <div className="flex w-full flex-col items-center gap-6 z-20 px-6 md:px-12 lg:px-16">
              <div className="flex flex-col items-center text-center z-30 mb-6 h-[40px] justify-center">
                <h1
                  className="text-4xl font-semibold tracking-tight text-foreground"
                  style={{ fontFamily: "var(--font-secondary)" }}
                >
                  Let's Work Together
                </h1>
              </div>

              <div className="flex w-full flex-col gap-4 max-w-2xl lg:max-w-3xl">
                <PromptInputFullLineWithBottomActions
                  leftActionsOverride={renderLeftActions}
                  showModelDropdown={true}
                  onSend={handleFirstMessageSend}
                />
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col max-w-5xl gap-6 z-20 pb-20 pt-8 px-6 md:px-10 overflow-y-auto">
              <CompletedInboxView />
            </div>
          )}
        </div>
      )}
    </ChatBotLayout>
  );
}
