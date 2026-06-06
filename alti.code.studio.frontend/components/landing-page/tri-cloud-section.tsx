"use client";

import { Card, CardHeader, CardBody } from "@heroui/react";

const providers = [
  {
    name: "Azure Foundry",
    logo: <img src="/assets/cloud-logos/azure.svg" className="w-8 h-8" alt="Azure Foundry" />,
    description: <>Enterprise Grade access to <br /> OpenAI's advanced models.</>,
    models: ["GPT-5.5 Pro", "GPT-5.5", "GPT-5.5 Instant"],
  },
  {
    name: "AWS Bedrock",
    logo: <img src="/assets/cloud-logos/aws.svg" className="w-8 h-8" alt="AWS Bedrock" />,
    description: "Highly secure, deeply integrated access to Anthropic's Claude 5 family.",
    models: ["Claude 4.7 Opus", "Claude Sonnet 5", "Claude 4.5 Haiku"],
  },
  {
    name: "GCP Vertex AI",
    logo: <img src="/assets/cloud-logos/gcp.svg" className="w-8 h-8" alt="GCP Vertex AI" />,
    description: "Massive context window intelligence powered by Google DeepMind.",
    models: ["Gemini 3.5 Pro", "Gemini 3.5 Flash", "Gemini Omni Flash"],
  }
];

export default function TriCloudSection() {
  return (
    <section id="architecture" className="w-full py-32 bg-white text-black px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-20">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-6 max-w-4xl">
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
            Tri-Cloud Intelligence
          </h2>
          <h3 className="text-5xl md:text-6xl font-bold tracking-tight text-black leading-tight">
            No API Keys. <br />No Rate Limits.
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            Direct SDK connections to foundational models are blocked for security. 
            Instead, Alti Code Studio routes every prompt through our ultra-secure, 
            zero-markup Tri-Cloud infrastructure. You get unlimited access to the absolute 
            latest state-of-the-art models.
          </p>
        </div>

        {/* The 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {providers.map((provider, idx) => (
            <Card 
              key={idx} 
              className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-3xl overflow-hidden"
              shadow="none"
            >
              <CardHeader className="flex flex-col items-start gap-6 p-10">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  {provider.logo}
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-2xl font-semibold tracking-tight text-black">{provider.name}</h4>
                  <p className="text-gray-500 text-base leading-relaxed">
                    {provider.description}
                  </p>
                </div>
              </CardHeader>
              
              <div className="w-full h-px bg-gray-100" />
              
              <CardBody className="p-10">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Supported Models</p>
                <ul className="flex flex-col gap-4">
                  {provider.models.map((model, mIdx) => (
                    <li key={mIdx} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      <span className="text-gray-900 font-medium">{model}</span>
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
