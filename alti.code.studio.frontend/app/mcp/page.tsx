"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowUp } from "lucide-react";
import axios from "axios";
import { Button, Input } from "@heroui/react";

import { TuningTabs } from "@/components/tuning-tabs";
import ChatBotLayout from "@/components/ChatbotLayout";

export default function MCPPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  const [mcps, setMcps] = useState<{ id: string; name: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load rules on mount
  const fetchRules = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.success) {
        setMcps(res.data.data.mcps || []);
      }
    } catch (err) {
      console.error("Failed to fetch MCP servers:", err);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [token]);

  // Save to backend
  const saveRules = async (updatedMcps: { id: string; name: string }[]) => {
    if (!token) return;
    try {
      const current = await axios.get(`${API_URL}/rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = current.data?.data || {};

      await axios.post(
        `${API_URL}/rules`,
        {
          instructions: data.instructions || [],
          guardrails: data.guardrails || [],
          repositories: data.repositories || [],
          apis: data.apis || [],
          sdks: data.sdks || [],
          mcps: updatedMcps,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      window.dispatchEvent(
        new CustomEvent("refresh-rules-sidebar", {
          detail: { ...data, mcps: updatedMcps },
        }),
      );
    } catch (err) {
      console.error("Failed to save MCP servers:", err);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    setSubmitting(true);
    const updated = [
      ...mcps,
      { id: "mcp-" + Date.now(), name: inputValue.trim() },
    ];

    setMcps(updated);
    setInputValue("");
    await saveRules(updated);
    setSubmitting(false);
  };

  return (
    <ChatBotLayout>
      <div className="flex flex-col h-full bg-default-100 dark:bg-default-50">
        <div className="flex-1 overflow-y-auto p-8 font-sans scrollbar-hide flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl flex flex-col items-center gap-4 mb-8">
            <TuningTabs />
          </div>
          <div className="w-full max-w-2xl mb-14">
            <form className="relative flex items-center w-full shadow-sm rounded-2xl" onSubmit={handleSend}>
              <Input
                classNames={{
                  inputWrapper:
                    "!bg-white dark:!bg-[#111111] data-[hover=true]:!bg-white data-[hover=true]:dark:!bg-[#111111] group-data-[focus=true]:!bg-white group-data-[focus=true]:dark:!bg-[#111111] border border-default-200 dark:border-default-100 shadow-sm rounded-2xl h-14 text-base pr-14",
                }}
                placeholder="Enter an MCP server URL..."
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
