"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";

import ChatBotLayout from "@/components/ChatbotLayout";
import MessageContainer from "@/components/message-container";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import {
  setChatContext,
  setMessages,
  sendMessage,
} from "@/store/messagesSlice";
import { RootState } from "@/store";
import useFetchSingleData from "@/hooks/useFetchSingleData";
import { AppDispatch } from "@/store";

const SingleChatPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const sessionId = params.id as string;
  const model = "default";
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const { chat, singleLoading, singleError } = useFetchSingleData(
    model,
    sessionId,
    token,
  );
  const { sessionId: currentSessionId, model: currentModel } = useSelector(
    (state: RootState) => state.messages,
  );

  const [isResearchMode, setIsResearchMode] = useState(false);

  useEffect(() => {
    if (chat?.responses?.[0]?.model === "Deep Research") {
      setIsResearchMode(true);
    }
  }, [chat]);

  useEffect(() => {
    if (sessionId && chat && chat.responses) {
      dispatch(setChatContext({ sessionId, model: "chat" }));
      dispatch(setMessages(chat.responses));
    }
  }, [sessionId, chat, dispatch]);

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

  const handleSend = (
    prompt: string,
    mode?: string,
    domain?: string,
    language?: string,
  ) => {
    dispatch(
      sendMessage({
        prompt,
        model: isResearchMode ? "Deep Research" : mode || "Agent",
        domain: isResearchMode ? "Research" : "Chat", // Enforce Chat Workspace Guardrails or Research intercept
        language,
        sessionId,
        token,
      }),
    );
  };

  const chatTitle = chat?.responses?.[0]?.prompt || "Active Session";

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-transparent flex flex-col h-full font-sans w-full">
        {/* Dynamic Content */}
        <div className="flex flex-col h-full w-full items-center justify-between px-6 py-4 gap-4 relative z-10">
          <div className="flex flex-col w-full h-full max-w-full">
            <div className="w-full flex-grow overflow-y-auto hide-scrollbar pb-4">
              <MessageContainer />
            </div>
            <div className="w-full mt-auto">
              <PromptInputFullLineWithBottomActions
                hideAgents={true}
                hideDropdown={true}
                placeholder="Enter prompt here..."
                onSend={handleSend}
              />
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
};

export default SingleChatPage;
