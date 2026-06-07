"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import React, { useState, useEffect, useRef } from "react";

const SWARM_STEPS = [
  { text: "❯ inso swarm start --goal \"deploy_auth_module\"", type: "command" },
  { text: "ℹ [SYSTEM] Initializing Inso Swarm (v2.0.0)...", type: "info" },
  { text: "✓ [SYSTEM] Swarm registry connected to Tri-Cloud.", type: "success" },
  { text: "● [SYSTEM] Spawning specialized agent swarms...", type: "info" },
  { text: "  » [Agent: Planner] Formulating implementation strategy...", type: "agent" },
  { text: "  » [Agent: Architect] Creating SOC2 compliance sandbox...", type: "agent" },
  { text: "  » [Agent: Coder] Injecting JWT validation middleware...", type: "agent" },
  { text: "  » [Agent: Auditor] Reviewing buffer sizes and headers...", type: "agent" },
  { text: "✓ [Agent: Auditor] Security audit completed: 0 vulnerabilities.", type: "success" },
  { text: "● [SYSTEM] Compiling code with Turbopack...", type: "info" },
  { text: "  [1/2] compiling /api/auth/[...nextauth] ...", type: "detail" },
  { text: "  [2/2] compiling /components/login-card ...", type: "detail" },
  { text: "✓ Compiled successfully in 842ms", type: "success" },
  { text: "🚀 [SYSTEM] Deploying sandbox to AWS VPC (us-east-1)...", type: "info" },
  { text: "✓ Deployment complete. Service live at auth.sandbox.inso.internal", type: "success" },
  { text: "🎉 Swarm goal achieved in 4.82s.", type: "success" },
  { text: "", type: "empty" }
];

function CodeTerminal() {
  const [visibleLines, setVisibleLines] = useState<typeof SWARM_STEPS>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLineIndex >= SWARM_STEPS.length) {
      const resetTimeout = setTimeout(() => {
        setVisibleLines([]);
        setCurrentLineIndex(0);
        setCurrentCharIndex(0);
      }, 5000);
      return () => clearTimeout(resetTimeout);
    }

    const currentLine = SWARM_STEPS[currentLineIndex];

    if (currentLine.type === "empty") {
      setVisibleLines(prev => [...prev, currentLine]);
      setCurrentLineIndex(prev => prev + 1);
      setCurrentCharIndex(0);
      return;
    }

    // Speed up standard outputs, slow down typing command lines
    const isCommand = currentLine.type === "command";
    const delay = isCommand ? 35 : 12;

    const charTimeout = setTimeout(() => {
      if (currentCharIndex < currentLine.text.length) {
        setCurrentCharIndex(prev => prev + 1);
      } else {
        setVisibleLines(prev => [...prev, currentLine]);
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
    }, delay);

    return () => clearTimeout(charTimeout);
  }, [currentLineIndex, currentCharIndex]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines, currentCharIndex]);

  const getLineStyles = (type: string) => {
    switch (type) {
      case "command":
        return "text-[#00C2FF] font-semibold drop-shadow-[0_0_8px_rgba(0,194,255,0.4)]";
      case "info":
        return "text-[#A370F7]";
      case "success":
        return "text-[#00E5A3] font-medium drop-shadow-[0_0_8px_rgba(0,229,163,0.4)]";
      case "agent":
        return "text-[#FFB800]";
      case "detail":
        return "text-[#8E929E]";
      default:
        return "text-white";
    }
  };

  return (
    <div className="w-full max-w-xl aspect-[1.4] rounded-3xl border border-white/10 bg-[#0C0C0E]/70 backdrop-blur-2xl shadow-[0_0_60px_-15px_rgba(0,102,255,0.4)] overflow-hidden flex flex-col font-mono text-xs text-[#E1E1E6] transition-all duration-300 hover:border-white/20">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#111115]/80 border-b border-white/5 select-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 text-[10px] font-semibold tracking-wider uppercase">
            Inso Code
          </span>
        </div>
        <div className="w-12" />
      </div>

      {/* Terminal Panel Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Swarm Metrics Sidebar */}
        <div className="w-32 bg-[#09090B]/50 border-r border-white/5 p-4 flex flex-col gap-5 select-none">
          <div>
            <div className="text-[9px] text-neutral-500 font-bold tracking-wider uppercase mb-1">
              Connection
            </div>
            <div className="text-[10px] text-[#00E5A3] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E5A3]/20 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-[#00E5A3]" />
              </span>
              Tri-Cloud
            </div>
          </div>
          <div>
            <div className="text-[9px] text-neutral-500 font-bold tracking-wider uppercase mb-1">
              Active Swarm
            </div>
            <div className="text-[10px] text-white font-semibold flex items-center gap-1">
              4 Agents
            </div>
          </div>
          <div>
            <div className="text-[9px] text-neutral-500 font-bold tracking-wider uppercase mb-1">
              Sandbox Env
            </div>
            <div className="text-[10px] text-[#00C2FF] font-semibold flex items-center gap-1">
              VPC Active
            </div>
          </div>
        </div>

        {/* Console Log Area */}
        <div
          ref={containerRef}
          className="flex-1 p-6 overflow-y-auto scrollbar-none flex flex-col gap-2.5 leading-relaxed bg-black/20"
        >
          {visibleLines.map((line, idx) => (
            <div key={idx} className={`whitespace-pre-wrap ${getLineStyles(line.type)}`}>
              {line.text}
            </div>
          ))}
          {currentLineIndex < SWARM_STEPS.length && (
            <div className={`whitespace-pre-wrap ${getLineStyles(SWARM_STEPS[currentLineIndex].type)}`}>
              {SWARM_STEPS[currentLineIndex].text.substring(0, currentCharIndex)}
              <span className="animate-pulse bg-[#00C2FF] text-[#00C2FF] px-[3px] ml-0.5 shadow-[0_0_8px_#00C2FF]">
                █
              </span>
            </div>
          )}
        </div>
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
      <div className="hidden lg:flex w-1/2 bg-[#040405] relative overflow-hidden flex-col justify-between p-16 border-r border-neutral-900">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-[-20%] left-[-20%] w-[90%] h-[90%] rounded-full bg-[#0066FF]/15 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#0066FF]/5 blur-[110px] pointer-events-none" />

        {/* Interactive Terminal Window */}
        <div className="z-20 w-full flex items-center justify-center mt-4 mb-12">
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
        {/* Logo in top right */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
          <Link href="/">
            <img
              alt="Inso Logo Icon"
              className="h-8 w-auto hover:opacity-80 transition-opacity cursor-pointer"
              src="/alti-logo.png"
            />
          </Link>
        </div>

        {/* Back Button */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
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
