"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import React, { useState, useEffect, useRef } from "react";

const STREAMING_CODE_LINES = [
  "import { SwarmRegistry } from '@inso/swarm-core';",
  "import { CoderAgent, AuditorAgent } from '@inso/agents';",
  "",
  "async function deployPipeline(config: SwarmConfig) {",
  "  const registry = await SwarmRegistry.connect({",
  "    cluster: 'gcp-sovereign-us-central1',",
  "    secure: true",
  "  });",
  "",
  "  const coder = new CoderAgent({",
  "    model: 'sovereign-gpt-4o',",
  "    sandbox: 'secure-vpc-sandbox'",
  "  });",
  "",
  "  console.log('❯ spawning agent: Coder...');",
  "  const implementation = await coder.execute({",
  "    prompt: 'Implement auth middleware and rate limiting',",
  "    files: ['src/middleware/auth.ts']",
  "  });",
  "",
  "  console.log('❯ spawning agent: Auditor...');",
  "  const auditor = new AuditorAgent();",
  "  const auditResult = await auditor.verify(implementation);",
  "",
  "  if (auditResult.vulnerabilities.length > 0) {",
  "    throw new Error('Security audit failed.');",
  "  }",
  "",
  "  await registry.deploy(implementation.artifacts);",
  "  console.log('✓ deployment complete. service live.');",
  "}",
  "",
  "// Initializing secure handshake...",
  "// VPC routing verified (us-central1)...",
  "// Swarm session initialized."
];

function SubtleCodeStream() {
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    // Start with 12 lines
    setLines(STREAMING_CODE_LINES.slice(0, 12));
    
    let currentIndex = 12;
    const interval = setInterval(() => {
      setLines((prev) => {
        const nextLines = [...prev.slice(1), STREAMING_CODE_LINES[currentIndex]];
        currentIndex = (currentIndex + 1) % STREAMING_CODE_LINES.length;
        return nextLines;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full font-mono text-[11px] leading-relaxed text-[#00E5A3] opacity-[0.10] select-none pointer-events-none pr-8">
      <div className="flex flex-col gap-1 transition-all duration-500">
        {lines.map((line, idx) => {
          const isFadingOut = idx === 0 || idx === lines.length - 1;
          return (
            <div 
              key={idx} 
              className={`whitespace-pre transition-opacity duration-500 ${
                isFadingOut ? "opacity-20" : "opacity-100"
              }`}
            >
              {line}
            </div>
          );
        })}
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
        (window as any).__TAURI_INTERNALS__ ||
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

          {/* Top Header Row */}
          <div className="relative z-20 flex items-center justify-between w-full">
            <Link href="/">
              <img
                alt="Inso Logo Icon"
                className="h-8 w-auto hover:opacity-80 transition-opacity cursor-pointer"
                src="/logo-white.png"
              />
            </Link>
            <Link
              className="flex items-center gap-2 text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
              href="/"
            >
              <Icon className="text-lg" icon="solar:arrow-left-linear" />
              Back to Home
            </Link>
          </div>

          {/* Subtle Faded Code Stream in Center */}
          <div className="relative z-10 flex-1 flex items-center justify-center py-8">
            <SubtleCodeStream />
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

        <div
          className={`w-full max-w-sm ${isTauri ? "mt-0" : "mt-20 lg:mt-12"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
