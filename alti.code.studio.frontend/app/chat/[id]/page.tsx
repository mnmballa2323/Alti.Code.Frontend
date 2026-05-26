"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { cn } from "@heroui/react";

import ChatBotLayout from "@/components/ChatbotLayout";
import MessageContainer from "@/components/message-container";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import { setChatContext, setMessages } from "@/store/messagesSlice";
import { RootState } from "@/store";
import useFetchSingleData from "@/hooks/useFetchSingleData";
import { AppDispatch } from "@/store";

const UltimateRagTerminal = dynamic(
  () =>
    import("@/components/UltimateRagTerminal").then(
      (mod) => mod.UltimateRagTerminal
    ),
  { ssr: false }
);

const SingleChatPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isRagMode, setIsRagMode] = useState(false);

  const sessionId = params.id as string;
  const model = "default";
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? null;
  const { chat, singleLoading, singleError } = useFetchSingleData(
    model,
    sessionId,
    token,
  );
  const { sessionId: currentSessionId, model: currentModel } = useSelector(
    (state: RootState) => state.messages,
  );

  useEffect(() => {
    if (sessionId && chat && chat.responses) {
      dispatch(setChatContext({ sessionId, model }));
      dispatch(setMessages(chat.responses));
    }
  }, [sessionId, model, chat, dispatch]);

  if (singleLoading) {
    return (
      <ChatBotLayout>
        <div className="h-screen">
          <div className="flex justify-center items-center h-full">
            <img
              alt=""
              className="h-16 w-16"
              src="https://icons8.com/preloaders/preloaders/1488/Iphone-spinner-2.gif"
            />
          </div>
        </div>
      </ChatBotLayout>
    );
  }

  if (singleError) {
    const errorMessage =
      singleError instanceof Error
        ? singleError.message
        : "Failed to load chat.";

    return (
      <ChatBotLayout>
        <div className="text-red-500 text-center p-8">
          Error: {errorMessage}
        </div>
      </ChatBotLayout>
    );
  }

  const chatTitle = chat?.responses?.[0]?.prompt || "Active Session";

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-default-50 dark:bg-background flex flex-col h-full font-sans w-full">
        {/* Standardized Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-50 relative w-full">
          <div className="flex items-center justify-between max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900 truncate max-w-xl">
                {isRagMode ? "Codebase Search (RAG)" : chatTitle}
              </h1>
            </div>

            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setIsRagMode(false)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer border-none outline-none",
                  !isRagMode
                    ? "bg-white dark:bg-default-200 text-foreground shadow-sm font-semibold"
                    : "text-default-400 hover:text-default-600 bg-transparent"
                )}
              >
                Standard Chat
              </button>
              <button
                type="button"
                onClick={() => setIsRagMode(true)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer border-none outline-none",
                  isRagMode
                    ? "bg-white dark:bg-default-200 text-foreground shadow-sm font-semibold"
                    : "text-default-400 hover:text-default-600 bg-transparent"
                )}
              >
                RAG Search
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {isRagMode ? (
          <UltimateRagTerminal />
        ) : (
          <div className="flex flex-col h-full w-full items-center justify-between px-6 py-4 gap-4 relative z-10">
            <div className="flex flex-col w-full h-full max-w-3xl">
              <div className="w-full flex-grow overflow-y-auto hide-scrollbar pb-4">
                <MessageContainer />
              </div>
              <div className="w-full mt-auto">
                <PromptInputFullLineWithBottomActions
                  hideAgents={true}
                  hideDropdown={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
};

export default SingleChatPage;
