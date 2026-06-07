import React from "react";
import { UserCircle, Code2, Cpu, Sparkles, TerminalSquare, ArrowRightLeft } from "lucide-react";

export default function PairedProgrammerSection() {
  return (
    <section className="relative w-full py-24 overflow-hidden bg-black text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-3xl mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium tracking-wide text-gray-300">SYNERGISTIC DEVELOPMENT</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
            Your Ultimate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              AI Pair Programmer
            </span>
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            It doesn't replace you—it amplifies you. You are the architect. The AI is your tireless, elite engineering team, standing by to execute your every command at the speed of thought.
          </p>
        </div>

        {/* Synergy Visualization Box */}
        <div className="w-full max-w-5xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl relative group overflow-hidden">
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
            
            {/* The Human Architect */}
            <div className="flex-1 flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                <UserCircle className="w-12 h-12 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">The Human Architect</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  You provide the vision, the architecture, and the business logic. You make the executive decisions.
                </p>
              </div>
            </div>

            {/* Connection / Flow */}
            <div className="flex flex-col items-center justify-center space-y-3 relative">
              <div className="w-px h-12 md:w-24 md:h-px bg-gradient-to-b md:bg-gradient-to-r from-blue-500/50 to-purple-500/50 absolute top-1/2 -translate-y-1/2 -z-10"></div>
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-xl z-10 animate-pulse">
                <ArrowRightLeft className="w-5 h-5 text-gray-300 md:rotate-0 rotate-90" />
              </div>
              <span className="text-xs font-semibold text-indigo-400 tracking-widest uppercase">Command Flow</span>
            </div>

            {/* The AI Swarm */}
            <div className="flex-1 flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                <Cpu className="w-12 h-12 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">The AI Swarm</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We write the boilerplate, debug the syntax, test the edges, and deploy the infrastructure instantly.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-6xl">
          <FeatureCard 
            icon={<TerminalSquare className="w-6 h-6 text-emerald-400" />}
            title="Command-Driven"
            description="Just tell it what to do. The AI parses your intent and translates it into production-ready code across the entire stack."
          />
          <FeatureCard 
            icon={<Code2 className="w-6 h-6 text-blue-400" />}
            title="Context-Aware"
            description="It reads your entire codebase, understands your unique conventions, and writes code exactly like you do."
          />
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6 text-amber-400" />}
            title="Tireless Execution"
            description="Pass it an epic from Jira, go to sleep, and wake up to a fully implemented feature branch with tests."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group cursor-default flex flex-col items-start text-left">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h4 className="text-xl font-semibold text-white mb-3">{title}</h4>
      <p className="text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
