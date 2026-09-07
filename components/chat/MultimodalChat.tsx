"use client";

import React, { useState, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface MultimodalChatProps {
  sessionId?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
}

export default function MultimodalChat({
  sessionId = "multimodal-default",
}: MultimodalChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<{
    base64: string;
    mimeType: string;
    preview: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");

      return;
    }
    const reader = new FileReader();

    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      // DataURL: "data:image/png;base64,<base64>"
      const [header, base64] = dataUrl.split(",");
      const mimeType = header.replace("data:", "").replace(";base64", "");

      setImage({ base64, mimeType, preview: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const send = async () => {
    const text = input.trim();

    if (!text && !image) return;

    const userMsg: Message = {
      role: "user",
      content: text || "(image)",
      imagePreview: image?.preview,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      let reply: string;

      if (image) {
        // Multimodal: send image + text
        const res = await fetch(`${API_BASE}/gemini/multimodal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64Image: image.base64,
            mimeType: image.mimeType,
            textPrompt: text || "Describe this image in detail.",
            sessionId,
          }),
        });
        const textData = await res.text();
        const data = textData ? JSON.parse(textData) : {};

        reply = data.reply || data.error || "No reply.";
        setImage(null);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        // Text-only chat
        const res = await fetch(`${API_BASE}/gemini/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text, sessionId }),
        });
        const textData = await res.text();
        const data = textData ? JSON.parse(textData) : {};

        reply = data.reply || data.error || "No reply.";
      }
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-700/40 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <span className="text-4xl mb-3">🖼️</span>
            <p className="text-sm">
              Send a message or attach an image to analyze
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-violet-600/30 text-violet-100 border border-violet-500/30"
                  : "bg-slate-800/80 text-slate-200 border border-slate-700/50"
              }`}
            >
              {msg.imagePreview && (
                <img
                  alt="uploaded"
                  className="max-h-40 rounded-lg mb-2 object-contain"
                  src={msg.imagePreview}
                />
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 bg-red-900/30 border border-red-500/40 text-red-400 rounded-xl p-3 text-xs flex justify-between">
          {error} <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Image preview */}
      {image && (
        <div className="mx-4 mb-2 flex items-center gap-3 bg-slate-800/60 border border-slate-700/40 rounded-xl p-3">
          <img
            alt="preview"
            className="h-14 w-14 object-cover rounded-lg"
            src={image.preview}
          />
          <div className="flex-1 min-w-0">
            <p className="text-slate-300 text-xs truncate">{image.mimeType}</p>
            <p className="text-slate-500 text-xs">
              {Math.round((image.base64.length * 0.75) / 1024)} KB
            </p>
          </div>
          <button
            className="text-slate-400 hover:text-red-400 transition-colors text-lg"
            onClick={clearImage}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="p-4 border-t border-slate-700/40 flex gap-2 items-end">
        <input
          ref={fileRef}
          accept="image/*"
          className="hidden"
          type="file"
          onChange={handleFile}
        />
        <button
          className={`p-2.5 rounded-xl border transition-all ${
            image
              ? "bg-violet-600/30 border-violet-500/50 text-violet-400"
              : "bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-slate-200"
          }`}
          title="Attach image"
          onClick={() => fileRef.current?.click()}
        >
          🖼️
        </button>
        <textarea
          className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 resize-none"
          placeholder={
            image
              ? "Ask about this image…"
              : "Ask anything… (Shift+Enter for newline)"
          }
          rows={1}
          style={{ maxHeight: "120px" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all"
          disabled={loading || (!input.trim() && !image)}
          onClick={send}
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
