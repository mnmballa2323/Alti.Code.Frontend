"use client";

import React, { useState, useEffect } from "react";

type TddStep = "write_test" | "run_fail" | "patch" | "run_pass" | "guardrail";

export default function DeterministicControlSection() {
  const [step, setStep] = useState<TddStep>("write_test");
  const [testCode, setTestCode] = useState("");
  const [implCode, setImplCode] = useState("");

  const testFull = `// test/auth.test.ts
test("strictly checks signature", () => {
  const req = mockRequest("/api/deploy");
  expect(verifySignature(req)).toBe(true);
});`;

  const implFull = `// src/auth.ts
export function verifySignature(req: Request) {
  const sig = req.headers.get("x-signature");
  return validateHmac(sig, req.body);
}`;

  useEffect(() => {
    let active = true;
    let timer: NodeJS.Timeout;

    const runLoop = async () => {
      while (active) {
        // Step 1: Write Test
        if (!active) break;
        setStep("write_test");
        setImplCode("");
        // Simulate typing of test code
        for (let i = 0; i <= testFull.length; i++) {
          if (!active) break;
          setTestCode(testFull.slice(0, i));
          await new Promise((r) => setTimeout(r, 15));
        }
        await new Promise((r) => setTimeout(r, 1500));

        // Step 2: Run Fail
        if (!active) break;
        setStep("run_fail");
        await new Promise((r) => setTimeout(r, 2500));

        // Step 3: Patch Code
        if (!active) break;
        setStep("patch");
        // Simulate typing of implementation code
        for (let i = 0; i <= implFull.length; i++) {
          if (!active) break;
          setImplCode(implFull.slice(0, i));
          await new Promise((r) => setTimeout(r, 15));
        }
        await new Promise((r) => setTimeout(r, 1500));

        // Step 4: Run Pass
        if (!active) break;
        setStep("run_pass");
        await new Promise((r) => setTimeout(r, 2500));

        // Step 5: Enforce Guardrails
        if (!active) break;
        setStep("guardrail");
        await new Promise((r) => setTimeout(r, 3000));
      }
    };

    runLoop();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="w-full py-32 bg-black text-white px-4 sm:px-6 lg:px-8 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          <h3 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-white">
            Deterministic Output. <br />
            Absolute Security.
          </h3>
          <p className="text-xl text-slate-400 leading-relaxed font-medium text-balance">
            Most AI coding tools are unpredictable black boxes. Inso Code is
            built for enterprise engineering teams who demand absolute control.
            With native guardrails, deterministic instruction steering, and
            mandatory TDD workflows, our agents build robust production systems.
          </p>
        </div>

        {/* Right Column (Animation Window) */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[1.2/1] max-w-md mx-auto bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl p-5 font-mono text-xs flex flex-col overflow-hidden text-slate-100 select-none">
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-xs text-slate-500">
              inso-agent-tdd-workflow.sh
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Live Swarm
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
            {/* Phase Badge & Description */}
            <div className="mb-3 flex items-center justify-between flex-shrink-0 bg-zinc-900/50 border border-zinc-900 p-2.5 rounded-xl">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
                  Current Action
                </span>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">
                  {step === "write_test" && "TDD Loop: Writing failing test first..."}
                  {step === "run_fail" && "Running Test Runner (Expecting failure)..."}
                  {step === "patch" && "TDD Loop: Auto-implementing code fix..."}
                  {step === "run_pass" && "Running Test Runner (Expecting pass)..."}
                  {step === "guardrail" && "Applying Strict Security Guardrails..."}
                </div>
              </div>
              <div>
                {step === "write_test" && (
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider animate-pulse">
                    Phase 1: RED
                  </span>
                )}
                {step === "run_fail" && (
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider animate-bounce">
                    FAILING
                  </span>
                )}
                {step === "patch" && (
                  <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider animate-pulse">
                    Phase 2: GREEN
                  </span>
                )}
                {step === "run_pass" && (
                  <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider animate-bounce">
                    PASSING
                  </span>
                )}
                {step === "guardrail" && (
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider animate-pulse">
                    ENFORCED
                  </span>
                )}
              </div>
            </div>

            {/* Code / Terminal View */}
            <div className="flex-1 flex flex-col gap-4 min-h-0 bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-900">
              {/* Test Terminal */}
              {(step === "write_test" || step === "run_fail") && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="text-slate-300 whitespace-pre text-[11px] sm:text-xs">
                    {testCode}
                    {step === "write_test" && (
                      <span className="inline-block w-1.5 h-3.5 bg-blue-400 ml-0.5 animate-pulse" />
                    )}
                  </div>
                  {step === "run_fail" && (
                    <div className="border-t border-zinc-900 pt-2.5 mt-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="text-red-400 font-bold text-xs">✗ test/auth.test.ts (1 failed, 0 passed)</div>
                      <div className="text-slate-500 mt-0.5 text-[11px]">
                        Error: Expected verification signature to be true but got false.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Implementation Terminal */}
              {(step === "patch" || step === "run_pass") && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="text-slate-300 whitespace-pre text-[11px] sm:text-xs">
                    {implCode}
                    {step === "patch" && (
                      <span className="inline-block w-1.5 h-3.5 bg-yellow-400 ml-0.5 animate-pulse" />
                    )}
                  </div>
                  {step === "run_pass" && (
                    <div className="border-t border-zinc-900 pt-2.5 mt-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="text-green-400 font-bold text-xs">✓ test/auth.test.ts (1 passed, 1 total)</div>
                      <div className="text-slate-500 mt-0.5 text-[11px]">
                        All verification and HMAC cryptographic checks succeeded in 48ms.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Guardrails Terminal */}
              {step === "guardrail" && (
                <div className="flex-1 flex flex-col justify-center gap-2.5 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                    <span className="text-slate-400 font-semibold text-xs">Security Audit Pipeline</span>
                    <span className="text-purple-400 font-bold text-xs">100% Compliant</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Sovereign Boundary Checks</span>
                    <span className="text-green-400 font-semibold">✓ ENFORCED</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">No Secrets Hardcoded Scan</span>
                    <span className="text-green-400 font-semibold">✓ CLEAN</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Static Code Review Check</span>
                    <span className="text-green-400 font-semibold">✓ PASSED</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-zinc-900 pt-1.5 mt-0.5">
                    <span className="text-slate-400 font-semibold">Build Status</span>
                    <span className="text-green-400 font-bold">✓ READY TO COMMIT</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status bar */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-zinc-800 pt-3 flex-shrink-0">
              <div>coverage: 94.8%</div>
              <div>sandbox: secure-isolation</div>
              <div>TDD guided</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
