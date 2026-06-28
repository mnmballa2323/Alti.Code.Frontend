"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  RefreshCw,
  Sliders,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import { Button, Card, Input, Chip, Tooltip, Spinner } from "@heroui/react";

import { TuningTabs } from "@/components/tuning-tabs";
import ChatBotLayout from "@/components/ChatbotLayout";

const PRESET_GUARDRAILS = [
  {
    text: "Never hardcode secrets, passwords, tokens, or private access keys.",
    label: "No Hardcoded Keys",
  },
  {
    text: "Never execute raw SQL queries directly; always use parameterized queries.",
    label: "No Raw SQL",
  },
  {
    text: "Strictly validate and sanitize all user input values at application boundaries.",
    label: "Validate Inputs",
  },
  {
    text: "Avoid direct state mutations; return complete new copies on modifications.",
    label: "No State Mutation",
  },
  {
    text: "Do not leak detailed stack traces or debug payloads in response envelopes.",
    label: "Scrub Exceptions",
  },
];

export default function GuardrailsPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  const [instructions, setInstructions] = useState<
    { id: string; name: string }[]
  >([]);
  const [guardrails, setGuardrails] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load rules on mount
  const fetchRules = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.success) {
        setInstructions(res.data.data.instructions || []);
        setGuardrails(res.data.data.guardrails || []);
      }
    } catch (err) {
      console.error("Failed to fetch guardrails:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [token]);

  // Synchronize rules to backend helper
  const saveRules = async (updatedGr: { id: string; name: string }[]) => {
    if (!token) return;
    try {
      await axios.post(
        `${API_URL}/rules`,
        {
          instructions,
          guardrails: updatedGr,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // Dispatch event to sync sidebar changes instantly
      window.dispatchEvent(new CustomEvent("refresh-rules-sidebar"));
    } catch (err) {
      console.error("Failed to save rules:", err);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    setSubmitting(true);
    let updated: { id: string; name: string }[] = [];

    if (editingId) {
      updated = guardrails.map((i) =>
        i.id === editingId ? { ...i, name: inputValue.trim() } : i,
      );
      setEditingId(null);
    } else {
      updated = [
        ...guardrails,
        { id: "gr-" + Date.now(), name: inputValue.trim() },
      ];
    }

    setGuardrails(updated);
    setInputValue("");
    await saveRules(updated);
    setSubmitting(false);
  };

  const deleteGuardrail = async (id: string) => {
    const updated = guardrails.filter((i) => i.id !== id);

    setGuardrails(updated);
    await saveRules(updated);
  };

  const editGuardrail = (id: string, currentText: string) => {
    setEditingId(id);
    setInputValue(currentText);
  };

  const addPreset = async (presetText: string) => {
    if (guardrails.some((g) => g.name === presetText)) return;
    setSubmitting(true);
    const updated = [
      ...guardrails,
      { id: "gr-" + Date.now(), name: presetText },
    ];

    setGuardrails(updated);
    await saveRules(updated);
    setSubmitting(false);
  };

  return (
    <ChatBotLayout>
      <div className="flex flex-col h-full bg-default-50 dark:bg-[#0A0A0A]">
        {/* Top Navbar */}
        <div className="flex items-center w-full h-14 px-8 border-b border-default-100 bg-white dark:bg-[#111111]">
          <TuningTabs />
        </div>
        <div className="flex-1 overflow-y-auto p-8 font-sans scrollbar-hide">
          <div className="flex flex-col items-center justify-start min-h-full w-full py-6">
            <div className="w-full max-w-4xl space-y-6">

            {/* Header section */}
            <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-default-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    System Guardrails
                  </h1>
                  <p className="text-xs text-default-500 mt-0.5">
                    Define active boundaries, validation requirements, and
                    security limitations to prevent bugs and code issues.
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                className="text-default-400 hover:text-foreground rounded-xl"
                variant="light"
                onClick={fetchRules}
              >
                <RefreshCw className="size-4" />
              </Button>
            </div>

            {/* Composer Box */}
            <Card className="p-6 border border-default-200 bg-white dark:bg-[#111111] rounded-3xl shadow-sm">
              <form className="space-y-4" onSubmit={handleSend}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-default-600 dark:text-default-400 uppercase tracking-wider">
                    {editingId ? "Edit Guardrail" : "Compose Guardrail"}
                  </span>
                  {editingId && (
                    <Button
                      className="h-6 rounded-lg text-xs"
                      color="danger"
                      size="sm"
                      variant="light"
                      onClick={() => {
                        setEditingId(null);
                        setInputValue("");
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Input
                    classNames={{
                      inputWrapper:
                        "bg-[#F4F4F6] dark:bg-default-50 hover:bg-[#e4e4e7] dark:hover:bg-default-100/50 focus-within:bg-[#F4F4F6] shadow-none rounded-2xl border-none h-12",
                    }}
                    placeholder="Enter guardrails (e.g., 'Never hardcode secrets', 'Must validate parameters')"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Button
                    className="h-12 px-6 rounded-2xl font-semibold shadow-sm shrink-0 flex items-center gap-2"
                    color="primary"
                    isLoading={submitting}
                    type="submit"
                  >
                    {editingId ? "Update" : "Add"} <Plus className="size-4" />
                  </Button>
                </div>

                {/* Presets Grid */}
                <div className="space-y-2 pt-2 border-t border-default-100/50">
                  <span className="text-[10px] text-default-400 font-semibold uppercase tracking-wider block">
                    Enterprise Security presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_GUARDRAILS.map((preset, idx) => (
                      <Chip
                        key={idx}
                        avatar={
                          <Sparkles className="size-3 text-rose-500 shrink-0" />
                        }
                        className="cursor-pointer bg-[#F4F4F6] dark:bg-default-50 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 border-none text-default-600 dark:text-gray-300 transition-colors text-[11px] font-medium py-3 rounded-lg"
                        onClick={() => addPreset(preset.text)}
                      >
                        {preset.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              </form>
            </Card>

            {/* Guardrails Listing */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-default-600 dark:text-default-400 uppercase tracking-wider">
                  Active Guardrails ({guardrails.length})
                </span>
                <span className="text-[10px] text-default-400 flex items-center gap-1 font-medium">
                  <Sliders className="size-3" /> Auto-saved & synced instantly
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111111] rounded-3xl border border-default-200">
                  <Spinner color="primary" />
                  <span className="text-xs text-default-500 mt-2">
                    Loading codebase guardrails...
                  </span>
                </div>
              ) : guardrails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#111111] rounded-3xl border border-default-200 p-6">
                  <Shield className="size-12 text-default-200 mb-4" />
                  <h3 className="text-sm font-semibold text-foreground">
                    No Guardrails Configured
                  </h3>
                  <p className="text-xs text-default-400 max-w-sm mt-1">
                    System guardrails set strict limits on coding swarms to
                    enforce security standards, prevent key leaks, and ensure
                    clean API design.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {guardrails.map((gr, index) => (
                    <Card
                      key={gr.id}
                      className="p-5 border border-default-200 bg-white dark:bg-[#111111] hover:border-rose-200/50 dark:hover:border-rose-950/20 transition-all rounded-2xl shadow-sm flex flex-row items-start justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl shrink-0 mt-0.5">
                          <AlertTriangle className="size-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-default-400 font-semibold uppercase tracking-wider">
                              GUARD-{String(index + 1).padStart(2, "0")}
                            </span>
                            <Chip
                              className="text-[9px] uppercase font-bold tracking-wider h-4 border-none px-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-500"
                              color="danger"
                              size="sm"
                              variant="flat"
                            >
                              Enforced
                            </Chip>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed font-medium">
                            {gr.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip
                          classNames={{
                            content:
                              "bg-black text-white text-xs py-1 px-2 rounded-md shadow-lg",
                          }}
                          content="Edit Guardrail"
                        >
                          <Button
                            isIconOnly
                            className="rounded-lg text-default-400 hover:text-primary"
                            size="sm"
                            variant="light"
                            onClick={() => editGuardrail(gr.id, gr.name)}
                          >
                            <Edit3 className="size-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip
                          classNames={{
                            content:
                              "bg-black text-white text-xs py-1 px-2 rounded-md shadow-lg",
                          }}
                          content="Delete Guardrail"
                        >
                          <Button
                            isIconOnly
                            className="rounded-lg text-default-400 hover:text-danger"
                            size="sm"
                            variant="light"
                            onClick={() => deleteGuardrail(gr.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </Tooltip>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
