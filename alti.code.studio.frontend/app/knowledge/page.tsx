"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import ChatBotLayout from "@/components/ChatbotLayout";

export default function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!query) return;
    setLoading(true);
    setAnswer("");
    
    try {
      // Calls the Tri-Cloud RAG Orchestrator (Bedrock -> Vertex -> Azure)
      const res = await fetch("http://localhost:3001/api/v1/knowledge/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json();
      if (data.success) {
        setAnswer(data.answer);
      } else {
        setAnswer("Error: " + data.error);
      }
    } catch (err) {
      setAnswer("Failed to connect to Tri-Cloud RAG Gateway.");
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

        {answer && (
          <div className="w-full bg-white dark:bg-[#161b22] border border-default-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wide">Synthesized Answer (GPT-5.5 Pro)</h3>
            <div className="text-default-800 dark:text-default-200 leading-relaxed whitespace-pre-wrap">
              {answer}
            </div>
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
