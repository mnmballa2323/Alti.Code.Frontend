"use client";
import { useParams, useRouter } from "next/navigation";
import ChatBotLayout from "@/components/ChatbotLayout";
import MessageContainer from "@/components/message-container";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { setChatContext, setMessages } from "@/store/messagesSlice";
import { RootState } from "@/store";
import useFetchSingleData from "@/hooks/useFetchSingleData";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useSession } from "next-auth/react";

const SingleChatPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const sessionId = params.id as string;
  const model = "default";
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? null;
  const { chat, singleLoading, singleError } = useFetchSingleData(
    model,
    sessionId,
    token
  );
  const { sessionId: currentSessionId, model: currentModel } = useSelector(
    (state: RootState) => state.messages
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
              className="h-16 w-16"
              src="https://icons8.com/preloaders/preloaders/1488/Iphone-spinner-2.gif"
              alt=""
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

  return (
    <ChatBotLayout>
      <div className="flex flex-col h-full max-w-full items-center justify-between px-10 py-4 gap-4">
        <div className="flex flex-col lg:w-9/12 w-full h-full">
          <div className="w-full flex-grow overflow-y-auto hide-scrollbar pb-4">
            <MessageContainer />
          </div>
          <div className="w-full mt-auto">
            <PromptInputFullLineWithBottomActions />
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
};

export default SingleChatPage;
