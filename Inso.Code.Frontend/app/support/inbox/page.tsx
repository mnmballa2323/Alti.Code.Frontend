"use client";

import React, { useState, useEffect } from "react";
import { Search, MailOpen, CheckCircle } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store";
import { setActiveThreadSubject } from "@/store/uiSlice";
import { addReply } from "@/store/ticketSlice";

export default function SupportInboxPage() {
  const dispatch = useAppDispatch();
  const tickets = useAppSelector((state) => state.tickets.tickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    tickets[0]?.id || null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const filteredTickets = tickets.filter(
    (t) =>
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.messages.some((m) =>
        m.text.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  useEffect(() => {
    if (selectedTicket) {
      dispatch(setActiveThreadSubject(selectedTicket.subject));
    } else {
      dispatch(setActiveThreadSubject(null));
    }

    return () => {
      dispatch(setActiveThreadSubject(null));
    };
  }, [selectedTicket, dispatch]);

  const handleResolve = () => {
    if (!selectedTicket) return;
    // Dispatch resolve action if implemented later
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicketId) return;

    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      dispatch(
        addReply({
          ticketId: selectedTicketId,
          message: {
            id: Date.now().toString(),
            senderType: "support",
            senderName: "Support Team",
            text: replyText,
            date: "Just now",
          },
        }),
      );
      setIsSending(false);
      setReplyText("");
    }, 500);
  };

  return (
    <div className="flex w-full h-[calc(100vh-56px)] bg-[#F3F4F6] dark:bg-[#0d1117]">
      {/* Left Column: Thread List */}
      <div className="w-72 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161b22] flex flex-col h-full">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
              placeholder="Search tickets..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`p-4 border-b border-neutral-100 dark:border-neutral-800/50 cursor-pointer transition-colors ${selectedTicketId === ticket.id ? "bg-neutral-50 dark:bg-neutral-800/50" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/30"}`}
              onClick={() => setSelectedTicketId(ticket.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate pr-2">
                  {ticket.customerName}
                </span>
                <span className="text-[11px] text-neutral-500 whitespace-nowrap">
                  {ticket.date}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="font-medium text-[13px] text-neutral-800 dark:text-neutral-200 truncate pr-4">
                  {ticket.subject.replace(/^Re:\s*/i, "")}
                </div>
              </div>
            </div>
          ))}
          {filteredTickets.length === 0 && (
            <div className="p-8 text-center text-sm text-neutral-500">
              No tickets found.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Ticket Detail */}
      <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] dark:bg-[#0d1117]">
        {selectedTicket ? (
          <>
            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {selectedTicket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.senderType === "support" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex flex-col gap-1 max-w-[85%] ${msg.senderType === "support" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[12px] font-medium text-neutral-900 dark:text-neutral-100">
                        {msg.senderName}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {msg.date}
                      </span>
                    </div>
                    <div
                      className={`p-4 shadow-sm ${msg.senderType === "support" ? "bg-black text-white rounded-2xl rounded-tr-none" : "bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl rounded-tl-none"}`}
                    >
                      <p
                        className={`text-[14px] leading-relaxed ${msg.senderType === "support" ? "text-white" : "text-neutral-700 dark:text-neutral-300"} whitespace-pre-wrap`}
                      >
                        {msg.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Area */}
            <div className="shrink-0 p-6 bg-white dark:bg-[#161b22] border-t border-neutral-200 dark:border-neutral-800">
              {selectedTicket.status === "Open" ? (
                <div className="flex items-center gap-3">
                  <input
                    className="flex-1 h-12 px-4 rounded-xl border-none bg-neutral-100 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 placeholder:text-neutral-500"
                    placeholder="Write your reply here..."
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendReply();
                      }
                    }}
                  />
                  <button
                    className="shrink-0 px-6 h-12 bg-black hover:bg-neutral-900 disabled:cursor-not-allowed text-white transition-colors text-sm font-bold rounded-xl flex items-center gap-2"
                    disabled={!replyText.trim() || isSending}
                    onClick={handleSendReply}
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              ) : (
                <div className="text-center text-sm text-neutral-500 py-4 flex flex-col items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500 mb-1" />
                  This ticket has been marked as resolved.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
            <MailOpen className="w-12 h-12 mb-4 opacity-50" />
            <p>Select a ticket to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
