"use client";

import { Blocks, Github, Slack, Database, Server, GitMerge, FileCode, MonitorSmartphone } from "lucide-react";

export default function EnterpriseConnectorsSection() {
  const connectors = [
    { name: "GitHub", icon: <Github className="w-8 h-8" /> },
    { name: "GitLab", icon: <GitMerge className="w-8 h-8" /> },
    { name: "Slack", icon: <Slack className="w-8 h-8" /> },
    { name: "Supabase", icon: <Database className="w-8 h-8" /> },
    { name: "AWS", icon: <Server className="w-8 h-8" /> },
    { name: "Vercel", icon: <Blocks className="w-8 h-8" /> },
    { name: "VS Code", icon: <FileCode className="w-8 h-8" /> },
    { name: "Mobile", icon: <MonitorSmartphone className="w-8 h-8" /> },
  ];

  // We duplicate the array to create a seamless infinite scroll effect
  const scrollingItems = [...connectors, ...connectors, ...connectors];

  return (
    <section className="w-full py-32 bg-[#F5F5F7] text-black px-4 border-t border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-12">
        
        <div className="flex flex-col gap-6 max-w-3xl">
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
            Universal Ecosystem
          </h2>
          <h3 className="text-5xl md:text-6xl font-bold tracking-tight text-black leading-tight">
            44+ App Connectors. <br />Zero Friction.
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            Alti Code Studio isn&apos;t a walled garden. Your swarm connects directly to the tools 
            your engineering team already uses. From CI/CD pipelines to chat ops, we integrate everywhere.
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full max-w-6xl mt-16">
          {/* Fade Edges */}
          <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-[#F5F5F7] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-[#F5F5F7] to-transparent z-10 pointer-events-none" />
          
          <div className="flex w-full overflow-hidden py-10">
            <div className="flex animate-[scroll_30s_linear_infinite] gap-16 sm:gap-32 items-center shrink-0 min-w-full justify-around pr-16 sm:pr-32">
              {scrollingItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col items-center gap-4 text-gray-400 hover:text-black transition-colors duration-300"
                >
                  {item.icon}
                  <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
