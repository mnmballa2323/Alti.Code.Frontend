"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Trash2, Edit2 } from "lucide-react";

interface InstructionRule {
  text: string;
  type: string;
}

const initialInstructions: InstructionRule[] = [
  { text: "do not steal", type: "INSTRUCTION RULE" },
  { text: "do not lie", type: "INSTRUCTION RULE" },
  { text: "make it good", type: "INSTRUCTION RULE" },
];

export default function InstructionsPage() {
  const [instructions, setInstructions] = useState<InstructionRule[]>(initialInstructions);
  const [newInstruction, setNewInstruction] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstruction.trim()) return;

    const newRule: InstructionRule = {
      text: newInstruction.trim(),
      type: "INSTRUCTION RULE",
    };

    setInstructions((prev) => [...prev, newRule]);
    setNewInstruction("");
  };

  const handleDelete = (index: number) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number, currentText: string) => {
    setEditingIndex(index);
    setEditText(currentText);
  };

  const handleSaveEdit = (index: number) => {
    if (!editText.trim()) return;
    setInstructions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, text: editText.trim() } : item))
    );
    setEditingIndex(null);
  };

  const filteredInstructions = instructions.filter((inst) =>
    inst.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col h-full justify-start pt-6">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Instructions
        </h1>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-500" />
          Back to Dashboard
        </Link>
      </div>

      <div className="space-y-6">
        {/* Input Row */}
        <form onSubmit={handleSend} className="relative flex items-center bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-1.5 shadow-sm">
          <input
            type="text"
            placeholder="Enter new instruction"
            value={newInstruction}
            onChange={(e) => setNewInstruction(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2.5 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="h-9 px-6 bg-[#7e7e82] hover:bg-[#6c6c70] dark:bg-[#48484a] dark:hover:bg-[#545456] text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center shrink-0 shadow-sm"
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
            type="text"
            placeholder="Search instructions"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent pl-3 pr-4 py-2.5 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none"
          />
        </div>

        {/* Instructions Card List */}
        <div className="flex flex-col gap-3 pt-2">
          {filteredInstructions.length > 0 ? (
            filteredInstructions.map((inst, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl transition-all shadow-sm duration-200"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Icon Box */}
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-mono text-sm font-bold shrink-0">
                    &gt;_
                  </div>
                  <div className="flex-1 pr-4">
                    {editingIndex === index ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 h-9 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 rounded-lg text-sm focus:outline-none text-neutral-800 dark:text-neutral-200"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(index)}
                          className="px-3 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold rounded-lg hover:bg-neutral-205 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-neutral-800 dark:text-white text-[15px]">
                          {inst.text}
                        </h3>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold tracking-wider mt-0.5">
                          {inst.type}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {editingIndex !== index && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(index, inst.text)}
                      className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-neutral-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-neutral-400" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
              No instructions configured.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
