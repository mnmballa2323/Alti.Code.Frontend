"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-gray-100 text-black flex flex-col font-sans overflow-hidden">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-6 py-8 md:py-0 h-[calc(100vh-80px)]">
        {/* Floating Design Container */}
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center bg-white border border-gray-100 rounded-[32px] p-8 md:p-12 shadow-xl">
          
          {/* Left Side: Title & Action Buttons (col-span-6) */}
          <div className="md:col-span-6 flex flex-col items-center md:items-start text-center md:text-left gap-5">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black leading-tight md:whitespace-nowrap">
              Downloading Inso Code
            </h1>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Your download for Windows should begin automatically. If it didn't start, please click below.
            </p>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 w-full mt-2">
              <Button
                as="a"
                href={DOWNLOAD_LINKS.windows}
                className="w-full lg:w-auto bg-black text-white font-semibold rounded-full px-8 py-6 text-sm hover:scale-[1.02] transition-transform shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Setup
              </Button>
              <Button
                as={Link}
                href="/"
                className="w-full lg:w-auto bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-full px-8 py-6 text-sm hover:bg-gray-100 hover:text-black transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
          </div>

          {/* Desktop Divider (col-span-1) */}
          <div className="hidden md:block w-px h-64 bg-gray-100 col-span-1 justify-self-center" />

          {/* Right Side: Instructions (col-span-5) */}
          <div className="md:col-span-5 flex flex-col justify-center">
            <h2 className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <Info className="w-4 h-4 text-black" />
              How to install on Windows
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black">Run the Installer</h3>
                  <p className="text-xs text-gray-505 mt-1 leading-relaxed">
                    Locate the <code className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 font-mono text-[10px] text-black">Inso-Code-setup.exe</code> file in your local <strong>Downloads folder</strong> and double-click it to start the setup wizard.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black">Configure Settings</h3>
                  <p className="text-xs text-gray-505 mt-1 leading-relaxed">
                    Follow the <strong>installation prompts</strong>, choose your preferred target folder path, and click <strong>Install</strong> to copy all core files.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black">Launch Inso Code</h3>
                  <p className="text-xs text-gray-505 mt-1 leading-relaxed">
                    Double-click the <strong>desktop shortcut icon</strong> or search for <strong>Inso Code</strong> in the Start menu to launch your developer space.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
