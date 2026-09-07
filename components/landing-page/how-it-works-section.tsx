"use client";
import { Network, TestTube, Bot, ShieldCheck, Server } from "lucide-react";

function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Architect",
      description: "Master node maps all core execution phases.",
      icon: <Network className="w-6 h-6 text-[#0000ff]" />,
    },
    {
      step: "02",
      title: "Test Driven",
      description: "Agents mandate an 80% test coverage baseline.",
      icon: <TestTube className="w-6 h-6 text-[#0000ff]" />,
    },
    {
      step: "03",
      title: "Swarm Execution",
      description: "Specialized experts build new features in parallel.",
      icon: <Bot className="w-6 h-6 text-[#0000ff]" />,
    },
    {
      step: "04",
      title: "Sovereign Audit",
      description: "AST scans enforce strict security compliance.",
      icon: <ShieldCheck className="w-6 h-6 text-[#0000ff]" />,
    },
    {
      step: "05",
      title: "Native Deploy",
      description: "Artifacts are HSM signed for safe deployment.",
      icon: <Server className="w-6 h-6 text-[#0000ff]" />,
    },
  ];

  return (
    <section
      className="w-full bg-white text-black py-24 md:py-32 overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative"
      id="howItsWork"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center relative z-10 w-full">
        {/* Header Section */}
        <div className="flex flex-col gap-6 max-w-5xl w-full px-4 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-black">
            How It Works
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed font-medium max-w-2xl mx-auto">
            From concept to sovereign deployment through our strict autonomous
            pipeline.
          </p>
        </div>

        {/* Horizontal Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 w-full max-w-7xl px-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-start p-6 sm:p-8 rounded-3xl bg-zinc-100 hover:bg-zinc-200 hover:-translate-y-1 transition-all duration-300 text-center border"
              style={{
                borderColor: "#2563EB",
                boxShadow: "0 4px 20px rgba(37, 99, 235, 0.15)",
              }}
            >
              {/* Step Capsule Badge */}
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-4 relative z-10">
                Step {step.step}
              </span>

              {/* Icon Circle */}
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl mb-4 shadow-sm border border-zinc-300 bg-white transition-transform duration-300 group-hover:scale-110 shrink-0">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="font-sans font-bold text-black text-lg tracking-tight relative z-10 mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-zinc-600 leading-relaxed font-medium line-clamp-2">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
