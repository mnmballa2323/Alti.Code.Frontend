import React, { useState, useEffect } from "react";
import { UserCircle, Code2, TerminalSquare, FileText, CheckCircle2, Loader2, CodeSquare } from "lucide-react";

const CODE_STEPS = [
  {
    line: "import { encrypt } from '@/lib/crypto';",
    file: "lib/crypto.ts",
    status: "complete"
  },
  {
    line: "import { cookies } from 'next/headers';",
    file: "lib/crypto.ts",
    status: "complete"
  },
  {
    line: "export async function setSession(user: User) {",
    file: "middleware.ts",
    status: "active"
  },
  {
    line: "  const encrypted = await encrypt(user);",
    file: "middleware.ts",
    status: "active"
  },
  {
    line: "  const cookieStore = await cookies();",
    file: "middleware.ts",
    status: "active"
  },
  {
    line: "  cookieStore.set('session', encrypted, {",
    file: "app/layout.tsx",
    status: "active"
  },
  {
    line: "    httpOnly: true, secure: true,",
    file: "app/layout.tsx",
    status: "active"
  },
  {
    line: "    sameSite: 'strict',",
    file: "app/layout.tsx",
    status: "active"
  },
  {
    line: "  });",
    file: "app/layout.tsx",
    status: "complete"
  },
  {
    line: "}",
    file: "app/layout.tsx",
    status: "complete"
  }
];

const FILES = [
  { path: "lib/crypto.ts", status: "complete" },
  { path: "middleware.ts", status: "complete" },
  { path: "app/layout.tsx", status: "active" },
  { path: "package.json", status: "pending" },
];

export default function PairedProgrammerSection() {
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [activeLineIdx, setActiveLineIdx] = useState(0);
  const [fileStatuses, setFileStatuses] = useState(FILES);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeLineIdx < CODE_STEPS.length) {
        const nextStep = CODE_STEPS[activeLineIdx];
        setTypedLines((prev) => [...prev, nextStep.line]);
        
        // Update files status based on active writing
        setFileStatuses((prevFiles) =>
          prevFiles.map((f) => {
            if (f.path === nextStep.file) {
              return { ...f, status: nextStep.status };
            }
            return f;
          })
        );

        setActiveLineIdx((prev) => prev + 1);
      } else {
        // Reset after complete loop
        setTimeout(() => {
          setTypedLines([]);
          setActiveLineIdx(0);
          setFileStatuses(FILES);
        }, 3000);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [activeLineIdx]);

  return (
    <section className="w-full py-24 bg-black flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center">
        {/* Apple-style Headline */}
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">
          Your AI pair programmer.
        </h2>

        <p className="text-xl md:text-2xl text-gray-400 w-full font-medium tracking-tight mb-16 leading-relaxed">
          It doesn't replace you. It amplifies you. You are the architect, and
          the
          <br className="hidden md:block" /> swarm is your tireless engineering
          team ready to execute every command.
        </p>

        {/* Code Generation Dual-Pane Preview */}
        <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden font-mono flex flex-col md:flex-row h-[360px] text-left shadow-2xl mb-16 relative">
          
          {/* Left Pane: Code Editor */}
          <div className="flex-1 border-r border-neutral-800 flex flex-col h-full bg-neutral-950">
            <div className="flex items-center gap-2 px-5 py-3.5 bg-neutral-900/50 border-b border-neutral-800/80">
              <CodeSquare className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-200">
                session_handler.ts
              </span>
            </div>
            <div className="flex-1 p-5 overflow-y-auto text-xs text-neutral-300 space-y-1 select-none">
              {typedLines.map((line, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="text-neutral-600 select-none w-5 text-right">{idx + 1}</span>
                  <span className={line.startsWith("//") ? "text-neutral-500" : "text-neutral-200"}>
                    {line}
                  </span>
                </div>
              ))}
              {activeLineIdx < CODE_STEPS.length && (
                <div className="flex gap-4 animate-pulse">
                  <span className="text-neutral-600 select-none w-5 text-right">{typedLines.length + 1}</span>
                  <span className="w-2 h-4 bg-white inline-block" />
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: File Verification Tree */}
          <div className="w-full md:w-80 bg-neutral-900/20 flex flex-col h-full">
            <div className="flex items-center gap-2 px-5 py-3.5 bg-neutral-900/50 border-b border-neutral-800/80">
              <FileText className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-200">
                Workspace Diagnostics
              </span>
            </div>
            <div className="flex-grow p-5 flex flex-col gap-4 text-xs">
              {fileStatuses.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between bg-neutral-950/60 border border-neutral-800/50 p-3.5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-neutral-300 font-semibold">{f.path}</span>
                  </div>
                  {f.status === "complete" ? (
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Verified</span>
                    </div>
                  ) : f.status === "active" ? (
                    <div className="flex items-center gap-1.5 text-sky-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span className="text-[10px] uppercase font-bold tracking-wider animate-pulse">Writing</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-neutral-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Pending</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simple Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <FeatureCard
            description="Provide the vision and intent. The AI swarm instantly translates your commands into production ready code."
            icon={<TerminalSquare className="w-8 h-8 text-black" />}
            title="Command Driven"
          />
          <FeatureCard
            description="You make the executive decisions. The AI swarm handles all the development, testing, and debugging."
            icon={<UserCircle className="w-8 h-8 text-black" />}
            title="Human in Control"
          />
          <FeatureCard
            description="It reads your entire codebase, understands your unique conventions, and writes code exactly the way you do."
            icon={<Code2 className="w-8 h-8 text-black" />}
            title="Native Integration"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start text-left p-8 rounded-3xl bg-gray-100 border border-transparent shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-bold text-black tracking-tight mb-3">
        {title}
      </h3>
      <p className="text-gray-500 leading-relaxed font-medium text-balance">
        {description}
      </p>
    </div>
  );
}
