"use client";

import Navbar from "@/components/navbar";
import PreFooter from "@/components/landing-page/pre-footer";

import HeroSwarm from "@/components/landing-page/hero-swarm";
import TriCloudSection from "@/components/landing-page/tri-cloud-section";
import AgentSwarmSection from "@/components/landing-page/agent-swarm-section";
import EnterpriseConnectorsSection from "@/components/landing-page/enterprise-connectors-section";
import DeterministicControlSection from "@/components/landing-page/deterministic-control-section";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
