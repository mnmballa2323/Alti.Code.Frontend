"use client";
import ChatBotLayout from "@/components/ChatbotLayout";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import MessageContainer from "@/components/message-container";
import { AppDispatch, RootState } from "@/store";
import {
  sendMessage,
  setChatContext,
  startNewChat,
} from "@/store/messagesSlice";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? null;
  const sessionId = useSelector((state: RootState) => state.messages.sessionId);
  const isChatting = useSelector(
    (state: RootState) => state.messages.isChatting
  );

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));
  }, [dispatch]);

  const handleFirstMessageSend = (prompt: string) => {
    const onNavigationFulfilled = (newSessionId: string) => {
      router.push(`/chat/${newSessionId}`);
    };

    dispatch(
      sendMessage({
        prompt,
        model: "default",
        sessionId: sessionId,
        ...(sessionId === null ? { onFulfilled: onNavigationFulfilled } : {}),
        token,
      })
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
                onSend={handleFirstMessageSend}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="transition-all relative duration-300 flex h-full w-full items-center justify-center">
          <div className="flex w-full max-w-4xl flex-col items-center gap-8 z-20">
            <h1 className="text-3xl font-semibold leading-9 text-default-foreground">
              Build The Future
            </h1>
            <div className="flex w-full flex-col gap-4 px-4 hide-scrollbar">
              <PromptInputFullLineWithBottomActions
                onSend={handleFirstMessageSend}
              />
            </div>
          </div>
          <p className="absolute bottom-3 text-xs text-neutral-500">
            We don’t train on your data. Your chats stay private.
          </p>
        </div>
      )}
    </ChatBotLayout>
  );
}
