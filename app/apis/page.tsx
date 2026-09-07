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
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

interface Api {
  id: string;
  name: string;
}

export default function ApisPage() {
  const { data: session } = useSession();
  const project = useActiveProject();
  const agentId = project?.id ?? null;

  const [apis, setApis] = useState<Api[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const placeholder = "Enter API link...";

  // Load on mount / when agentId changes
  useEffect(() => {
    if (!agentId) return;

    // Load from local storage first
    const local = readProjectData(agentId, "rules", { apis: [] }) as Record<
      string,
      unknown
    >;

    if (Array.isArray(local?.apis)) {
      setApis(local.apis as Api[]);
    }

    // Then try backend
    axios
      .get(`${API_URL}/rules?agentId=${agentId}`)
      .then((res) => {
        const data = res.data as Record<string, unknown>;

        if (Array.isArray(data?.apis)) {
          setApis(data.apis as Api[]);
        }
      })
      .catch(() => {
        // Backend unavailable — local data already loaded
      });
  }, [agentId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();

    if (!trimmed || !agentId) return;

    setSubmitting(true);

    const newApi: Api = {
      id: `api-${Date.now()}`,
      name: trimmed,
    };

    const updated = [...apis, newApi];

    setApis(updated);
    setInputValue("");

    const existing = readProjectData(agentId, "rules", {}) as Record<
      string,
      unknown
    >;
    const updatedRules = {
      ...existing,
      apis: updated,
    };

    writeProjectData(agentId, "rules", updatedRules);

    try {
      await axios.post(`${API_URL}/rules?agentId=${agentId}`, updatedRules);
    } catch {
      // Backend unavailable — data persisted locally
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ChatBotLayout>
      <div className="flex flex-col h-full bg-default-100 dark:bg-default-50">
        <div className="flex-1 overflow-y-auto p-8 font-sans scrollbar-hide flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl mb-14">
            <div className="flex justify-center mb-6">
              <TuningTabs />
            </div>
            <form
              className="relative flex items-center w-full shadow-sm rounded-2xl"
              onSubmit={handleSend}
            >
              <Input
                classNames={{
                  inputWrapper:
                    "!bg-white dark:!bg-[#111111] data-[hover=true]:!bg-white data-[hover=true]:dark:!bg-[#111111] group-data-[focus=true]:!bg-white group-data-[focus=true]:dark:!bg-[#111111] border border-default-200 dark:border-default-100 shadow-sm rounded-2xl h-14 text-base pr-14",
                }}
                placeholder={placeholder}
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
