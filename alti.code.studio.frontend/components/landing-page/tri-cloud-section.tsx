"use client";

import { Card, CardHeader, CardBody, Divider } from "@heroui/react";
import { Server, Database, Cloud } from "lucide-react";

const providers = [
  {
    name: "Azure OpenAI Foundry",
    logo: <Server className="w-8 h-8 text-blue-500" />,
    description: "Enterprise-grade deployment of OpenAI's most advanced reasoning engines.",
    models: ["GPT-4o", "o1-Preview", "GPT-4 Turbo"],
    color: "from-blue-500/20 to-transparent",
    borderColor: "border-blue-500/30"
  },
  {
    name: "AWS Bedrock",
    logo: <Database className="w-8 h-8 text-orange-500" />,
    description: "Highly secure, deeply integrated access to Anthropic's Claude 3 family.",
    models: ["Claude 3.5 Sonnet", "Claude 3 Opus", "Claude 3 Haiku"],
    color: "from-orange-500/20 to-transparent",
    borderColor: "border-orange-500/30"
  },
  {
    name: "GCP Vertex AI",
    logo: <Cloud className="w-8 h-8 text-green-500" />,
    description: "Massive context window intelligence powered by Google DeepMind.",
    models: ["Gemini 1.5 Pro", "Gemini 1.5 Flash", "Gemini Ultra"],
    color: "from-green-500/20 to-transparent",
    borderColor: "border-green-500/30"
  }
];

export default function TriCloudSection() {
  return (
    <section id="architecture" className="w-full py-24 bg-black text-white px-4 border-t border-white/5 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-blue-900/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center gap-16 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl">
          <h2 className="text-sm font-semibold tracking-widest text-blue-400 uppercase">
            The Tri-Cloud Intelligence Engine
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold font-secondary">
            No API Keys. No Rate Limits.
          </h3>
          <p className="text-lg text-default-400 leading-relaxed">
            Direct SDK connections to foundational models are blocked for security. 
            Instead, Alti Code Studio routes every prompt through our ultra-secure, 
            zero-markup Tri-Cloud infrastructure. You get unlimited access to the absolute 
            latest state-of-the-art models.
          </p>
        </div>

        {/* The 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {providers.map((provider, idx) => (
            <Card 
              key={idx} 
              className={`bg-white/5 backdrop-blur-md border ${provider.borderColor} hover:bg-white/10 transition-all duration-300 overflow-hidden`}
              shadow="lg"
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${provider.color} opacity-50 pointer-events-none`} />
              
              <CardHeader className="flex flex-col items-start gap-4 p-8 relative z-10">
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
                  {provider.logo}
                </div>
                <h4 className="text-2xl font-bold text-white">{provider.name}</h4>
                <p className="text-default-400 text-sm leading-relaxed">
                  {provider.description}
                </p>
              </CardHeader>
              
              <Divider className="bg-white/10" />
              
              <CardBody className="p-8 relative z-10">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Supported Models</p>
                <ul className="flex flex-col gap-3">
                  {provider.models.map((model, mIdx) => (
                    <li key={mIdx} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      <span className="text-white font-medium">{model}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
