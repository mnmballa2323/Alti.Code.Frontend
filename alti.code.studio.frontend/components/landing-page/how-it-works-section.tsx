"use client";
import { Compass, Layers, Code2, ShieldCheck, Zap } from "lucide-react";

function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Plan",
      icon: <Compass className="w-6 h-6 text-blue-400" />,
    },
    {
      step: "02",
      title: "Design",
      icon: <Layers className="w-6 h-6 text-blue-400" />,
    },
    {
      step: "03",
      title: "Develop",
      icon: <Code2 className="w-6 h-6 text-blue-400" />,
    },
    {
      step: "04",
      title: "Test",
      icon: <ShieldCheck className="w-6 h-6 text-blue-400" />,
    },
    {
      step: "05",
      title: "Deploy",
      icon: <Zap className="w-6 h-6 text-sky-400" />,
    },
  ];

  return (
    <section
      className="w-full bg-[#030014] text-white py-24 md:py-32 overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative"
      id="howItsWork"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center relative z-10 w-full">
        {/* Header Section */}
        <div className="flex flex-col gap-6 max-w-5xl w-full px-4 text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white">
            How It Works
          </h2>
          <p className="text-xl text-zinc-400 leading-relaxed font-medium max-w-2xl mx-auto">
            Go from concept to live deployment in five sovereign steps.
          </p>
        </div>

        {/* Horizontal Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 w-full max-w-7xl px-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-blue-500/30 hover:border-blue-400/60 hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden text-center"
              style={{
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.15), 0 0 60px rgba(59, 130, 246, 0.05), inset 0 0 0 1px rgba(255,255,255,0.05)"
              }}
            >
              {/* Top-right glow blob */}
              <div className="absolute -top-8 -right-8 w-[180px] h-[180px] rounded-full blur-[50px] bg-blue-500/15 group-hover:bg-blue-500/30 transition-all duration-500 pointer-events-none" />
              {/* Bottom-left glow blob */}
              <div className="absolute -bottom-8 -left-8 w-[120px] h-[120px] rounded-full blur-[40px] bg-sky-500/10 group-hover:bg-sky-500/20 transition-all duration-500 pointer-events-none" />

              {/* Step Capsule Badge */}
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-4 relative z-10">
                Step {step.step}
              </span>

              {/* Icon Circle */}
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl mb-5 shadow-sm border border-blue-800/50 bg-blue-900/30 transition-transform duration-300 group-hover:scale-110 relative z-10">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="font-sans font-bold text-white text-lg tracking-tight relative z-10">
                {step.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
