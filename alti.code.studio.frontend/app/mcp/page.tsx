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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface Mcp {
  id: string;
  name: string;
}

export default function McpPage() {
  const { data: session } = useSession();
  const project = useActiveProject();
  const agentId = project?.id ?? null;

  const [mcps, setMcps] = useState<Mcp[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const placeholder = project
    ? `MCP server for ${project.name}…`
    : "Enter an MCP server URL...";

  // Load on mount / when agentId changes
  useEffect(() => {
    if (!agentId) return;

    // Load from local storage first
    const local = readProjectData(agentId, "rules", { mcps: [] }) as Record<string, unknown>;
    if (Array.isArray(local?.mcps)) {
      setMcps(local.mcps as Mcp[]);
    }

    // Then try backend
    axios
      .get(`${API_URL}/rules?agentId=${agentId}`)
      .then((res) => {
        const data = res.data as Record<string, unknown>;
        if (Array.isArray(data?.mcps)) {
          setMcps(data.mcps as Mcp[]);
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

    const newMcp: Mcp = {
      id: `mcp-${Date.now()}`,
      name: trimmed,
    };

    const updated = [...mcps, newMcp];
    setMcps(updated);
    setInputValue("");

    const existing = readProjectData(agentId, "rules", {}) as Record<string, unknown>;
    const updatedRules = {
      ...existing,
      mcps: updated,
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
