"use client";

import { Card, CardHeader, CardBody } from "@heroui/react";

const providers = [
  {
    name: "Azure Foundry",
    logo: <img src="/assets/cloud-logos/azure.svg" className="w-8 h-8" alt="Azure Foundry" />,
    description: <>Enterprise Grade access to OpenAI's <br /> library of large language models.</>,
    models: [
      { name: "GPT-5.5 Instant", inputPrice: "$1.50", outputPrice: "$4.50" },
      { name: "GPT-5.5", inputPrice: "$5.00", outputPrice: "$30.00" },
      { name: "GPT-5.5 Pro", inputPrice: "$15.00", outputPrice: "$75.00" }
    ],
  },
  {
    name: "AWS Bedrock",
    logo: <img src="/assets/cloud-logos/aws.svg" className="w-8 h-8" alt="AWS Bedrock" />,
    description: "Highly secure, deeply integrated access to Anthropic's Claude 5 family of models.",
    models: [
      { name: "Claude 4.5 Haiku", inputPrice: "$0.25", outputPrice: "$1.25" },
      { name: "Claude Sonnet 5", inputPrice: "$3.00", outputPrice: "$15.00" },
      { name: "Claude 4.7 Opus", inputPrice: "$15.00", outputPrice: "$75.00" }
    ],
  },
  {
    name: "GCP Vertex AI",
    logo: <img src="/assets/cloud-logos/gcp.svg" className="w-8 h-8" alt="GCP Vertex AI" />,
    description: "Massive context window intelligence powered by Google DeepMind.",
    models: [
      { name: "Gemini Omni Flash", inputPrice: "$0.75", outputPrice: "$4.50" },
      { name: "Gemini 3.5 Flash", inputPrice: "$1.50", outputPrice: "$9.00" },
      { name: "Gemini 3.5 Pro", inputPrice: "$7.00", outputPrice: "$21.00" }
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
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Supported Models</p>
                  <div className="flex gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <span className="w-16 text-left">Input</span>
                    <span className="w-16 text-left pl-1">Output</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-4">
                  {provider.models.map((model, mIdx) => (
                    <li key={mIdx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                        <span className="text-gray-900 font-medium whitespace-nowrap">{model.name}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-sm text-gray-500 font-medium w-16 text-left">{model.inputPrice}</span>
                        <span className="text-sm text-gray-500 font-medium w-16 text-left pl-1">{model.outputPrice}</span>
                      </div>
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
