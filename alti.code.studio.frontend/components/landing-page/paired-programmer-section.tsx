import React from "react";
import { UserCircle, Code2, TerminalSquare } from "lucide-react";

export default function PairedProgrammerSection() {
  return (
    <section className="w-full py-24 bg-black flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center">
        
        {/* Apple-style Headline */}
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">
          Your AI pair programmer.
        </h2>
        
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl font-medium tracking-tight mb-16 leading-relaxed">
          It doesn't replace you. It amplifies you. You are the architect, and the swarm is your tireless engineering team ready to execute every command.
        </p>

        {/* Simple Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <FeatureCard 
            icon={<TerminalSquare className="w-8 h-8 text-white" />}
            title="Command-Driven"
            description="Provide the vision. The AI parses your intent and translates it into production-ready code instantly."
          />
          <FeatureCard 
            icon={<UserCircle className="w-8 h-8 text-white" />}
            title="Human in Control"
            description="You make the executive decisions. The swarm handles the boilerplate, debugging, and testing."
          />
          <FeatureCard 
            icon={<Code2 className="w-8 h-8 text-white" />}
            title="Native Integration"
            description="It reads your codebase, understands your unique conventions, and writes code exactly like you do."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-start text-left p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-sm hover:border-white/20 transition-colors">
      <div className="mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white tracking-tight mb-3">
        {title}
      </h3>
      <p className="text-gray-400 leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}
