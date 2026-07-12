"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowUp } from "lucide-react";
import axios from "axios";
import { Button, Input } from "@heroui/react";

import { TuningTabs } from "@/components/tuning-tabs";
import ChatBotLayout from "@/components/ChatbotLayout";
import { useActiveProject } from "@/hooks/useActiveProject";
import { readProjectData, writeProjectData } from "@/lib/project";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function InstructionsPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const project = useActiveProject();
  const agentId = project?.id ?? null;

  const [instructions, setInstructions] = useState<
    { id: string; name: string }[]
  >([]);
  const [guardrails, setGuardrails] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [inputValue, setInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Load per-project rules from localStorage, then try backend ──────────────
  useEffect(() => {
    const local = readProjectData<{
      instructions: { id: string; name: string }[];
      guardrails: { id: string; name: string }[];
    }>(agentId, "rules", { instructions: [], guardrails: [] });

    setInstructions(local.instructions);
    setGuardrails(local.guardrails);

    if (!token) return;
    const fetchRules = async () => {
      try {
        const res = await axios.get(`${API_URL}/rules`, {
          headers: { Authorization: `Bearer ${token}` },
          params: agentId ? { agentId } : undefined,
        });

        if (res.data?.success) {
          setInstructions(res.data.data.instructions || []);
          setGuardrails(res.data.data.guardrails || []);
        }
      } catch {
        // offline — already loaded from localStorage
      }
    };

    fetchRules();
  }, [token, agentId]);

  // ── Save to localStorage + backend ─────────────────────────────────────────
  const saveRules = async (updatedInst: { id: string; name: string }[]) => {
    writeProjectData(agentId, "rules", {
      instructions: updatedInst,
      guardrails,
    });
    window.dispatchEvent(
      new CustomEvent("refresh-rules-sidebar", {
        detail: { instructions: updatedInst, guardrails },
      }),
    );
    if (!token) return;
    try {
      await axios.post(
        `${API_URL}/rules`,
        { instructions: updatedInst, guardrails },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: agentId ? { agentId } : undefined,
        },
      );
    } catch {
      // best-effort backend sync
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    setSubmitting(true);
    const updated = [
      ...instructions,
      { id: "inst-" + Date.now(), name: inputValue.trim() },
    ];

    setInstructions(updated);
    setInputValue("");
    await saveRules(updated);
    setSubmitting(false);
  };

  return (
    <ChatBotLayout>
      <div className="flex flex-col h-full bg-default-100 dark:bg-default-50">
        {/* Premium top header with tabs */}
        <div className="shrink-0 w-full bg-white/80 dark:bg-[#111111]/90 backdrop-blur-md border-b border-default-200/60 dark:border-white/5 flex items-center justify-center h-14 px-8">
          <TuningTabs />
        </div>

        <div className="flex-1 overflow-y-auto p-8 font-sans scrollbar-hide flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl mb-14">
            <form
              className="relative flex items-center w-full shadow-sm rounded-2xl"
              onSubmit={handleSend}
            >
              <Input
                classNames={{
                  inputWrapper:
                    "!bg-white dark:!bg-[#111111] data-[hover=true]:!bg-white data-[hover=true]:dark:!bg-[#111111] group-data-[focus=true]:!bg-white group-data-[focus=true]:dark:!bg-[#111111] border border-default-200 dark:border-default-100 shadow-sm rounded-2xl h-14 text-base pr-14",
                }}
                placeholder="Enter instruction..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button
                isIconOnly
                className="absolute right-2 rounded-xl h-10 w-10 bg-primary text-primary-foreground"
                isLoading={submitting}
                type="submit"
              >
                <ArrowUp className="size-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
