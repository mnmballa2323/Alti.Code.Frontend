"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@iconify/react";

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


        <div className="relative flex flex-1 w-full flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none blur-sm mix-blend-screen">
            <AgentCommandCenter />
          </div>

          <div className="flex w-full flex-col items-center gap-6 z-20 px-6 mt-[-5vh]">
            
            <div className="w-full max-w-2xl bg-danger-500/10 border border-danger-500/20 p-4 rounded-xl shadow-sm text-left mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 text-danger-500 font-bold mb-1.5 uppercase text-xs tracking-wider">
                <Icon icon="solar:danger-circle-bold" className="text-base" />
                <span>[!WARNING] Hard Law</span>
              </div>
              <p className="text-sm text-danger-600/80 dark:text-danger-400/80 leading-relaxed font-medium">
                <strong>AI Provider Inference Strategy:</strong> Direct SDK connections to foundational models are blocked and forbidden for security reasons. The entire system MUST strictly adhere to the Tri-Cloud Inference Strategy (AWS Bedrock, GCP Vertex AI, Azure OpenAI Foundry).
              </p>
            </div>

            <div className="flex flex-col items-center text-center z-30 mb-6">
              <h1
                className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80"
                style={{ fontFamily: "var(--font-secondary)" }}
              >
                New Instruction
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
