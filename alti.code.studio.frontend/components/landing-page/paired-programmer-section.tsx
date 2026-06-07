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

        <p className="text-xl md:text-2xl text-gray-400 w-full font-medium tracking-tight mb-16 leading-relaxed">
          It doesn't replace you. It amplifies you. You are the architect, and
          the
          <br className="hidden md:block" /> swarm is your tireless engineering
          team ready to execute every command.
        </p>

        {/* Simple Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <FeatureCard
            description="Provide the vision and intent. The AI swarm instantly translates your commands into production ready code."
            icon={<TerminalSquare className="w-8 h-8 text-black" />}
            title="Command Driven"
          />
          <FeatureCard
            description="You make the executive decisions. The AI swarm handles all the development, testing, and debugging."
            icon={<UserCircle className="w-8 h-8 text-black" />}
            title="Human in Control"
          />
          <FeatureCard
            description="It reads your entire codebase, understands your unique conventions, and writes code exactly the way you do."
            icon={<Code2 className="w-8 h-8 text-black" />}
            title="Native Integration"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start text-left p-8 rounded-3xl bg-gray-100 border border-transparent shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-bold text-black tracking-tight mb-3">
        {title}
      </h3>
      <p className="text-gray-500 leading-relaxed font-medium text-balance">
        {description}
      </p>
    </div>
  );
}
