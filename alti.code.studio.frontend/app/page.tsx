"use client";

import Navbar from "@/components/navbar";
import PreFooter from "@/components/landing-page/pre-footer";

import HeroSwarm from "@/components/landing-page/hero-swarm";
import TriCloudSection from "@/components/landing-page/tri-cloud-section";
import AgentSwarmSection from "@/components/landing-page/agent-swarm-section";
import EnterpriseConnectorsSection from "@/components/landing-page/enterprise-connectors-section";
import DeterministicControlSection from "@/components/landing-page/deterministic-control-section";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black w-full overflow-x-hidden font-sans">
      <Navbar />
      
      <main className="flex-1 flex flex-col w-full">
        <HeroSwarm />
        <TriCloudSection />
        <AgentSwarmSection />
        <EnterpriseConnectorsSection />
        <DeterministicControlSection />
      </main>

      <PreFooter />
    </div>
  );
}
