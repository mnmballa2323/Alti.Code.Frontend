"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import React, { useState, useEffect, useRef } from "react";

const CODE_LINES = [
  { text: "import { AgentSwarm, TriCloudProvider } from \"@inso/sdk\";", tokens: [
    { text: "import ", type: "keyword" },
    { text: "{ AgentSwarm, TriCloudProvider } ", type: "type" },
    { text: "from ", type: "keyword" },
    { text: "\"@inso/sdk\";", type: "string" }
  ]},
  { text: "", tokens: [] },
  { text: "// Initialize the autonomous agent swarm", tokens: [
    { text: "// Initialize the autonomous agent swarm", type: "comment" }
  ]},
  { text: "const swarm = new AgentSwarm({", tokens: [
    { text: "const ", type: "keyword" },
    { text: "swarm = ", type: "text" },
    { text: "new ", type: "keyword" },
    { text: "AgentSwarm", type: "type" },
    { text: "({", type: "text" }
  ]},
  { text: "  provider: TriCloudProvider.Gemini,", tokens: [
    { text: "  provider: ", type: "text" },
    { text: "TriCloudProvider", type: "type" },
    { text: ".Gemini,", type: "text" }
  ]},
  { text: "  maxWorkers: 8,", tokens: [
    { text: "  maxWorkers: ", type: "text" },
    { text: "8", type: "number" },
    { text: ",", type: "text" }
  ]},
  { text: "  security: \"zero-trust\"", tokens: [
    { text: "  security: ", type: "text" },
    { text: "\"zero-trust\"", type: "string" }
  ]},
  { text: "});", tokens: [
    { text: "});", type: "text" }
  ]},
  { text: "", tokens: [] },
  { text: "// Spawn specialized security sentinel", tokens: [
    { text: "// Spawn specialized security sentinel", type: "comment" }
  ]},
  { text: "await swarm.spawn(\"sentinel\", {", tokens: [
    { text: "await ", type: "keyword" },
    { text: "swarm.spawn(", type: "text" },
    { text: "\"sentinel\"", type: "string" },
    { text: ", {", type: "text" }
  ]},
  { text: "  role: \"Security Auditor\",", tokens: [
    { text: "  role: ", type: "text" },
    { text: "\"Security Auditor\"", type: "string" },
    { text: ",", type: "text" }
  ]},
  { text: "  compliance: \"SOC2\"", tokens: [
    { text: "  compliance: ", type: "text" },
    { text: "\"SOC2\"", type: "string" }
  ]},
  { text: "});", tokens: [
    { text: "});", type: "text" }
  ]},
  { text: "", tokens: [] },
  { text: "// Execute secure compilation pipeline", tokens: [
    { text: "// Execute secure compilation pipeline", type: "comment" }
  ]},
  { text: "const result = await swarm.execute({", tokens: [
    { text: "const ", type: "keyword" },
    { text: "result = ", type: "text" },
    { text: "await ", type: "keyword" },
    { text: "swarm.execute({", type: "text" }
  ]},
  { text: "  task: \"compile_and_audit\",", tokens: [
    { text: "  task: ", type: "text" },
    { text: "\"compile_and_audit\"", type: "string" },
    { text: ",", type: "text" }
  ]},
  { text: "  environment: \"sandbox\"", tokens: [
    { text: "  environment: ", type: "text" },
    { text: "\"sandbox\"", type: "string" }
  ]},
  { text: "});", tokens: [
    { text: "});", type: "text" }
  ]}
];

function CodeTerminal() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLineIndex >= CODE_LINES.length) {
      const resetTimeout = setTimeout(() => {
        setVisibleLines([]);
        setCurrentLineIndex(0);
        setCurrentCharIndex(0);
      }, 4000);
      return () => clearTimeout(resetTimeout);
    }

    const currentLine = CODE_LINES[currentLineIndex];
    
    // Empty line case
    if (currentLine.text === "") {
      setVisibleLines(prev => [...prev, ""]);
      setCurrentLineIndex(prev => prev + 1);
      setCurrentCharIndex(0);
      return;
    }

    const charTimeout = setTimeout(() => {
      if (currentCharIndex < currentLine.text.length) {
        setCurrentCharIndex(prev => prev + 1);
      } else {
        setVisibleLines(prev => [...prev, currentLine.text]);
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
    }, 25);

    return () => clearTimeout(charTimeout);
  }, [currentLineIndex, currentCharIndex]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines, currentCharIndex]);

  // Render tokens for completed lines or the actively typing line
  const renderLineContent = (lineIndex: number, textLength: number) => {
    const line = CODE_LINES[lineIndex];
    if (!line || !line.tokens) return null;

    let charsProcessed = 0;
    return (
      <>
        {line.tokens.map((token, idx) => {
          if (charsProcessed >= textLength) return null;
          
          const remainingLength = textLength - charsProcessed;
          const tokenTextToShow = token.text.substring(0, remainingLength);
          charsProcessed += token.text.length;

          let colorClass = "text-[#E1E1E6]";
          if (token.type === "keyword") colorClass = "text-[#E06C75]";
          else if (token.type === "type") colorClass = "text-[#61AFEF]";
          else if (token.type === "string") colorClass = "text-[#98C379]";
          else if (token.type === "comment") colorClass = "text-[#5C6370] italic";
          else if (token.type === "number") colorClass = "text-[#D19A66]";

          return (
            <span key={idx} className={colorClass}>
              {tokenTextToShow}
            </span>
          );
        })}
      </>
    );
  };

  return (
    <div className="w-full max-w-lg aspect-[4/3] rounded-2xl border border-neutral-800 bg-[#0B0B0C]/80 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col font-mono text-xs text-[#E1E1E6]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#131316] border-b border-neutral-900 select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] opacity-80" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] opacity-80" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] opacity-80" />
        </div>
        <span className="text-neutral-500 text-[10px] font-medium tracking-tight">
          src/inso_agent_swarm.ts
        </span>
        <div className="w-12" />
      </div>

      {/* Code Area */}
      <div
        ref={containerRef}
        className="flex-1 p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent flex flex-col gap-1.5 leading-relaxed"
      >
        {visibleLines.map((_, idx) => (
          <div key={idx} className="whitespace-pre">
            <span className="text-neutral-600 select-none inline-block w-6 pr-2 text-right">
              {idx + 1}
            </span>
            {renderLineContent(idx, CODE_LINES[idx].text.length)}
          </div>
        ))}
        {currentLineIndex < CODE_LINES.length && (
          <div className="whitespace-pre">
            <span className="text-neutral-600 select-none inline-block w-6 pr-2 text-right">
              {currentLineIndex + 1}
            </span>
            {renderLineContent(currentLineIndex, currentCharIndex)}
            <span className="animate-pulse bg-[#61AFEF] text-[#61AFEF] px-[3px] ml-0.5">
              █
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white font-sans flex-col-reverse lg:flex-row">
      {/* Left Panel: Streaming Code Generation Terminal */}
      <div className="hidden lg:flex w-1/2 bg-[#050506] relative overflow-hidden flex-col justify-between p-16 border-r border-neutral-900">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[#0066FF]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#0066FF]/5 blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="z-30 flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <Link className="flex items-center gap-2" href="/">
            <img
              alt="Inso Logo Icon"
              className="h-8 w-auto"
              src="/logo-white.png"
            />
            <img
              alt="Inso Code"
              className="h-6 w-auto"
              src="/inso-logo-white.png"
            />
          </Link>
        </div>

        {/* Interactive Terminal Window */}
        <div className="z-20 w-full flex items-center justify-center my-8">
          <CodeTerminal />
        </div>

        {/* Bottom Panel Text */}
        <div className="relative z-20 w-full max-w-xl">
          <h2 className="text-4xl xl:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
            Build the future.
          </h2>
          <p className="text-neutral-400 text-lg xl:text-xl font-medium">
            Join the Inso Code platform and accelerate your engineering team
            with autonomous AI agents.
          </p>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 z-10 relative">
        {/* Back Button */}
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
          <Link
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors"
            href="/"
          >
            <Icon className="text-lg" icon="solar:arrow-left-linear" />
            Back to Home
          </Link>
        </div>

        <div className="w-full max-w-sm mt-20 lg:mt-12">{children}</div>
      </div>
    </div>
  );
}
