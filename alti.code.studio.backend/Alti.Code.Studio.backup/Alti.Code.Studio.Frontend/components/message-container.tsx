"use client";
import React, { useRef, useEffect } from "react";
import MessageCard from "./message-card";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import MDEditor from "@uiw/react-md-editor";
import remarkGfm from "remark-gfm";
import { MarkdownChats } from "./markdown-chats";

const FormattedReply = ({ reply }: { reply: string }) => {
  return (
    <div data-color-mode="light" className="w-full">
      <MDEditor.Markdown
        remarkPlugins={[remarkGfm]}
        components={MarkdownChats}
        source={reply}
        // style={docco}
      />
    </div>
  );
};

export default function MessageContainer() {
  const { messages, loading } = useSelector(
    (state: RootState) => state.messages
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {messages.map((chatMessage, index) => {
        const isAssistantMessage = !!chatMessage.reply;

        return (
          <React.Fragment key={index}>
            {chatMessage.prompt && (
              <div className="max-w-full flex justify-end">
                <MessageCard
                  key={`user-${index}`}
                  message={chatMessage.prompt}
                  messageClassName="bg-default-200 text-default-600 w-full max-w-full whitespace-pre-wrap break-words"
                  className="justify-end"
                  showFeedback={false}
                />
              </div>
            )}

            {/* AI Response --- */}
            {isAssistantMessage && (
              <div className="max-w-full flex justify-start">
                <MessageCard
                  key={`assistant-${index}`}
                  message={
                    <FormattedReply reply={chatMessage.reply as string} />
                  }
                  messageClassName="bg-transparent text-white w-full max-w-full"
                  className="justify-start"
                  showFeedback={true}
                  status={"success"}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* --- Loading Indicator --- */}
      {loading && messages.length > 0 && (
        <div className="flex items-center justify-start p-3 ml-3 min-w-screen">
          <div className="flex space-x-2 animate-pulse">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          </div>
        </div>
      )}

      {/* 4. Attach the ref to an empty div */}
      <div ref={messagesEndRef} />
    </div>
  );
}
