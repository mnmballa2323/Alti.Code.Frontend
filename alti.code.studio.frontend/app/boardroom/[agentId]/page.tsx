"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useParams } from "next/navigation";

import ChatBotLayout from "@/components/ChatbotLayout";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import MessageContainer from "@/components/message-container";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  sendMessage,
  setChatContext,
  startNewChat,
} from "@/store/messagesSlice";

const executives: Record<string, { name: string, role: string }> = {
  "chairman": { name: "Chairman", role: "Board of Directors" },
  "ceo": { name: "CEO", role: "Product Strategy" },
  "coo": { name: "COO", role: "Operations" },
  "cto": { name: "CTO", role: "Architecture" },
  "ciso": { name: "CISO", role: "Security" },
  "cfo": { name: "CFO", role: "FinOps" },
  "cmo": { name: "CMO", role: "Growth" },
  "cro": { name: "CRO", role: "Sales & Revenue" },
  "counsel": { name: "Lawyer", role: "Legal & Compliance" },
  "accountant": { name: "Accountant", role: "Audit & Tax" },
  "pm": { name: "Product Manager", role: "Product Specs" },
  "designer": { name: "UX/UI Designer", role: "Design System" },
  "devops": { name: "DevOps Engineer", role: "Infrastructure" },
  "qa": { name: "QA Engineer", role: "Testing & Quality" },
  "backend": { name: "Backend Developer", role: "Microservices" },
  "frontend": { name: "Frontend Developer", role: "UI/UX Engineering" },
  "ai": { name: "AI Engineer", role: "Data Science & LLMs" },
  "dba": { name: "Database Admin", role: "Data Architecture" },
  "writer": { name: "Technical Writer", role: "Documentation" },
  "scrum": { name: "Scrum Master", role: "Agile Workflow" },
  "support": { name: "Support Engineer", role: "Customer Success" },
};

export default function BoardroomChat() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const agentId = params.agentId as string;
  const exec = executives[agentId] || { name: "Executive", role: "Consultant" };

  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const sessionId = useAppSelector((state) => state.messages.sessionId);
  const isChatting = useAppSelector((state) => state.messages.isChatting);

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: agentId }));
  }, [dispatch, agentId]);

  const handleFirstMessageSend = (
    prompt: string,
    mode?: string,
    domain?: string,
    language?: string,
  ) => {
    const onNavigationFulfilled = (newSessionId: string) => {
      // Route to standard chat with the new session
      router.push(`/chat/${newSessionId}`);
    };

    dispatch(
      sendMessage({
        prompt,
        model: agentId, // Lock the model to the selected executive
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
      <div className="flex-1 overflow-hidden bg-white dark:bg-background flex flex-col h-full font-sans w-full">
        {/* Standardized Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-50 relative w-full">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900">
                {exec.name} <span className="text-default-400 font-normal text-xs ml-2">— {exec.role}</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {isChatting ? (
          <div className="flex flex-col h-full w-full items-center justify-between px-6 py-4 gap-4 relative z-10">
            <div className="flex flex-col w-full h-full max-w-3xl">
              <div className="w-full flex-grow overflow-y-auto scroll-smooth scrollbar-none pb-4">
                <MessageContainer />
              </div>
              <div className="w-full mt-auto">
                <PromptInputFullLineWithBottomActions
                  hideAgents={true}
                  hideDropdown={true}
                  onSend={handleFirstMessageSend}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-1 w-full flex-col items-center justify-center overflow-hidden">
            <div className="flex w-full flex-col items-center gap-6 z-20 px-6 mt-[-5vh]">
              <div className="flex flex-col items-center text-center z-30 mb-6">
                <h1
                  className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80"
                  style={{ fontFamily: "var(--font-secondary)" }}
                >
                  Consult {exec.name}
                </h1>
                <p className="text-default-500 mt-2">What architectural decisions do you need to discuss?</p>
              </div>

              <div className="flex w-full flex-col gap-4 max-w-2xl">
                <PromptInputFullLineWithBottomActions
                  hideAgents={true}
                  hideDropdown={true}
                  onSend={handleFirstMessageSend}
                />
              </div>
            </div>

            <p className="absolute bottom-8 text-xs font-medium text-default-400 opacity-60 z-20">
              Boardroom consultations are strictly confidential and zero-trust secured.
            </p>
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
}
