"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Divider,
  Spacer,
} from "@heroui/react";
import { toast } from "sonner";

export default function AgentBuilderPage() {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    tier: "Tier 21: Custom Creation",
    description: "",
    preamble: "",
    keywords: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAgent = async () => {
    if (!formData.name || !formData.preamble) {
      toast.error("Agent Name and Preamble are required.");

      return;
    }

    setIsSubmitting(true);

    try {
      // Phase 44: Send to backend for Dynamic Capabilities Ingestion
      const res = await fetch("/api/agents/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Convert comma-separated string to Array for the semantic capability router
          keywords: formData.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error("Failed to forge the new Agent.");

      toast.success(
        `Agent ${formData.name} successfully forged into the Swarm.`,
      );

      // Reset form
      setFormData({
        name: "",
        title: "",
        tier: "Tier 21: Custom Creation",
        description: "",
        preamble: "",
        keywords: "",
      });
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">
          The Agent Blacksmith
        </h1>
        <p className="text-default-500">
          *Phase 44 (The Genesis Protocol)*: Forge entirely new, specialized AI
          agents at runtime. They will be dynamically ingested into the Swarm's
          Capability Router.
        </p>
      </div>

      <Card className="bg-background/60 dark:bg-default-100/50">
        <CardHeader className="flex gap-3 px-6 py-5">
          <div className="flex flex-col">
            <p className="text-md font-bold">1. Agent Identity</p>
            <p className="text-small text-default-500">
              Core parameters defining how the Swarm sees this entity.
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="gap-6 px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              isRequired
              description="CamelCase variable name used internally."
              label="System Name"
              placeholder="e.g. quantumResearcherAgent"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <Input
              description="Human-readable title shown in the Dashboard."
              label="Display Title"
              placeholder="e.g. The Quantum Computing Expert"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <Input
            description="CRITICAL: The routing algorithms match user requests against these tokens to dispatch tasks to this agent."
            label="Semantic Keywords (Comma Separated)"
            placeholder="e.g. qubit, superposition, quantum mechanic, q#, entanglement"
            value={formData.keywords}
            onChange={(e) =>
              setFormData({ ...formData, keywords: e.target.value })
            }
          />

          <Select
            defaultSelectedKeys={["Tier 21: Custom Creation"]}
            description="Determines execution privileges."
            label="Clearance Tier"
          >
            <SelectItem key="Tier 21: Custom Creation">
              Tier 21: Custom Creation
            </SelectItem>
            <SelectItem key="Tier 0: Root Admin">
              Tier 0: Root Admin (God Mode)
            </SelectItem>
          </Select>
        </CardBody>
      </Card>

      <Card className="bg-background/60 dark:bg-default-100/50">
        <CardHeader className="flex gap-3 px-6 py-5">
          <div className="flex flex-col">
            <p className="text-md font-bold">2. Brain & Directives</p>
            <p className="text-small text-default-500">
              The neural architecture and prompt engineering driving the
              intelligence.
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="gap-6 px-6 py-5">
          <Textarea
            label="Brief Description"
            minRows={2}
            placeholder="A short summary of what this agent does best..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <Textarea
            isRequired
            description="The base system instructions passed to the LLM upon every invocation. Be specific and define rules."
            label="System Preamble (Prompt Engineering)"
            minRows={10}
            placeholder="You are the Quantum Computing Expert. Your primary directive is to..."
            value={formData.preamble}
            onChange={(e) =>
              setFormData({ ...formData, preamble: e.target.value })
            }
          />
        </CardBody>
        <Divider />
        <CardFooter className="px-6 py-4 justify-end">
          <Button
            className="font-semibold shadow-lg"
            color="primary"
            isLoading={isSubmitting}
            size="lg"
            onPress={handleCreateAgent}
          >
            Forge Agent into Swarm
          </Button>
        </CardFooter>
      </Card>

      <Spacer y={10} />
    </div>
  );
}
