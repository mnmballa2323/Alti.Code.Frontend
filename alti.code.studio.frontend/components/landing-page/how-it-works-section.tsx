"use client";
import { cn } from "@heroui/react";
import { Compass, Layers, Code2, ShieldCheck, Zap } from "lucide-react";

function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Plan",
      icon: <Compass className="w-6 h-6 text-blue-600" />,
      border: "hover:border-blue-200",
      glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]",
    },
    {
      step: "02",
      title: "Design",
      icon: <Layers className="w-6 h-6 text-purple-600" />,
      border: "hover:border-purple-200",
      glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]",
    },
    {
      step: "03",
      title: "Develop",
      icon: <Code2 className="w-6 h-6 text-indigo-600" />,
      border: "hover:border-indigo-200",
      glow: "hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]",
    },
    {
      step: "04",
      title: "Test",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      border: "hover:border-emerald-200",
      glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]",
    },
    {
      step: "05",
      title: "Deploy",
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      border: "hover:border-amber-200",
      glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]",
    },
  ];

  return (
    <section
      className="w-full bg-white text-black py-24 md:py-32 border-b border-zinc-100 overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
      id="howItsWork"
    >
      {/* Header Section */}
      <div className="flex flex-col gap-6 max-w-5xl w-full px-4 text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-zinc-900">
          How It Works
        </h2>
        <p className="text-xl text-gray-500 leading-relaxed font-medium max-w-2xl mx-auto">
          Go from concept to live deployment in five sovereign steps.
        </p>
      </div>

      {/* Horizontal Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 w-full max-w-7xl px-4">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={cn(
              "flex flex-col items-center justify-center p-8 rounded-3xl bg-zinc-100/60 border border-zinc-200/60 text-center relative group transition-all duration-300 hover:bg-white hover:-translate-y-1 hover:shadow-lg",
              step.border,
              step.glow
            )}
          >
            {/* Step Capsule Badge */}
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-4">
              Step {step.step}
            </span>

            {/* Icon Circle (White Box) */}
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl mb-5 shadow-sm border border-zinc-200/50 bg-white transition-transform duration-300 group-hover:scale-110">
              {step.icon}
            </div>

            {/* Title */}
            <h3 className="font-sans font-bold text-zinc-900 text-lg tracking-tight">
              {step.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;
