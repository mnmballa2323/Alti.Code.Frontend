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
  };

  return (
    <div className="w-full pt-6">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div>
          <input
            required
            className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
            id="subject"
            placeholder="Message Title"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div>
          <textarea
            required
            className="w-full min-h-[250px] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm resize-y"
            id="message"
            placeholder="Enter Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 mt-2 w-full">
          <button
            className="w-full px-5 py-3.5 bg-black hover:bg-neutral-900 text-white transition-colors text-[13px] font-bold rounded-xl flex items-center justify-center"
            type="submit"
          >
            Send Message
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {submitted && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSubmitted(false)}
        >
          <div 
            className="bg-white dark:bg-[#161b22] w-[380px] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <h3 className="text-[17px] font-bold text-neutral-900 dark:text-white mb-1.5">
                Message Sent
              </h3>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
                Our team will contact you within 48 hours
              </p>
            </div>
            <div className="flex border-t border-neutral-200 dark:border-neutral-700">
              <button
                className="flex-1 py-3 text-[15px] font-normal text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                onClick={() => setSubmitted(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
