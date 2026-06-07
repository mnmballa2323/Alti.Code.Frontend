"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@heroui/react";
import { ArrowLeft, Download, Info, CheckCircle2 } from "lucide-react";

import { DOWNLOAD_LINKS } from "@/lib/config";
import Navbar from "@/components/navbar";

export default function DownloadMacPage() {
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    // Small delay to let page transition complete before triggering download
    const timer = setTimeout(() => {
      const link = document.createElement("a");
      link.href = DOWNLOAD_LINKS.mac;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadStarted(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-xl w-full z-10">
          {/* Main Download Card */}
          <div className="bg-neutral-950/80 border border-neutral-900 rounded-[32px] p-8 md:p-10 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
            
            {/* Logo animation */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-neutral-900 border border-neutral-800 p-4 rounded-3xl shadow-inner animate-bounce duration-[3000ms]">
                <Image
                  alt="Alti Logo Icon"
                  className="w-12 h-12 object-contain"
                  height={48}
                  src="/logo-white.png"
                  width={48}
                />
              </div>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight mb-3">
              Downloading Alti Code Studio
            </h1>
            <p className="text-neutral-400 text-sm md:text-base max-w-sm mb-6 leading-relaxed">
              Your download for macOS should begin automatically. If it didn't start, please click the button below.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row items-center mb-8">
              <Button
                as="a"
                href={DOWNLOAD_LINKS.mac}
                className="w-full sm:w-auto bg-white text-black font-semibold rounded-full px-8 py-6 text-sm hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download DMG
              </Button>
              <Button
                as={Link}
                href="/"
                className="w-full sm:w-auto bg-neutral-900/60 border border-neutral-800 text-neutral-300 font-semibold rounded-full px-8 py-6 text-sm hover:bg-neutral-900 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </div>

            {/* Installation Steps */}
            <div className="w-full border-t border-neutral-900 pt-8 text-left">
              <h2 className="text-sm uppercase font-bold tracking-widest text-neutral-500 mb-5 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                How to install on macOS
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-300">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-200">Open the Disk Image</h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      Locate <code className="bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 font-mono text-[10px] text-indigo-300">Alti-Code-Studio.dmg</code> in your Downloads folder and open it.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-300">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-200">Drag to Applications</h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      Drag the **Alti Code Studio** icon into your **Applications** folder in the window that appears.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-300">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-200">Open & Trust App</h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      Double-click Alti Code Studio from your Applications folder. If prompted with a security warning, right-click the app and choose "Open".
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
