"use client";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import MessageContainer from "@/components/message-container";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function page() {
  const [isChatting, setIsChatting] = useState(false);

  const message = useSelector((state: any) => state.setNewChat.message);

  useEffect(() => {
    if (message) {
      setIsChatting(true);
    }
  });

  return (
    <div className="w-full">
      {isChatting ? (
        <div className="flex flex-col h-screen w-full items-end justify-between px-10 py-4 gap-4">
          <div className="h-[calc(100vh_-_60px)] w-full overflow-y-auto rounded-2xl">
            <MessageContainer />
          </div>
          <PromptInputFullLineWithBottomActions />
        </div>
      ) : (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex w-full max-w-4xl flex-col items-center gap-8">
            <h1 className="text-3xl font-semibold leading-9 text-default-foreground">
              How can I help you today?
            </h1>
            <div className="flex w-full flex-col gap-4 px-4">
              <PromptInputFullLineWithBottomActions />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default page;
