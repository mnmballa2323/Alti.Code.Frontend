"use client";

import { useEffect, useState, useRef } from "react";

export default function HeroSwarm() {
  const [os, setOs] = useState<"mac" | "win" | "other" | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();

      if (userAgent.includes("mac")) {
        setOs("mac");
      } else if (userAgent.includes("win")) {
        setOs("win");
      } else {
        setOs("other");
      }
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-start overflow-hidden bg-transparent text-white px-4 sm:px-6 lg:px-8 pt-[30vh] md:pt-[38vh]"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
      onMouseMove={handleMouseMove}
    >
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto gap-8">
        {/* Apple-style Headline */}
        <div className="flex flex-col items-center gap-2 relative top-2 md:top-4">
          <h1 className="flex flex-col items-center justify-center font-bold tracking-tighter leading-[1.0] text-center">
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] tracking-tight text-white whitespace-nowrap">
              Autonomous Software Engineering
            </span>
          </h1>
          <p className="max-w-5xl text-zinc-400 text-lg font-normal leading-relaxed mt-2 px-4">
            Deploy autonomous agent swarms to design architecture, write
            production grade code, execute full test suites,
            <br className="hidden md:inline" />
            and resolve highly complex software engineering tasks under complete
            sovereign and deterministic control.
          </p>
        </div>
      </div>
    </section>
  );
}
