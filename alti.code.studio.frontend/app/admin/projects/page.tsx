"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FolderOpen } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col h-full justify-start pt-6">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Projects
        </h1>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-500" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#161b22] shadow-sm">
        <FolderOpen className="w-12 h-12 text-neutral-350 dark:text-neutral-600 mb-4" />
        <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Projects coming soon</h2>
        <p className="text-sm text-neutral-400 dark:text-neutral-500">Workspace project configurations will be visible here.</p>
      </div>
    </div>
  );
}
