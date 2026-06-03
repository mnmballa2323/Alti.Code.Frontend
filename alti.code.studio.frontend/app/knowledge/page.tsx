"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import ChatBotLayout from "@/components/ChatbotLayout";

export default function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!query) return;
    setLoading(true);
    setResult(null);
    
    try {
      // Calls the Tri-Cloud RAG Orchestrator (Bedrock -> Vertex -> Azure)
      const res = await fetch("http://localhost:3001/api/v1/knowledge/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json();
      if (data.success) {
        // data.answer is now an object containing { answer, confidenceScore, citations }
        setResult(data.answer);
      } else {
        setResult({ answer: "Error: " + data.error });
      }
    } catch (err) {
      setResult({ answer: "Failed to connect to Tri-Cloud RAG Gateway." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-4xl h-[calc(100vh-80px)] flex flex-col items-center pt-24">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Tri-Cloud Knowledge Base</h1>
          <p className="text-default-500 text-lg">
            Powered by AWS Bedrock (Ingestion), GCP Vertex AI (Retrieval), and Azure GPT-5.5 (Synthesis).
          </p>
        </div>

        <div className="w-full flex gap-2 mb-8">
          <Input 
            size="lg"
            placeholder="Ask a question about your uploaded documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            className="flex-1"
          />
          <Button 
            size="lg"
            color="primary"
            isLoading={loading}
            onPress={handleQuery}
            className="font-semibold"
          >
            Synthesize
          </Button>
        </div>

        {result && (
          <div className="w-full bg-white dark:bg-[#161b22] border border-default-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Synthesized Answer (GPT-5.5 Pro)</h3>
              {result.confidenceScore && (
                <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  {result.confidenceScore}% Confidence
                </span>
              )}
            </div>
            
            <div className="text-default-800 dark:text-default-200 leading-relaxed whitespace-pre-wrap mb-6">
              {result.answer}
            </div>

            {result.citations && result.citations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-default-200 dark:border-gray-800">
                <h4 className="text-xs font-semibold text-default-500 uppercase mb-3">Sources & Citations</h4>
                <div className="flex flex-col gap-2">
                  {result.citations.map((cite: any, idx: number) => (
                    <div key={idx} className="bg-default-50 dark:bg-black/20 p-3 rounded-lg border border-default-100 dark:border-gray-800/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-primary font-medium text-xs">[{cite.text}]</span>
                        <span className="text-default-400 text-[10px]">Chunk {cite.chunk}</span>
                      </div>
                      <p className="text-xs text-default-500 font-mono">"{cite.extract}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pb-12">
          <Button
            variant="flat"
            className="text-xs font-medium rounded-full"
            onPress={() => window.dispatchEvent(new CustomEvent("open-knowledge-modal"))}
          >
            + Upload New Documents to Vector Search
          </Button>
        </div>

      </div>
    </ChatBotLayout>
  );
}
