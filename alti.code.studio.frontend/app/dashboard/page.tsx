"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import MessageContainer from "@/components/message-container";
import SystemHealthWidget from "@/components/dashboard/SystemHealthWidget";

function DashboardPage() {
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
        <div className="flex flex-col h-screen w-full px-10 py-4 gap-4">
          <div className="w-full">
            <SystemHealthWidget />
          </div>
          <div className="h-[calc(100vh_-_200px)] w-full overflow-y-auto rounded-2xl">
            <MessageContainer />
          </div>
          <PromptInputFullLineWithBottomActions showModelDropdown={true} />
        </div>
      ) : (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex w-full max-w-4xl flex-col items-center gap-8">
            <div className="w-full px-4">
              <SystemHealthWidget />
            </div>
            <h1 className="text-3xl font-semibold leading-9 text-default-foreground">
              Build The Future
            </h1>

            <div className="flex w-full flex-col gap-4 px-4">
              <PromptInputFullLineWithBottomActions showModelDropdown={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
