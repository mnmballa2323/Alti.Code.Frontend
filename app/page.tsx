"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/navbar";
import HeroSwarm from "@/components/landing-page/hero-swarm";
import AuroraBackground from "@/components/landing-page/aurora-background";
import Footer from "@/components/footer";

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
      router.replace("/code");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white w-full overflow-x-hidden font-sans relative">
      <AuroraBackground />

      <Navbar />

      <main className="flex-1 flex flex-col w-full relative z-10">
        <div id="section-0">
          <HeroSwarm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
