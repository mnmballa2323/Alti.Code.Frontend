"use client";

import { Blocks, Github, Slack, Database, Server, GitMerge, FileCode, MonitorSmartphone } from "lucide-react";

export default function EnterpriseConnectorsSection() {
  const connectors = [
    { name: "GitHub", icon: <Github className="w-8 h-8" />, color: "hover:text-white" },
    { name: "GitLab", icon: <GitMerge className="w-8 h-8" />, color: "hover:text-orange-400" },
    { name: "Slack", icon: <Slack className="w-8 h-8" />, color: "hover:text-pink-400" },
    { name: "Supabase", icon: <Database className="w-8 h-8" />, color: "hover:text-green-400" },
    { name: "AWS", icon: <Server className="w-8 h-8" />, color: "hover:text-yellow-400" },
    { name: "Vercel", icon: <Blocks className="w-8 h-8" />, color: "hover:text-white" },
    { name: "VS Code", icon: <FileCode className="w-8 h-8" />, color: "hover:text-blue-400" },
    { name: "Mobile", icon: <MonitorSmartphone className="w-8 h-8" />, color: "hover:text-purple-400" },
  ];

  // We duplicate the array to create a seamless infinite scroll effect
  const scrollingItems = [...connectors, ...connectors, ...connectors];

  return (
    <section className="w-full py-24 bg-black text-white px-4 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
        
        <div className="flex flex-col gap-4 max-w-2xl">
          <h2 className="text-sm font-semibold tracking-widest text-pink-400 uppercase">
            Universal Ecosystem
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold font-secondary">
            44+ App Connectors. Zero Friction.
          </h3>
          <p className="text-lg text-default-400">
            Alti Code Studio isn&apos;t a walled garden. Your swarm connects directly to the tools 
            your engineering team already uses. From CI/CD pipelines to chat ops, we integrate everywhere.
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full max-w-5xl mt-12">
          {/* Fade Edges */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
          
          <div className="flex w-full overflow-hidden">
            <div className="flex animate-[scroll_30s_linear_infinite] gap-12 sm:gap-24 items-center shrink-0 min-w-full justify-around pr-12 sm:pr-24">
              {scrollingItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col items-center gap-3 text-white/30 transition-colors duration-300 ${item.color} grayscale hover:grayscale-0`}
                >
                  {item.icon}
                  <span className="text-sm font-semibold tracking-wide uppercase">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
