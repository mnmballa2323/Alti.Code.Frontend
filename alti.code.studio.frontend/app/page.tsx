"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/navbar";
import PreFooter from "@/components/landing-page/pre-footer";
import HeroSwarm from "@/components/landing-page/hero-swarm";
import PairedProgrammerSection from "@/components/landing-page/paired-programmer-section";
import EnterpriseInfrastructureSection from "@/components/landing-page/enterprise-infrastructure-section";
import TriCloudSection from "@/components/landing-page/tri-cloud-section";
import AgentSwarmSection from "@/components/landing-page/agent-swarm-section";
import EnterpriseConnectorsSection from "@/components/landing-page/enterprise-connectors-section";
import AppConnectorsSection from "@/components/landing-page/app-connectors-section";
import DatabaseConnectorsSection from "@/components/landing-page/database-connectors-section";
import DeterministicControlSection from "@/components/landing-page/deterministic-control-section";
import AgentForgeSection from "@/components/landing-page/agent-forge-section";
import ZeroTrustLedgerSection from "@/components/landing-page/zero-trust-ledger-section";
import CapabilitiesBentoGrid from "@/components/landing-page/capabilities-bento-grid";
import PricingSection from "@/components/landing-page/pricing-section";

export default function LandingPage() {
  const router = useRouter();
  const [isDesktopApp, setIsDesktopApp] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "__TAURI__" in window) {
      setIsDesktopApp(true);
      router.replace("/new-chat");
    }
  }, [router]);

  if (isDesktopApp) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white text-black w-full overflow-x-hidden font-sans">
      <Navbar />

      <main className="flex-1 flex flex-col w-full">
        <div id="section-0">
          <HeroSwarm />
        </div>
        <div id="section-1">
          <PairedProgrammerSection />
        </div>
        <div id="section-2">
          <TriCloudSection />
        </div>
        <div id="section-3">
          <AgentSwarmSection />
        </div>
        <div id="section-4">
          <EnterpriseConnectorsSection />
        </div>
        <div id="section-5">
          <AppConnectorsSection />
        </div>
        <div id="section-6">
          <DatabaseConnectorsSection />
        </div>
        <div id="section-7">
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
        <div id="section-11">
          <EnterpriseInfrastructureSection />
        </div>
        <div id="section-12">
          <PricingSection />
        </div>
      </main>

      <PreFooter />
    </div>
  );
}
