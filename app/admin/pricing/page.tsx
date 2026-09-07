"use client";

import React, { useState } from "react";

interface AIModelPricing {
  id: string;
  name: string;
  inputPrice: string;
  outputPrice: string;
  contextWindow: string;
  isDefault?: boolean;
}

const AI_MODEL_PRICING: AIModelPricing[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    inputPrice: "$0.075",
    outputPrice: "$0.30",
    contextWindow: "1M Context",
    isDefault: true,
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    inputPrice: "$1.25",
    outputPrice: "$5.00",
    contextWindow: "2M Context",
  },
  {
    id: "qwen-2.5-coder",
    name: "Qwen 2.5 Coder 32B",
    inputPrice: "$0.20",
    outputPrice: "$0.60",
    contextWindow: "128K Context",
  },
  {
    id: "deepseek-coder-v3",
    name: "DeepSeek-Coder-V3",
    inputPrice: "$0.14",
    outputPrice: "$0.28",
    contextWindow: "64K Context",
  },
  {
    id: "phi-4",
    name: "Phi-4 (MIT)",
    inputPrice: "$0.06",
    outputPrice: "$0.18",
    contextWindow: "128K Context",
  },
  {
    id: "inso-vision-ultra",
    name: "Inso Vision Ultra",
    inputPrice: "$0.10",
    outputPrice: "$0.40",
    contextWindow: "Multimodal",
  },
  {
    id: "inso-code-swarm",
    name: "Inso Code Swarm",
    inputPrice: "$0.25",
    outputPrice: "$0.80",
    contextWindow: "Autonomous DAG",
  },
  {
    id: "inso-create-img",
    name: "Inso Create Studio",
    inputPrice: "$0.04",
    outputPrice: "N/A",
    contextWindow: "ImageGen",
  },
];

export default function AdminPricingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(AI_MODEL_PRICING.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedModels = AI_MODEL_PRICING.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="w-full flex-1 flex flex-col pt-6">
      <div className="w-full flex-1 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-[40%_30%_30%] px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-lg">
          <div>MODEL NAME</div>
          <div>INPUT (PER 1M)</div>
          <div>OUTPUT (PER 1M)</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-2 mt-4">
          {paginatedModels.map((model) => (
            <div
              key={model.id}
              className="group grid grid-cols-[40%_30%_30%] items-center px-6 py-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="font-semibold text-neutral-900 dark:text-white">
                {model.name}
              </div>
              <div className="font-mono text-neutral-800 dark:text-neutral-200">
                {model.inputPrice}
              </div>
              <div className="font-mono text-neutral-800 dark:text-neutral-200">
                {model.outputPrice}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        <div className="sticky bottom-6 z-20 flex items-center justify-between h-[68px] px-6 py-4 mt-auto mb-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <div className="text-neutral-500 dark:text-neutral-400">
            Showing{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, AI_MODEL_PRICING.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {AI_MODEL_PRICING.length}
            </span>{" "}
            AI models
          </div>
          <button
            className="h-10 px-6 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-sm font-semibold rounded-lg flex items-center justify-center border border-transparent shrink-0"
            onClick={() =>
              setCurrentPage((prev) => (prev < totalPages ? prev + 1 : 1))
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
