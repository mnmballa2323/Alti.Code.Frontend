"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import React, { useState, useEffect, useRef } from "react";

const SWARM_STEPS = [
  { text: '❯ inso swarm start --goal "deploy_auth_module"', type: "command" },
  { text: "ℹ [SYSTEM] Initializing Inso Swarm (v2.0.0)...", type: "info" },
  {
    text: "✓ [SYSTEM] Swarm registry connected to Google Artifact Registry.",
    type: "success",
  },
  { text: "● [SYSTEM] Spawning specialized agent swarms...", type: "info" },
  {
    text: "  » [Agent: Planner] Formulating implementation strategy...",
    type: "agent",
  },
  {
    text: "  » [Agent: Architect] Creating SOC2 compliance sandbox...",
    type: "agent",
  },
  {
    text: "  » [Agent: Coder] Injecting JWT validation middleware...",
    type: "agent",
  },
  {
    text: "  » [Agent: Auditor] Reviewing buffer sizes and headers...",
    type: "agent",
  },
  {
    text: "✓ [Agent: Auditor] Security audit completed: 0 vulnerabilities.",
    type: "success",
  },
  { text: "● [SYSTEM] Compiling code with Turbopack...", type: "info" },
  { text: "  [1/2] compiling /api/auth/[...nextauth] ...", type: "detail" },
  { text: "  [2/2] compiling /components/login-card ...", type: "detail" },
  { text: "✓ Compiled successfully in 842ms", type: "success" },
  {
    text: "🚀 [SYSTEM] Deploying sandbox to Google Cloud VPC (us-central1)...",
    type: "info",
  },
  {
    text: "✓ Deployment complete. Service live at auth.sandbox.inso.internal",
    type: "success",
  },
  { text: "🎉 Swarm goal achieved in 4.82s.", type: "success" },
  { text: "", type: "empty" },
];

const getAgentStatus = (agentName: string, currentIndex: number) => {
  if (currentIndex <= 3) return "idle";
  if (agentName === "Planner") {
    if (currentIndex === 4) return "active";
    if (currentIndex > 4) return "done";
  }
  if (agentName === "Architect") {
    if (currentIndex === 5) return "active";
    if (currentIndex > 5) return "done";
  }
  if (agentName === "Coder") {
    if (currentIndex === 6) return "active";
    if (currentIndex > 6) return "done";
  }
  if (agentName === "Auditor") {
    if (currentIndex === 7 || currentIndex === 8) return "active";
    if (currentIndex > 8) return "done";
  }

  return "idle";
};

function formatCommandLine(text: string) {
  if (!text.startsWith("❯"))
    return <span className="text-neutral-300">{text}</span>;

  const tokens: React.ReactNode[] = [];

  tokens.push(
    <span key="prompt" className="text-neutral-500 mr-1.5">
      ❯
    </span>,
  );

  let rest = text.substring(1).trimStart();

  if (rest.length === 0) return tokens;

  if (rest.startsWith("inso")) {
    tokens.push(
      <span key="inso" className="text-emerald-400 font-semibold">
        inso{" "}
      </span>,
    );
    rest = rest.substring(4).trimStart();
  } else {
    tokens.push(
      <span key="typing-inso" className="text-neutral-200">
        {rest}
      </span>,
    );

    return tokens;
  }

  if (rest.startsWith("swarm start")) {
    tokens.push(
      <span key="cmd" className="text-white">
        swarm start{" "}
      </span>,
    );
    rest = rest.substring(11).trimStart();
  } else {
    tokens.push(
      <span key="typing-cmd" className="text-white">
        {rest}
      </span>,
    );

    return tokens;
  }

  if (rest.startsWith("--goal")) {
    tokens.push(
      <span key="flag" className="text-cyan-400">
        --goal{" "}
      </span>,
    );
    rest = rest.substring(6).trimStart();
  } else {
    tokens.push(
      <span key="typing-flag" className="text-cyan-400">
        {rest}
      </span>,
    );

    return tokens;
  }

  if (rest.length > 0) {
    tokens.push(
      <span key="val" className="text-amber-200">
        {rest}
      </span>,
    );
  }

  return tokens;
}

function CodeTerminal() {
  const visibleLines = SWARM_STEPS;
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div className="w-full max-w-xl aspect-[1.4] rounded-3xl border border-white/10 bg-[#0B0B0F]/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,102,255,0.15),0_0_0_1px_rgba(255,255,255,0.05)_inset] hover:shadow-[0_20px_50px_rgba(0,102,255,0.22),0_0_0_1px_rgba(255,255,255,0.1)_inset] hover:scale-[1.01] overflow-hidden flex flex-col font-mono text-xs text-[#E1E1E6] transition-all duration-500">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#101014]/90 border-b border-white/5 select-none">
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
        <div className="w-36 bg-[#08080A]/60 border-r border-white/5 p-4 flex flex-col justify-between select-none">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[9px] text-neutral-500 font-bold tracking-wider uppercase mb-1">
                Connection
              </div>
              <div className="text-[10px] text-[#00E5A3] font-semibold flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5A3]" />
                </span>
                GCP Sovereign
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

          {/* Swarm Status Pills */}
          <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
            <div className="text-[9px] text-neutral-500 font-bold tracking-wider uppercase mb-0.5">
              Swarm Status
            </div>
            <div className="flex flex-col gap-1.5 text-[9px] text-neutral-400 font-medium">
              {[
                { name: "Planner", label: "PLN" },
                { name: "Architect", label: "ARC" },
                { name: "Coder", label: "COD" },
                { name: "Auditor", label: "AUD" },
              ].map((agent) => {
                const badgeClass = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";

                return (
                  <div
                    key={agent.name}
                    className="flex items-center justify-between"
                  >
                    <span>{agent.name}</span>
                    <span
                      className={`px-1 py-0.5 rounded text-[7.5px] font-bold tracking-wide ${badgeClass}`}
                    >
                      {agent.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Console Log Area */}
        <div
          ref={containerRef}
          className="flex-1 p-6 overflow-y-auto scrollbar-none flex flex-col gap-2.5 leading-relaxed bg-black/10"
        >
          {visibleLines.map((line, idx) => (
            <div
              key={idx}
              className={`whitespace-pre-wrap ${getLineStyles(line.type)}`}
            >
              {line.type === "command"
                ? formatCommandLine(line.text)
                : line.text}
            </div>
          ))}
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
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ((window as any).__TAURI__ ||
        (window as any).electron ||
        window.navigator.userAgent.includes("Electron"))
    ) {
      setIsTauri(true);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-white font-sans flex-col-reverse lg:flex-row">
      {/* CSS keyframe animations for premium ambient glow effects */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float-slow {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-10px, 10px) scale(0.98); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-15px, 15px) scale(1.03); }
        }
        .animate-float-1 {
          animation: float-slow 16s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-slower 22s ease-in-out infinite;
        }
      `,
        }}
      />

      {/* Left Panel: Streaming Code Generation Terminal */}
      {!isTauri && (
        <div className="hidden lg:flex w-1/2 bg-[#050507] relative overflow-hidden flex-col justify-between p-16 border-r border-white/5">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Premium Ambient Glows */}
          <div className="absolute top-[-25%] left-[-20%] w-[90%] h-[90%] rounded-full bg-blue-600/10 blur-[140px] pointer-events-none animate-float-1" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[75%] h-[75%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none animate-float-2" />
          <div
            className="absolute top-[35%] right-[15%] w-[45%] h-[45%] rounded-full bg-cyan-500/5 blur-[90px] pointer-events-none animate-float-1"
            style={{ animationDelay: "-4s" }}
          />

          {/* Logo in top left */}
          <div className="relative z-20">
            <Link href="/">
              <img
                alt="Inso Logo Icon"
                className="h-8 w-auto hover:opacity-80 transition-opacity cursor-pointer"
                src="/logo-white.png"
              />
            </Link>
          </div>

          {/* Bottom Panel Text */}
          <div className="relative z-20 w-full max-w-xl mt-auto">
            <h2 className="text-4xl xl:text-5xl font-bold tracking-tight mb-4 leading-tight bg-gradient-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Build the future.
            </h2>
            <p className="text-neutral-400 text-lg xl:text-xl font-medium leading-relaxed">
              Join the inso code platform and accelerate your engineering team
              with autonomous AI agents.
            </p>
          </div>
        </div>
      )}

      {/* Right Panel: Auth Form */}
      <div
        className={`w-full ${isTauri ? "max-w-2xl mx-auto" : "lg:w-1/2"} flex flex-col justify-center items-center p-8 sm:p-12 z-10 relative`}
      >

        {/* Back Button */}
        {!isTauri && (
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
            <Link
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors"
              href="/"
            >
              <Icon className="text-lg" icon="solar:arrow-left-linear" />
              Back to Home
            </Link>
          </div>
        )}

        <div
          className={`w-full max-w-sm ${isTauri ? "mt-0" : "mt-20 lg:mt-12"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
