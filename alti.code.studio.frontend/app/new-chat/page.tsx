"use client";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import ChatBotLayout from "@/components/ChatbotLayout";
import MessageContainer from "@/components/message-container";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import { AppDispatch } from "@/store";
import { RootState } from "@/store";
import {
  startNewChat,
  setChatContext,
  sendMessage,
} from "@/store/messagesSlice";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? null;
  const sessionId = useSelector((state: RootState) => state.messages.sessionId);
  const isChatting = useSelector(
    (state: RootState) => state.messages.isChatting,
  );

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));
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
        model: mode || "Agent",
        domain,
        language,
        sessionId: sessionId,
        ...(sessionId === null ? { onFulfilled: onNavigationFulfilled } : {}),
        token,
      }),
    );
  };

  return (
    <ChatBotLayout>
      {isChatting ? (
        <div className="flex flex-col h-full max-w-full items-center justify-between px-10 py-4 gap-4">
          <div className="flex flex-col lg:w-9/12 w-full h-full">
            <div className="w-full flex-grow overflow-y-auto scroll-smooth scrollbar-none pb-4">
              <MessageContainer />
            </div>
            <div className="w-full mt-auto">
              <PromptInputFullLineWithBottomActions
                showModelDropdown={true}
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
                className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80"
                style={{ fontFamily: "var(--font-secondary)" }}
              >
                Build The Future
              </h1>
            </div>

            <div className="flex w-full flex-col gap-4 max-w-2xl">
              <PromptInputFullLineWithBottomActions
                showModelDropdown={true}
                onSend={handleFirstMessageSend}
              />
            </div>
          </div>
        </div>
      )}
    </ChatBotLayout>
  );
}
