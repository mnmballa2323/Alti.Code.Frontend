"use client";
import type { RootState } from "@/store";

import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Paperclip } from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";
import MessageContainer from "@/components/message-container";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import { AppDispatch } from "@/store";
import {
  startNewChat,
  setChatContext,
  sendMessage,
} from "@/store/messagesSlice";

export default function CreateMode() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const sessionId = useSelector((state: RootState) => state.messages.sessionId);
  const isChatting = useSelector(
    (state: RootState) => state.messages.isChatting,
  );

  const [createCategory, setCreateCategory] = useState<
    "image" | "audio" | "video"
  >("image");

  useEffect(() => {
    const handleCategoryChange = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;

      if (detail === "image" || detail === "audio" || detail === "video") {
        setCreateCategory(detail);
      }
    };

    window.addEventListener(
      "inso-create-category-change",
      handleCategoryChange,
    );

    return () =>
      window.removeEventListener(
        "inso-create-category-change",
        handleCategoryChange,
      );
  }, []);

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(
      setChatContext({ sessionId: null, model: "create", domain: "Create" }),
    );
  }, [dispatch]);

  const handleFirstMessageSend = (
    prompt: string,
    mode?: string,
    domain?: string,
    language?: string,
  ) => {
    const onNavigationFulfilled = (newSessionId: string) => {
      router.push(`/create/${newSessionId}`);
    };

    dispatch(
      sendMessage({
        prompt,
        model: mode || "Agent",
        domain,
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
                className="text-4xl font-semibold tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-secondary)" }}
              >
                {createCategory === "audio"
                  ? "Audio Generation"
                  : createCategory === "video"
                    ? "Video Generation"
                    : "Image Generation"}
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
    </ChatBotLayout>
  );
}
