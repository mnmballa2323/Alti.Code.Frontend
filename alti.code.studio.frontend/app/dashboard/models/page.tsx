"use client";
import { Input } from "@heroui/input";
import { useState } from "react";
import Image from "next/image";

import { SearchIcon } from "@/components/icons";

// Mock shadcn/ui components (simplified for this demo)
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>;

const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    secondary: "bg-blue-100 text-blue-800",
    outline: "border border-gray-300 text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo2 from "@/public/assets/model-icons/claude-color.png";
import Logo8 from "@/public/assets/model-icons/deepseek-color.png";
import Logo1 from "@/public/assets/model-icons/gemini-color.png";
import Logo4 from "@/public/assets/model-icons/grok.png";
import Logo5 from "@/public/assets/model-icons/meta-color.png";
import Logo6 from "@/public/assets/model-icons/mistral-color.png";
import Logo3 from "@/public/assets/model-icons/openai.png";
import Logo7 from "@/public/assets/model-icons/qwen-color.png";

const models = [
  {
    id: 1,
    name: "GPT-5",
    providedBy: "Azure Foundry",
    icon: Logo3,
    description:
      "Reasoning and precision for complex coding, debugging, and architecture.",
  },
  {
    id: 2,
    name: "Claude Sonnet 4",
    providedBy: "AWS Bedrock",
    icon: Logo2,
    description:
      "Exceptional at code comprehension, refactoring, and writing clean code.",
  },

  {
    id: 3,
    name: "Gemini 2.5 Pro",
    providedBy: "Google",
    icon: Logo1,
    description:
      "Handles massive codebases with strong context for large multi-file projects.",
  },
  {
    id: 4,
    name: "Grok 4",
    providedBy: "xAI",
    icon: Logo4,
    description:
      "Fast, creative code generation with a balance of both speed and logic.",
  },
  {
    id: 5,
    name: "LLama 4 Mevrick",
    providedBy: "Meta",
    icon: Logo5,
    description:
      " Delivers high quality code generation and deep contextual understanding.",
  },
  {
    id: 6,
    name: "Devstral Medium",
    providedBy: "Mistral",
    icon: Logo6,
    description:
      "Lightweight and efficient, ideal for iterative code and fast development.",
  },
  {
    id: 7,
    name: "Qwen3-Coder",
    providedBy: "Qwen",
    icon: Logo7,
    description:
      "Multilingual coding expert with strong algorithmic problem solving skills.",
  },
  {
    id: 8,
    name: "DeepSeek-Coder-V2",
    providedBy: "DeepSeek",
    icon: Logo8,
    description:
      "Highly optimized for code synthesis and completion across languages.",
  },
];

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentModel, setCurrentModel] = useState(1);

  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Choose your model
          </h1>
        </div>

        <div className="mb-8">
          <Input
            className="w-[500px]"
            endContent={<SearchIcon className="text-default-400" width={16} />}
            placeholder="Search"
            size="lg"
          />
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <Card
              key={model.id}
              className=" transition-all flex border-none bg-default-100 flex-col flex-1 duration-200 group"
            >
              <CardContent className="flex flex-col flex-1 bg-default-100 border-none">
                <div className="flex flex-col flex-1">
                  {/* App Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 mb-4">
                      <Image alt="logo" className="size-20" src={model.icon} />
                    </div>
                    <Badge variant="outline">{model.providedBy}</Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {model.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {model.description}
                  </p>
                </div>

                {/* Footer */}

                <Button
                  className={cn(
                    "hover:bg-gray-800 transition-colors",
                    currentModel === model.id &&
                      "bg-[#90D5FF] text-black hover:bg-[#90D5FF]/60",
                  )}
                  onClick={() => setCurrentModel(model.id)}
                >
                  {currentModel === model.id ? "Current" : "Select"} Model
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredModels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-default-1000 text-lg">
              No apps found matching your search.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
