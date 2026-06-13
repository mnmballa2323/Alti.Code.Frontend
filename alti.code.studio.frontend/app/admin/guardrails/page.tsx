"use client";

import React, { useState } from "react";
import { Search, Trash2, Edit2, Shield } from "lucide-react";

interface GuardrailRule {
  text: string;
  type: string;
}

const initialGuardrails: GuardrailRule[] = [
  { text: "asdf", type: "GUARDRAIL RULE" },
  { text: "alksdf", type: "GUARDRAIL RULE" },
];

export default function GuardrailsPage() {
  const [guardrails, setGuardrails] =
    useState<GuardrailRule[]>(initialGuardrails);
  const [newGuardrail, setNewGuardrail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuardrail.trim()) return;

    const newRule: GuardrailRule = {
      text: newGuardrail.trim(),
      type: "GUARDRAIL RULE",
    };

    setGuardrails((prev) => [newRule, ...prev]);
    setNewGuardrail("");
  };

  const handleDelete = (index: number) => {
    setGuardrails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number, currentText: string) => {
    setEditingIndex(index);
    setEditText(currentText);
  };

  const handleSaveEdit = (index: number) => {
    if (!editText.trim()) return;
    setGuardrails((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, text: editText.trim() } : item,
      ),
    );
    setEditingIndex(null);
  };

  const filteredGuardrails = guardrails.filter((guard) =>
    guard.text.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full flex flex-col min-h-full justify-start pb-12">
      <div className="sticky top-0 z-10 bg-[#F3F4F6] dark:bg-[#0d1117] pt-2 pb-6 space-y-6 before:content-[''] before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:bg-[#F3F4F6] dark:before:bg-[#0d1117]">
        {/* Input Row */}
        <form
          className="relative flex items-center bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-1.5 shadow-sm"
          onSubmit={handleSend}
        >
          <input
            className="flex-1 bg-transparent px-4 py-2.5 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none"
            placeholder="Enter new guardrail"
            type="text"
            value={newGuardrail}
            onChange={(e) => setNewGuardrail(e.target.value)}
          />
          <button
            className="h-9 px-6 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 font-semibold rounded-xl text-sm transition-all flex items-center justify-center shrink-0 shadow-sm"
            type="submit"
          >
            Send
          </button>
        </form>

        {/* Search Row */}
        <div className="relative flex items-center bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-1 shadow-sm">
          <span className="pl-4 text-neutral-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            className="flex-1 bg-transparent pl-3 pr-4 py-2.5 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none"
            placeholder="Search guardrails"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Guardrails Card List */}
      <div className="flex flex-col gap-3 pt-2">
        {filteredGuardrails.length > 0 ? (
            filteredGuardrails.map((guard, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl transition-all shadow-sm duration-200"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Icon Box */}
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pr-4">
                    {editingIndex === index ? (
                      <div className="flex gap-2 items-center">
                        <input
                          autoFocus
                          className="flex-1 h-9 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 rounded-lg text-sm focus:outline-none text-neutral-800 dark:text-neutral-200"
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <button
                          className="px-3 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors"
                          onClick={() => handleSaveEdit(index)}
                        >
                          Save
                        </button>
                        <button
                          className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
                          onClick={() => setEditingIndex(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-neutral-800 dark:text-white text-[15px]">
                          {guard.text}
                        </h3>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold tracking-wider mt-0.5">
                          {guard.type}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {editingIndex !== index && (
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                      onClick={() => handleStartEdit(index, guard.text)}
                    >
                      <Edit2 className="w-4 h-4 text-neutral-400" />
                    </button>
                    <button
                      className="p-2 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                      onClick={() => handleDelete(index)}
                    >
                      <Trash2 className="w-4 h-4 text-neutral-400" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
              No guardrails configured.
            </div>
          )}
        </div>
    </div>
  );
}
