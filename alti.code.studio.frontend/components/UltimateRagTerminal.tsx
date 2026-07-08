"use client";

import { useState } from "react";
import { ScrollShadow, Spinner, Accordion, AccordionItem } from "@heroui/react";
import { Bot, FileCode2 } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

import PromptInputFullLineWithBottomActions from "./input-actions";
import { AgentCommandCenter } from "./AgentCommandCenter";

import { queryUltimateRAG } from "@/app/actions/ultimateRag";

/**
 * Visualizes the Ultimate GCP RAG System output.
 */
export function UltimateRagTerminal() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async (
    text?: string,
    mode?: string,
    domain?: string,
    language?: string,
  ) => {
    const q = text || query;

    if (!q) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Force domain to 'Chat' to enforce chat-only RAG synthesis rules
    const res = await queryUltimateRAG(q, mode, "Chat", language);

    if (res.success) {
      setResult(res.data);
    } else {
      setError(res.error || "Failed to execute Ultimate RAG sequence.");
    }

    setIsLoading(false);
  };

  const hasSearched = isLoading || result || error;

  if (hasSearched) {
    return (
      <div className="flex-1 overflow-hidden bg-default-50 dark:bg-background flex flex-col h-full font-sans w-full">
        <div className="flex flex-col h-full w-full items-center justify-between px-6 py-4 gap-4 relative z-10">
          <div className="flex flex-col w-full h-full max-w-3xl">
            <div className="w-full flex-grow overflow-y-auto scroll-smooth scrollbar-none pb-4">
              {error && (
                <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-600 font-mono text-sm shadow-sm mt-4">
                  {error}
                </div>
              )}

              {isLoading && (
                <div className="flex flex-col items-center justify-center p-12 gap-4 mt-8">
                  <Spinner color="primary" size="lg" />
                  <p className="text-sm text-default-500 font-medium animate-pulse">
                    Running Ultimate RAG Pipeline...
                  </p>
                </div>
              )}

              {result && (
                <div className="flex flex-col gap-4 mt-4 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="p-6 bg-primary-50/50 rounded-3xl border border-primary-100 shadow-sm backdrop-blur-md">
                    <div className="font-bold text-primary-800 mb-6 flex items-center gap-2 border-b border-primary-100 pb-4">
                      <Bot size={20} />
                      Gemini 3.1 Pro Synthesis
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <MDEditor.Markdown
                        source={result.synthesis}
                        style={{ backgroundColor: "transparent" }}
                      />
                    </div>
                  </div>

                  <Accordion className="px-0 mt-2" variant="splitted">
                    <AccordionItem
                      key="1"
                      aria-label="Raw Retrieval Context"
                      className="bg-default-50 border border-default-200 shadow-none rounded-2xl"
                      title={
                        <div className="flex items-center gap-2 text-sm font-semibold text-default-600">
                          <FileCode2 size={16} />
                          View Raw Retrieval Context (Vertex + Spanner + CLI)
                        </div>
                      }
                    >
                      <ScrollShadow className="h-[300px] p-4 bg-black/5 rounded-xl font-mono text-[11px] text-default-600 mb-4">
                        <pre className="whitespace-pre-wrap">
                          {result.contextUsed}
                        </pre>
                      </ScrollShadow>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </div>

            <div className="w-full mt-auto">
              <PromptInputFullLineWithBottomActions
                hideAgents={true}
                hideDropdown={true}
                placeholder="Search the codebase..."
                value={query}
                onChange={setQuery}
                onSend={(text, mode, domain, language) =>
                  handleQuery(text, mode, domain, language)
                }
              />
              <p className="text-center text-xs font-medium text-default-400 opacity-60 mt-2 pb-2">
                We don&apos;t train on your data. Your chats stay private.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden bg-default-50 dark:bg-background flex flex-col h-full font-sans w-full">
      <div className="relative flex flex-1 w-full flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none blur-sm mix-blend-screen">
          <AgentCommandCenter />
        </div>

        <div className="flex w-full flex-col items-center gap-6 z-20 px-6 mt-[-5vh]">
          <div className="flex flex-col items-center text-center z-30 mb-6">
            <h1
              className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80"
              style={{ fontFamily: "var(--font-secondary)" }}
            >
              Search Codebase
            </h1>
          </div>

          <div className="flex w-full flex-col gap-4 max-w-2xl">
            <PromptInputFullLineWithBottomActions
              hideAgents={true}
              hideDropdown={true}
              placeholder="Search the codebase..."
              value={query}
              onChange={setQuery}
              onSend={(text, mode, domain, language) =>
                handleQuery(text, mode, domain, language)
              }
            />
          </div>
        </div>

        <p className="absolute bottom-8 text-xs font-medium text-default-400 opacity-60 z-20">
          We don&apos;t train on your data. Your chats stay private.
        </p>
      </div>
    </div>
  );
}
