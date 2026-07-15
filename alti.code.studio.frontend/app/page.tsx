"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/navbar";
import PreFooter from "@/components/landing-page/pre-footer";
import HeroSwarm from "@/components/landing-page/hero-swarm";
import PairedProgrammerSection from "@/components/landing-page/paired-programmer-section";
import LiveWikiSection from "@/components/landing-page/live-wiki-section";
import GcpSovereignSection from "@/components/landing-page/tri-cloud-section";
import DeterministicControlSection from "@/components/landing-page/deterministic-control-section";
import AgentForgeSection from "@/components/landing-page/agent-forge-section";
import ZeroTrustLedgerSection from "@/components/landing-page/zero-trust-ledger-section";
import CapabilitiesBentoGrid from "@/components/landing-page/capabilities-bento-grid";
import PricingSection from "@/components/landing-page/pricing-section";
import HowItWorksSection from "@/components/landing-page/how-it-works-section";

export default function LandingPage() {
  const router = useRouter();
  const [isDesktopApp, setIsDesktopApp] = useState(false);

  // Performance-friendly cursor-tracking spotlight
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("__TAURI__" in window ||
        "__TAURI_INTERNALS__" in window ||
        "electron" in window ||
        window.navigator.userAgent.includes("Electron"))
    ) {
      router.replace("/new-chat");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-[#030014] text-white w-full overflow-x-hidden font-sans relative">
      {/* Background Micro-Grid & Spotlight Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated Moving Grid */}
        <div className="absolute inset-0 moving-grid-bg opacity-[0.25]" />
        {/* Ambient Top & Bottom Fades */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030014] via-transparent to-[#030014]" />
        {/* Ambient Radial Spotlight following Cursor */}
        <div
          className="fixed inset-0 z-10 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              "radial-gradient(600px circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh), rgba(59, 130, 246, 0.05), transparent 45%)",
          }}
        />
      </div>

      <Navbar />

      <main className="flex-1 flex flex-col w-full relative z-10">
        <div id="section-0">
          <HeroSwarm />
        </div>
        <div id="section-how-it-works">
          <HowItWorksSection />
        </div>
        <div id="section-1">
          <PairedProgrammerSection />
        </div>
        <div id="section-wiki">
          <LiveWikiSection />
        </div>
        <div id="section-2">
          <GcpSovereignSection />
        </div>
        <div id="section-4">
          <DeterministicControlSection />
        </div>
        <div id="section-8">
          <AgentForgeSection />
        </div>
        <div id="section-9">
          <ZeroTrustLedgerSection />
        </div>
        <div id="section-10">
          <CapabilitiesBentoGrid />
        </div>
        <div id="section-12">
          <PricingSection />
        </div>
      </main>

      <PreFooter />
    </div>
  );
}
