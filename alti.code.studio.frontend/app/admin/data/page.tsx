"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Search, FileText, Trash2 } from "lucide-react";

interface KnowledgeFile {
  name: string;
  size: string;
  type: string;
}

const initialFiles: KnowledgeFile[] = [
  { name: "inso code black.png", size: "0.02 MB", type: "PNG" },
  { name: "inso code icon copy.png", size: "0.08 MB", type: "PNG" },
  { name: "Inso Code Icon.png", size: "0.33 MB", type: "PNG" },
  { name: "inso code black copy.png", size: "0.06 MB", type: "PNG" },
];

export default function KnowledgePage() {
  const [files, setFiles] = useState<KnowledgeFile[]>(initialFiles);
  const [newKnowledge, setNewKnowledge] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKnowledge.trim()) return;

    const newFile: KnowledgeFile = {
      name: newKnowledge.trim().endsWith(".png") || newKnowledge.trim().endsWith(".txt") || newKnowledge.trim().endsWith(".pdf")
        ? newKnowledge.trim()
        : `${newKnowledge.trim()}.txt`,
      size: `${(Math.random() * 0.5 + 0.01).toFixed(2)} MB`,
      type: newKnowledge.trim().split(".").pop()?.toUpperCase() || "TXT",
    };

    setFiles((prev) => [newFile, ...prev]);
    setNewKnowledge("");
  };

  const handleDelete = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col h-full justify-start pt-6">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
          Knowledge
        </h1>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100/80 hover:bg-neutral-200/80 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 border border-neutral-200/50 dark:border-neutral-700/50 rounded-xl transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="space-y-6">
        {/* Upload Row */}
        <form onSubmit={handleUpload} className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Enter new knowledge"
            value={newKnowledge}
            onChange={(e) => setNewKnowledge(e.target.value)}
            className="flex-1 h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
          />
          <button
            type="submit"
            className="h-11 px-5 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 font-semibold rounded-xl text-sm transition-all flex items-center gap-2 shrink-0 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </form>

        {/* Search Row */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search knowledge"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-white dark:bg-[#161b22] pl-11 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
          />
        </div>

        {/* File Cards List */}
        <div className="flex flex-col gap-3 pt-2">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-4 bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800/80 rounded-2xl transition-all shadow-sm hover:shadow-md/5 duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* File Icon Box */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <FileText className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">
                      {file.name}
                    </h3>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {file.size} - {file.type}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(file.name)}
                  className="p-2 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
              No files found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
