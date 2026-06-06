"use client";

import { Card, CardHeader, CardBody } from "@heroui/react";

const providers = [
  {
    name: "Azure Foundry",
    logo: <img src="/assets/cloud-logos/azure.svg" className="w-8 h-8" alt="Azure Foundry" />,
    description: <>Enterprise Grade access to OpenAI's <br /> library of large language models.</>,
    models: [
      { name: "GPT-5.5 Instant", price: "$1.50 In / $4.50 Out" },
      { name: "GPT-5.5", price: "$5.00 In / $30.00 Out" },
      { name: "GPT-5.5 Pro", price: "$15.00 In / $75.00 Out" }
    ],
  },
  {
    name: "AWS Bedrock",
    logo: <img src="/assets/cloud-logos/aws.svg" className="w-8 h-8" alt="AWS Bedrock" />,
    description: "Highly secure, deeply integrated access to Anthropic's Claude 5 family of models.",
    models: [
      { name: "Claude 4.5 Haiku", price: "$0.25 In / $1.25 Out" },
      { name: "Claude Sonnet 5", price: "$3.00 In / $15.00 Out" },
      { name: "Claude 4.7 Opus", price: "$15.00 In / $75.00 Out" }
    ],
  },
  {
    name: "GCP Vertex AI",
    logo: <img src="/assets/cloud-logos/gcp.svg" className="w-8 h-8" alt="GCP Vertex AI" />,
    description: "Massive context window intelligence powered by Google DeepMind.",
    models: [
      { name: "Gemini Omni Flash", price: "$0.75 In / $4.50 Out" },
      { name: "Gemini 3.5 Flash", price: "$1.50 In / $9.00 Out" },
      { name: "Gemini 3.5 Pro", price: "$7.00 In / $21.00 Out" }
    ],
  }
];

export default function TriCloudSection() {
  return (
    <section id="architecture" className="w-full py-32 bg-white text-black px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-20">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-6 max-w-4xl">

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
              className="bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-3xl overflow-hidden"
              shadow="none"
            >
              <CardHeader className="flex flex-col items-start gap-6 p-10">
                <div className="p-4 rounded-2xl bg-white border border-gray-100">
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
                    <li key={mIdx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                        <span className="text-gray-900 font-medium">{model.name}</span>
                      </div>
                      <span className="text-sm text-gray-500 font-medium">{model.price}</span>
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
