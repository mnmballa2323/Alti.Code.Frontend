"use client";

import { Card, CardHeader, CardBody } from "@heroui/react";

const providers = [
  {
    name: "Azure Foundry",
    logo: (
      <img
        alt="Azure Foundry"
        className="w-8 h-8"
        src="/assets/cloud-logos/azure.svg"
      />
    ),
    description: (
      <>
        Enterprise Grade access to OpenAI's <br /> library of large language
        models.
      </>
    ),
    models: [
      { name: "GPT-5.5", inputPrice: "$5.00", outputPrice: "$30.00" },
      { name: "GPT-5.5 Pro", inputPrice: "$10.00", outputPrice: "$45.00" },
    ],
  },
  {
    name: "AWS Bedrock",
    logo: (
      <img
        alt="AWS Bedrock"
        className="w-8 h-8"
        src="/assets/cloud-logos/aws.svg"
      />
    ),
    description:
      "Highly secure, deeply integrated access to Anthropic's Claude family of models.",
    models: [
      { name: "Claude Sonnet 4.6", inputPrice: "$3.00", outputPrice: "$15.00" },
      { name: "Claude Opus 4.8", inputPrice: "$5.00", outputPrice: "$25.00" },
    ],
  },
  {
    name: "GCP Vertex AI",
    logo: (
      <img
        alt="GCP Vertex AI"
        className="w-8 h-8"
        src="/assets/cloud-logos/gcp.svg"
      />
    ),
    description:
      "Massive context window intelligence powered by Google DeepMind.",
    models: [
      { name: "Gemini 3.5 Flash", inputPrice: "$1.50", outputPrice: "$9.00" },
      { name: "Gemini 3.1 Pro", inputPrice: "$2.00", outputPrice: "$12.00" },
    ],
  },
];

export default function TriCloudSection() {
  return (
    <section
      className="w-full py-32 bg-white text-black px-4 sm:px-6 lg:px-8"
      id="architecture"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-20">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-6 max-w-4xl">
          <h3 className="text-5xl md:text-6xl font-bold tracking-tight text-black leading-tight">
            No API Keys. No Rate Limits.
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            Direct SDK connections to foundational models are strictly blocked
            for security. <br className="hidden md:block" />
            Inso Code routes every prompt through our ultra-secure, zero-markup
            Tri-Cloud infrastructure. You get unlimited access to all the latest
            state-of-the-art models.
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
              <CardHeader className="flex flex-col items-start gap-6 p-6 sm:p-10">
                <div className="p-4 rounded-2xl bg-white border border-gray-100">
                  {provider.logo}
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-2xl font-semibold tracking-tight text-black">
                    {provider.name}
                  </h4>
                  <p className="text-gray-500 text-base leading-relaxed">
                    {provider.description}
                  </p>
                </div>
              </CardHeader>

              <div className="w-full h-px bg-gray-100" />

              <CardBody className="p-6 sm:p-10 bg-gray-200">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Supported Models
                  </p>
                  <div className="flex gap-2 sm:gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <span className="w-12 sm:w-16 text-left">Input</span>
                    <span className="w-12 sm:w-16 text-left pl-1">Output</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-4">
                  {provider.models.map((model, mIdx) => (
                    <li
                      key={mIdx}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                        <span className="text-gray-900 font-medium whitespace-nowrap text-sm sm:text-base truncate max-w-[110px] sm:max-w-none">
                          {model.name}
                        </span>
                      </div>
                      <div className="flex gap-2 sm:gap-4 shrink-0">
                        <span className="text-xs sm:text-sm text-gray-500 font-medium w-12 sm:w-16 text-left">
                          {model.inputPrice}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 font-medium w-12 sm:w-16 text-left pl-1">
                          {model.outputPrice}
                        </span>
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
