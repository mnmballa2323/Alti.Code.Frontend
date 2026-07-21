"use client";

import React, { useState } from "react";

import { useAppSelector } from "@/store";

export default function GroupChatPage() {
  const [message, setMessage] = useState("");
  const teamMembers = useAppSelector((state) => state.team.members);

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6] dark:bg-[#0d1117]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-center">
          <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800/50 px-3 py-1 rounded-full">
            Today
          </span>
        </div>

        {/* Dummy messages */}
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="flex flex-col gap-1 max-w-[80%]">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Ada Lovelace
                </span>
                <span className="text-xs text-neutral-400">10:00 AM</span>
              </div>
              <div className="text-[14px] text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#161b22] px-4 py-3 rounded-2xl rounded-tl-none border border-neutral-200 dark:border-neutral-800 shadow-sm">
                Hey everyone! Just a heads up that I'll be handling the
                escalated billing issues today.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex flex-col gap-1 max-w-[80%]">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Grace Hopper
                </span>
                <span className="text-xs text-neutral-400">10:05 AM</span>
              </div>
              <div className="text-[14px] text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#161b22] px-4 py-3 rounded-2xl rounded-tl-none border border-neutral-200 dark:border-neutral-800 shadow-sm">
                Sounds good Ada. I'm focusing on the new user onboarding
                questions. We have a lot coming in from the recent marketing
                push.
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <div className="flex flex-col gap-1 items-end max-w-[80%]">
              <div className="flex items-baseline gap-2 px-1">
                <span className="text-xs font-medium text-neutral-900 dark:text-white">
                  Me
                </span>
                <span className="text-[11px] text-neutral-500">10:15 AM</span>
              </div>
              <div className="text-[14px] text-white bg-black dark:bg-[#161b22] px-4 py-3 rounded-2xl rounded-tr-none shadow-sm">
                Perfect. I'll monitor the general queue and jump in if either of
                you get overloaded! Let's crush it today! 🚀
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="shrink-0 h-24 px-6 flex items-center bg-white dark:bg-[#161b22] border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 w-full">
          <input
            className="flex-1 h-12 px-4 rounded-xl border-none bg-neutral-100 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 placeholder:text-neutral-500"
            placeholder="Message the entire team..."
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="shrink-0 px-6 h-12 bg-black hover:bg-neutral-900 disabled:cursor-not-allowed text-white transition-colors text-sm font-bold rounded-xl flex items-center gap-2"
            disabled={!message.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
