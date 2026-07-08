"use client";

import React, { useState } from "react";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    
    // In a real app, you would send this to your backend/support system
    console.log({ subject, message });
    setSubmitted(true);
    setSubject("");
    setMessage("");
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mt-4">
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
            Contact Support
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            Need help? Send us a message and we'll get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="subject" className="text-[13px] font-semibold text-neutral-900 dark:text-white">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-11 px-3 bg-white dark:bg-[#0d1117] border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-shadow"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-[13px] font-semibold text-neutral-900 dark:text-white">
                Message
              </label>
              <textarea
                id="message"
                placeholder="Enter message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full min-h-[150px] p-3 bg-white dark:bg-[#0d1117] border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-shadow resize-y"
                required
              />
            </div>

            <div className="mt-2 flex items-center gap-4">
              <button
                type="submit"
                disabled={!subject.trim() || !message.trim()}
                className="h-11 px-6 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Message
              </button>
              
              {submitted && (
                <span className="text-sm font-medium text-green-600 dark:text-green-400 animate-in fade-in duration-300">
                  Message sent successfully!
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
