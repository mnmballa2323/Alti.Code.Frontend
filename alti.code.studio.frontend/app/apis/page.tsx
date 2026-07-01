"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowUp } from "lucide-react";
import axios from "axios";
import { Button, Input } from "@heroui/react";

import { TuningTabs } from "@/components/tuning-tabs";
import ChatBotLayout from "@/components/ChatbotLayout";

export default function APIsPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  const [apis, setApis] = useState<{ id: string; name: string }[]>([]);
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
        setApis(res.data.data.apis || []);
      }
    } catch (err) {
      console.error("Failed to fetch APIs:", err);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [token]);

  // Save to backend
  const saveRules = async (updatedApis: { id: string; name: string }[]) => {
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
          apis: updatedApis,
          sdks: data.sdks || [],
          mcps: data.mcps || [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      window.dispatchEvent(
        new CustomEvent("refresh-rules-sidebar", {
          detail: { ...data, apis: updatedApis },
        }),
      );
    } catch (err) {
      console.error("Failed to save APIs:", err);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    setSubmitting(true);
    const updated = [
      ...apis,
      { id: "api-" + Date.now(), name: inputValue.trim() },
    ];

    setApis(updated);
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
            <form className="relative flex items-center w-full shadow-sm rounded-2xl" onSubmit={handleSend}>
              <Input
                classNames={{
                  inputWrapper:
                    "!bg-white dark:!bg-[#111111] data-[hover=true]:!bg-white data-[hover=true]:dark:!bg-[#111111] group-data-[focus=true]:!bg-white group-data-[focus=true]:dark:!bg-[#111111] border border-default-200 dark:border-default-100 shadow-sm rounded-2xl h-14 text-base pr-14",
                }}
                placeholder="Enter an API endpoint URL..."
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
