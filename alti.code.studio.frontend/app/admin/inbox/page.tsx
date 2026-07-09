"use client";

import React, { useState, useEffect } from "react";
import { Search, MailOpen, CheckCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { setActiveThreadSubject } from "@/store/uiSlice";

type Message = {
  id: string;
  senderName: string;
  text: string;
  isMe: boolean;
  date: string;
};

type Thread = {
  id: string;
  senderName: string;
  subject: string;
  messages: Message[];
  status: "Open" | "Resolved";
  date: string;
};

const DUMMY_THREADS: Thread[] = [
  {
    id: "msg-1",
    senderName: "Inso Code",
    subject: "Re: Help with billing details",
    messages: [
      {
        id: "m1",
        senderName: "Me",
        text: "I need to update my credit card on file but I can't find where to do it. Can you help me navigate to the right section? I looked under settings but didn't see an option for payment methods.",
        isMe: true,
        date: "2 hours ago"
      },
      {
        id: "m2",
        senderName: "Inso Code",
        text: "Hi there,\n\nThanks for reaching out! You can update your payment method by going to the Billing tab on the sidebar and clicking on 'Update Payment Method'. Let me know if you still have trouble finding it.\n\nBest,\nSupport Team",
        isMe: false,
        date: "1 hour ago"
      }
    ],
    status: "Open",
    date: "1 hour ago"
  },
  {
    id: "msg-2",
    senderName: "Inso Code",
    subject: "Welcome to Inso Code!",
    messages: [
      {
        id: "m3",
        senderName: "Inso Code",
        text: "Welcome to your new workspace! We're thrilled to have you on board. If you need any help getting set up, you can always reach out via the Support tab.",
        isMe: false,
        date: "2 weeks ago"
      }
    ],
    status: "Resolved",
    date: "2 weeks ago"
  }
];

export default function TenantInboxPage() {
  const dispatch = useDispatch();
  const [threads, setThreads] = useState<Thread[]>(DUMMY_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(DUMMY_THREADS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const filteredThreads = threads.filter(t => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedThread = threads.find(t => t.id === selectedThreadId) || null;

  useEffect(() => {
    if (selectedThread) {
      dispatch(setActiveThreadSubject(selectedThread.subject));
    } else {
      dispatch(setActiveThreadSubject(null));
    }
    
    return () => {
      dispatch(setActiveThreadSubject(null));
    };
  }, [selectedThread, dispatch]);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderName: "Me",
        text: replyText,
        isMe: true,
        date: "Just now"
      };
      
      setThreads(prev => prev.map(t => {
        if (t.id === selectedThreadId) {
          return {
            ...t,
            messages: [...t.messages, newMessage],
            date: "Just now"
          };
        }
        return t;
      }));
      setReplyText("");
      setIsSending(false);
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
              type="text"
              placeholder="Search inbox..."
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.map(thread => (
            <div 
              key={thread.id}
              onClick={() => setSelectedThreadId(thread.id)}
              className={`p-4 border-b border-neutral-100 dark:border-neutral-800/50 cursor-pointer transition-colors ${selectedThreadId === thread.id ? 'bg-neutral-50 dark:bg-neutral-800/50' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/30'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[13px] text-neutral-900 dark:text-white truncate pr-2">
                  {thread.subject.replace(/^Re:\s*/i, "")}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-neutral-500 whitespace-nowrap">
                    {thread.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filteredThreads.length === 0 && (
            <div className="p-8 text-center text-sm text-neutral-500">
              No messages found.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Thread Detail */}
      <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] dark:bg-[#0d1117]">
        {selectedThread ? (
          <>
            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {selectedThread.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col gap-1 max-w-[85%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[12px] font-medium text-neutral-900 dark:text-neutral-100">{msg.senderName}</span>
                      <span className="text-[11px] text-neutral-500">{msg.date}</span>
                    </div>
                    <div className={`p-4 shadow-sm ${msg.isMe ? 'bg-black text-white rounded-2xl rounded-tr-none' : 'bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl rounded-tl-none'}`}>
                      <p className={`text-[14px] leading-relaxed ${msg.isMe ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'} whitespace-pre-wrap`}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Area */}
            <div className="shrink-0 p-6 bg-white dark:bg-[#161b22] border-t border-neutral-200 dark:border-neutral-800">
              {selectedThread.status === "Open" ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendReply();
                      }
                    }}
                    placeholder="Write your reply here..."
                    className="flex-1 h-12 px-4 rounded-xl border-none bg-neutral-100 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 placeholder:text-neutral-500"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || isSending}
                    className="shrink-0 px-6 h-12 bg-black hover:bg-neutral-900 disabled:cursor-not-allowed text-white transition-colors text-sm font-bold rounded-xl flex items-center gap-2"
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              ) : (
                <div className="text-center text-sm text-neutral-500 py-4 flex flex-col items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-neutral-400 mb-1" />
                  This conversation has been closed.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
            <MailOpen className="w-12 h-12 mb-4 opacity-50" />
            <p>Select a message to view</p>
          </div>
        )}
      </div>
    </div>
  );
}
