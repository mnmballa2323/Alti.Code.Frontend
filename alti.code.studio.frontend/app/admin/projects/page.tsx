"use client";

import React from "react";
import { FolderOpen } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="w-full flex flex-col h-full justify-start pt-6">

      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#161b22] shadow-sm">
        <FolderOpen className="w-12 h-12 text-neutral-350 dark:text-neutral-600 mb-4" />
        <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
          Projects coming soon
        </h2>
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
          Workspace project configurations will be visible here.
        </p>
      </div>
    </div>
  );
}
