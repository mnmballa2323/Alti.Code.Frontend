"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store";
import { updateMemberStatus } from "@/store/teamSlice";
import { Send, UserCircle, MoreVertical, Phone, Video, Paperclip, Image as ImageIcon } from "lucide-react";

export default function TeamChatPage() {
  const { memberId } = useParams() as { memberId: string };
  const teamMembers = useAppSelector((state) => state.team.members);
  const dispatch = useAppDispatch();
  const member = teamMembers.find((m) => m.id === memberId);
  const [message, setMessage] = useState("");

  if (!member) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F3F4F6] dark:bg-[#0d1117] h-full">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Team Member Not Found</h2>
        <p className="text-neutral-500 mt-2 text-center max-w-sm">
          The team member you are trying to reach might have been removed or doesn't exist.
        </p>
      </div>
    );
  }

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
                  {member.name}
                </span>
                <span className="text-xs text-neutral-400">10:42 AM</span>
              </div>
              <div className="text-[14px] text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#161b22] px-4 py-3 rounded-2xl rounded-tl-none border border-neutral-200 dark:border-neutral-800 shadow-sm">
                Hey! Just wanted to let you know I've caught up on all the pending support tickets from this morning. Let me know if you need help with anything else.
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <div className="flex flex-col gap-1 items-end max-w-[80%]">
              <div className="flex items-baseline gap-2 px-1">
                <span className="text-xs font-medium text-neutral-900 dark:text-white">Me</span>
                <span className="text-[11px] text-neutral-500">10:45 AM</span>
              </div>
              <div className="text-[14px] text-white bg-black dark:bg-[#161b22] px-4 py-3 rounded-2xl rounded-tr-none shadow-sm">
                Awesome, thanks {member.name.split(" ")[0]}! I'll take a look at the new feature requests that came in overnight.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="shrink-0 h-24 px-6 flex items-center bg-white dark:bg-[#161b22] border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 w-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your reply here..."
            className="flex-1 h-12 px-4 rounded-xl border-none bg-neutral-100 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 placeholder:text-neutral-500"
          />
          <button
            disabled={!message.trim()}
            className="shrink-0 px-6 h-12 bg-black hover:bg-neutral-900 disabled:cursor-not-allowed text-white transition-colors text-sm font-bold rounded-xl flex items-center gap-2"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
