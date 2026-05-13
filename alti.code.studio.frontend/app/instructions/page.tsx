"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ChatBotLayout from "@/components/ChatbotLayout";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import { AppDispatch, RootState } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";
import { AgentCommandCenter } from "@/components/AgentCommandCenter";

export default function Instructions() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? null;
  const sessionId = useSelector((state: RootState) => state.messages.sessionId);
  const isChatting = useSelector(
    (state: RootState) => state.messages.isChatting,
  );

  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));

    const handleEditInstruction = (e: any) => {
      setInputValue(e.detail.name);
      setEditingId(e.detail.id);
    };

    window.addEventListener("edit-instruction", handleEditInstruction);

    return () =>
      window.removeEventListener("edit-instruction", handleEditInstruction);
  }, [dispatch]);

  const handleSend = (prompt: string) => {
    if (editingId) {
      window.dispatchEvent(
        new CustomEvent("update-instruction", {
          detail: { id: editingId, name: prompt },
        }),
      );
      setEditingId(null);
    } else {
      window.dispatchEvent(
        new CustomEvent("add-instruction", { detail: prompt }),
      );
    }
    setInputValue("");
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-default-50 dark:bg-background flex flex-col h-full font-sans w-full">
        {/* Standardized Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-50 relative w-full">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900">
                System Instructions
              </h1>
            </div>
          </div>
        </div>

        <div className="relative flex flex-1 w-full flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none blur-sm mix-blend-screen">
            <AgentCommandCenter />
          </div>

          <div className="flex w-full flex-col items-center gap-6 z-20 px-6 mt-[-5vh]">
            <div className="flex flex-col items-center text-center z-30 mb-6">
              <h1
                className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80"
                style={{ fontFamily: "var(--font-secondary)" }}
              >
                Instructions
              </h1>
            </div>

            <div className="flex w-full flex-col gap-4 max-w-2xl">
              <PromptInputFullLineWithBottomActions
                hideAgents={true}
                hideDropdown={true}
                placeholder="Enter instructions here..."
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
              />
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
