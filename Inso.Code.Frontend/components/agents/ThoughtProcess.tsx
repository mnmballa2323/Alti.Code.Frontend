"use client";

import React from "react";

type Step = {
  title: string;
  agent: string;
  reasoning: string;
  status: "pending" | "running" | "completed" | "failed";
};

type ThoughtProcessProps = {
  plan?: {
    goal: string;
    strategy: string;
    steps: Step[];
  };
  feedback?: {
    message: string;
    severity: "low" | "medium" | "high";
  }[];
};

export default function ThoughtProcess({
  plan,
  feedback,
}: ThoughtProcessProps) {
  if (!plan) return null;

  return (
    <div className="bg-gray-800 border-l-4 border-purple-500 p-4 rounded-r-lg my-4 animate-in fade-in slide-in-from-top-4 duration-700">
      <h3 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
        <span>🧠</span>
        System 2 Reasoning
      </h3>

      <div className="mb-4">
        <span className="text-gray-400 text-xs uppercase tracking-wider">
          Strategy
        </span>
        <p className="text-gray-200">{plan.strategy}</p>
      </div>

      <div className="space-y-3">
        {plan.steps.map((step, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 bg-gray-900/50 p-2 rounded"
          >
            <div className="mt-1 w-2 h-2 rounded-full bg-purple-500/50" />
            <div>
              <span className="text-cyan-400 font-mono text-sm">
                [{step.agent}]
              </span>
              <strong className="text-gray-200 ml-2">{step.title}</strong>
              <p className="text-gray-500 text-xs mt-1 italic">
                "{step.reasoning}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {feedback && feedback.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <span className="text-red-400 text-xs uppercase tracking-wider">
            Critic Feedback
          </span>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            {feedback.map((f, i) => (
              <li
                key={i}
                className={`text-xs ${f.severity === "high" ? "text-red-400 font-bold" : "text-yellow-400"}`}
              >
                {f.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
