"use client";
import { useEffect, useRef } from "react";

import VerticalSteps from "./VerticalSteps";

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
      title: "Upload Files",
      des: "Upload your documents and the chatbot will process and analyze all your files seamlessly, extracting all of the relevant information.",
      img: "/assets/svgs/upload.svg",
    },
    {
      title: "Ask Anything",
      des: "Query your documents in natural language and get instant, accurate answers with specific citations and references directly from your internal documents.",
      img: "/assets/svgs/chat.svg",
    },
    {
      title: "Extract Insights",
      des: "Discover hidden patterns, relationships, and insights across your entire document repository that a manual human review would miss.",
      img: "/assets/svgs/insight.svg",
    },
  ];

  return (
    <section
      className="w-full bg-white text-black py-32 border-b border-zinc-100 overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
      id="howItsWork"
    >
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center gap-3 md:gap-5 text-center max-w-4xl">
        <h2 className="font-secondary font-bold text-zinc-900 text-3xl md:text-4xl lg:text-5xl">
          How It Works
        </h2>
        <p className="font-normal text-sm text-zinc-500 md:text-base text-center max-w-2xl">
          Go from concept to live deployment in five sovereign steps.
        </p>
      </div>

      {/* Steps Section */}
      <div className="mt-12 md:mt-20 lg:mt-[100px] lg:space-x-[100px] flex max-lg:flex-wrap justify-center items-center w-full max-w-7xl">
        {/* Desktop Layout */}
        <div className="flex items-start justify-center gap-0 relative">
          <VerticalSteps
            steps={[
              {
                title: "1. Plan & Architect",
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
            ]}
          />
        </div>

        {/* Bottom 80% - Video background */}
        <div className="relative lg:max-w-[500px] w-full mt-8 mr-[-100px] h-[320px]">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/how.mp4" type="video/mp4" />
            {/* <source src="/path/to/your/video.webm" type="video/webm" /> */}
            Your browser does not support the video tag.
          </video>

          {/* Optional overlay for better text visibility if you want to add content here */}
          {/* <div className="absolute inset-0 bg-black/20"></div> */}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
