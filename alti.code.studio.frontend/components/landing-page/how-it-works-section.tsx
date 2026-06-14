"use client";
import { useEffect, useRef } from "react";

function HowItWorksSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      const handleLoadedData = () => {
        video.playbackRate = 0.5;
      };

      // If video is already loaded
      if (video.readyState >= 3) {
        handleLoadedData();
      } else {
        // Wait for video to load
        video.addEventListener("loadeddata", handleLoadedData);
      }

      return () => {
        video.removeEventListener("loadeddata", handleLoadedData);
      };
    }
  }, []);

  const steps = [
    {
      title: "1. Plan",
      description:
        "Ingest developer intent with DLP privacy redacting, map Spanner AST codebase dependency graphs, and plan system architecture.",
    },
    {
      title: "2. Design",
      description:
        "Perform multi-modal analysis on Figma templates or wireframe uploads, automatically extracting visual components to code them in parallel.",
    },
    {
      title: "3. Develop",
      description:
        "Spin up specialized agent swarms and dynamically register custom Nano-Agents for context-aware code generation.",
    },
    {
      title: "4. Test",
      description:
        "Run autonomous QA audits, security checks for credential leaks, and E2E Playwright validation in air-gapped sandboxes.",
    },
    {
      title: "5. Deploy",
      description:
        "Intelligently route containerized workloads to the optimal host across 66 cloud providers with high-availability failover.",
    },
  ];

  return (
    <section
      className="w-full bg-white text-black py-24 md:py-32 border-b border-zinc-100 overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
      id="howItsWork"
    >
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center gap-3 md:gap-5 text-center max-w-4xl mb-16">
        <h2 className="font-secondary font-bold text-zinc-900 text-3xl md:text-4xl lg:text-5xl">
          How It Works
        </h2>
        <p className="font-normal text-sm text-zinc-500 md:text-base text-center max-w-2xl">
          Go from concept to live deployment in five sovereign steps.
        </p>
      </div>

      {/* Horizontal Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-7xl relative mb-20">
        {/* Connecting Horizontal Line (Desktop only) */}
        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-zinc-100 z-0" />

        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center md:items-start text-center md:text-left group relative z-10 p-5 rounded-2xl border border-transparent hover:border-zinc-100 hover:bg-zinc-50/50 transition-all duration-300"
          >
            {/* Step Number Circle */}
            <div className="flex items-center justify-center h-[56px] w-[56px] rounded-full border-2 border-zinc-200 bg-white font-semibold text-zinc-900 group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300 mb-6 shadow-sm">
              <span className="text-lg">{idx + 1}</span>
            </div>

            {/* Title & Description */}
            <h3 className="font-secondary font-bold text-zinc-900 text-xl mb-3">
              {step.title}
            </h3>
            <p className="font-normal text-sm text-zinc-500 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Video Browser Mockup Frame */}
      <div className="w-full max-w-4xl px-4">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 bg-zinc-950 aspect-video">
          {/* Browser Window Chrome header */}
          <div className="h-10 bg-zinc-100 border-b border-zinc-200 flex items-center px-4 gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
            <div className="ml-4 h-6 w-80 rounded bg-white border border-zinc-200 flex items-center px-3 text-[10px] text-zinc-400 select-none">
              localhost:3000
            </div>
          </div>
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-[calc(100%-40px)] object-cover"
          >
            <source src="/how.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
