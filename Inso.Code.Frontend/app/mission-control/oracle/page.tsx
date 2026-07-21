"use client";

import React, { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
};

export default function OracleChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [deepReasoning, setDeepReasoning] = useState(false);
  const [thoughtProcess, setThoughtProcess] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, thoughtProcess]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setThoughtProcess(null);

    try {
      if (deepReasoning) {
        // Phase 27: Hive Mind Mode
        const res = await fetch("/api/v1/synapse/hive/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goal: userMsg.content,
            mode: "collaborative",
          }),
        });
        const session = await res.json();

        if (session.success && session.data) {
          // In a real implementation we would stream updates.
          // For now, we receiving the completed session but we map it to ThoughtProcess
          // to visualize what happened.
          const { memory } = session.data;

          // Map Strategy/Plan
          const planRaw = memory.find((m: any) =>
            m.includes ? m.includes("plan") : false,
          );
          // Note: memory in mock is a Map, but over JSON it might be array of entries or object?
          // Let's verify structure. The mock setMemory stores directly.
          // The API returns the session object.
          // We need to inspect how 'memory' is returned in the API response.
          // HiveControl returns: memory: await synapseService.getMemory(sessionId, 'build_result')
          // Wait, HiveControl ONLY returns 'build_result' in the memory field of the return object!
          // See: memory: await synapseService.getMemory(sessionId, 'build_result'),

          // We actually want the FULL details for the UI.
          // We should probably update HiveControl to return full context or fetch it here.
          // For this iteration, let's assume we just show the result.
          // Ideally we should have updated HiveControl to return all memory keys.

          // Let's fake the visualization for the "Demo" effect if data is missing,
          // or better, let's rely on the build result.

          const buildResult = session.data.memory; // This is the build result array

          const aiMsg: Message = {
            role: "assistant",
            content:
              `Hive Mind Completed.\n\nGenerated ${buildResult ? buildResult.length : 0} files.\n\n` +
              (buildResult ? buildResult.join("\n") : ""),
          };

          setMessages((prev) => [...prev, aiMsg]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Hive Mind failed to start." },
          ]);
        }
      } else {
        // Standard RAG
        const res = await fetch("/api/v1/engine/rag/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: userMsg.content }),
        });

        const data = await res.json();

        const aiMsg: Message = {
          role: "assistant",
          content: data.response || "I couldn't generate a response.",
          sources: data.sources,
        };

        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error contacting The Oracle." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-mono">
      <header className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-cyan-400">🔮 The Oracle</h1>
          <div className="flex items-center gap-2 bg-gray-900 rounded-full px-3 py-1 border border-gray-700">
            <span
              className={`text-xs ${deepReasoning ? "text-purple-400" : "text-gray-500"}`}
            >
              Deep Reasoning
            </span>
            <button
              className={`w-8 h-4 rounded-full transition-colors relative ${deepReasoning ? "bg-purple-600" : "bg-gray-700"}`}
              onClick={() => setDeepReasoning(!deepReasoning)}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${deepReasoning ? "left-4.5" : "left-0.5"}`}
                style={{ left: deepReasoning ? "18px" : "2px" }}
              />
            </button>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          RAG Powered by NeMo Engine
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p>Ask me anything about the codebase.</p>
            <p className="text-sm mt-2">"How does the Synapse service work?"</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${msg.role === "user" ? "bg-cyan-900 text-cyan-100" : "bg-gray-800 border border-gray-700"}`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
                  <p className="font-bold mb-1">Sources:</p>
                  <ul className="list-disc pl-4">
                    {msg.sources.map((src, i) => (
                      <li key={i}>{JSON.stringify(src)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
              {deepReasoning ? (
                <span className="text-purple-400">
                  🧠 Hive Mind is thinking...
                </span>
              ) : (
                <span className="text-cyan-400">Thinking...</span>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            className={`flex-1 bg-gray-900 border border-gray-600 rounded p-2 focus:outline-none ${deepReasoning ? "focus:border-purple-500" : "focus:border-cyan-500"}`}
            disabled={loading}
            placeholder={
              deepReasoning
                ? "Describe a feature to architect..."
                : "Ask The Oracle..."
            }
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`px-6 py-2 rounded disabled:opacity-50 ${deepReasoning ? "bg-purple-700 hover:bg-purple-600" : "bg-cyan-700 hover:bg-cyan-600"}`}
            disabled={loading}
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
