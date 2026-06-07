"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@heroui/react";
import { ArrowLeft, Download, Info } from "lucide-react";

import { DOWNLOAD_LINKS } from "@/lib/config";
import Navbar from "@/components/navbar";

export default function DownloadWindowsPage() {
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const link = document.createElement("a");
      link.href = DOWNLOAD_LINKS.windows;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadStarted(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <div className="max-w-xl w-full z-10">
          
          {/* Main Download Card */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-xl flex flex-col items-center text-center">
            
            {/* Logo container */}
            <div className="w-20 h-20 mb-6 flex items-center justify-center bg-gray-50 border border-gray-100 p-4 rounded-3xl shadow-sm">
              <Image
                alt="Alti Logo Icon"
                className="w-10 h-10 object-contain"
                height={40}
                src="/alti-logo.png"
                width={40}
              />
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 text-black">
              Downloading Alti Code Studio
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-sm mb-8 leading-relaxed">
              Your download for Windows should begin automatically. If it didn't start, please click the button below.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row items-center mb-8">
              <Button
                as="a"
                href={DOWNLOAD_LINKS.windows}
                className="w-full sm:w-auto bg-black text-white font-semibold rounded-full px-8 py-6 text-sm hover:scale-[1.02] transition-transform shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Setup
              </Button>
              <Button
                as={Link}
                href="/"
                className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-full px-8 py-6 text-sm hover:bg-gray-100 hover:text-black transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </div>

            {/* Installation Steps */}
            <div className="w-full border-t border-gray-100 pt-8 text-left">
              <h2 className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                <Info className="w-4 h-4 text-black" />
                How to install on Windows
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-black">Run the Installer</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Locate <code className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 font-mono text-[10px] text-black">Alti-Code-Studio-setup.exe</code> in your Downloads folder and double-click it.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-black">Follow Steps</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Agree to the prompts, configure your target location if desired, and click install.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-black">Launch Alti Code Studio</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Click the desktop icon or run the application directly to begin engineering your next project.
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
