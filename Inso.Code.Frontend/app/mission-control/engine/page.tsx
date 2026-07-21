"use client";

import React, { useState, useEffect } from "react";

import { AstGraphView } from "@/components/agents/AstGraphView";

// Mock types for now
type EngineStats = {
  nodes: number;
  edges: number;
  density: number;
  is_dag: boolean;
};

export default function EngineDashboard() {
  const [status, setStatus] = useState<"online" | "offline" | "checking">(
    "checking",
  );
  const [stats, setStats] = useState<EngineStats | null>(null);
  const [ingestionResult, setIngestionResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      // connecting to backend engine proxy
      const res = await fetch("/api/v1/engine/health"); // Assuming backend proxy route

      if (res.ok) setStatus("online");
      else setStatus("offline");
    } catch {
      setStatus("offline");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);

    const formData = new FormData();

    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch("/api/v1/engine/ingest", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setIngestionResult(data);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-gray-100 font-mono">
      <header className="mb-8 flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">The Engine</h1>
          <p className="text-gray-400 text-sm">
            NeMo / Python Microservice Bridge
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${status === "online" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}
        >
          <div
            className={`w-3 h-3 rounded-full ${status === "online" ? "bg-green-400 animate-pulse" : "bg-red-500"}`}
          />
          {status.toUpperCase()}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Knowledge Ingestion */}
        <section className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
            <span>📚</span>
            Knowledge Ingestion
          </h2>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-purple-500 transition-colors">
            <input
              accept=".pdf,.docx,.pptx,.txt,.md,.png,.jpg"
              className="hidden"
              id="fileUpload"
              type="file"
              onChange={handleFileUpload}
            />
            <label
              className="cursor-pointer flex flex-col items-center"
              htmlFor="fileUpload"
            >
              <span className="text-4xl mb-2">📄</span>
              <span className="text-lg text-gray-300">
                Drop files to ingest
              </span>
              <span className="text-xs text-gray-500 mt-2">
                Support: PDF, Office, Images (OCR)
              </span>
            </label>
          </div>

          {uploading && (
            <div className="mt-4 text-blue-400 animate-pulse">
              Processing document via Unstructured...
            </div>
          )}

          {ingestionResult && (
            <div className="mt-4 p-4 bg-gray-900 rounded overflow-auto max-h-64 text-xs border border-gray-700">
              <pre>{JSON.stringify(ingestionResult, null, 2)}</pre>
            </div>
          )}
        </section>

        {/* Graph Analytics (Placeholder for data from Engine) */}
        <section className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
            <span>🕸️</span>
            Graph Analytics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-gray-900 rounded border border-gray-700">
              <span className="text-gray-400">Cyclomatic Complexity</span>
              <span className="font-bold text-yellow-400">--</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-900 rounded border border-gray-700">
              <span className="text-gray-400">Dependency DAG</span>
              <span className="font-bold text-green-400">True</span>
            </div>
            <AstGraphView />
            <button className="w-full py-2 bg-green-900 hover:bg-green-800 text-green-200 rounded border border-green-700 transition">
              Run Full Analysis
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
