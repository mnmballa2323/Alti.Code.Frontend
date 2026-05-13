"use client";

import React, { useState } from "react";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import axios from "axios";
import { toast } from "react-hot-toast";

import { API_URL } from "@/lib/config";

export const GenesisPrompt = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setResult(null);

    try {
      toast.loading("Genesis Engine Initialized...", { id: "genesis" });
      const response = await axios.post(`${API_URL}/generator/app`, {
        prompt: prompt,
      });

      if (response.data.success) {
        setResult(response.data.data);
        toast.success("Universe Created Successfully!", { id: "genesis" });
      } else {
        toast.error("Genesis Failed: " + response.data.message, {
          id: "genesis",
        });
      }
    } catch (error: any) {
      console.error("Genesis Error:", error);
      toast.error("Genesis Connection Error", { id: "genesis" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-indigo-900 to-black text-white border-none shadow-2xl">
      <CardHeader className="flex gap-3">
        <div className="p-2 bg-white/10 rounded-lg">🧠</div>
        <div className="flex flex-col">
          <p className="text-md font-bold text-white">Genesis Engine</p>
          <p className="text-small text-gray-300">
            Text-to-App Generator (v1.0)
          </p>
        </div>
        {isGenerating && (
          <Chip
            className="ml-auto animate-pulse"
            color="secondary"
            variant="dot"
          >
            Constructing...
          </Chip>
        )}
      </CardHeader>
      <CardBody>
        <Textarea
          classNames={{
            input: "text-white placeholder:text-gray-400",
            inputWrapper: "bg-white/10 hover:bg-white/20 transition-colors",
          }}
          isDisabled={isGenerating}
          minRows={3}
          placeholder="Describe your universe (e.g., 'A kanban board for managing galactic fleets')..."
          value={prompt}
          onValueChange={setPrompt}
        />
      </CardBody>
      <CardFooter className="justify-end gap-2">
        <Button
          className="font-bold shadow-lg shadow-indigo-500/50"
          color="secondary"
          isLoading={isGenerating}
          onPress={handleGenerate}
        >
          {isGenerating ? "Manifesting..." : "Generate App"}
        </Button>
      </CardFooter>

      {result && (
        <div className="px-4 pb-4">
          <div className="p-3 bg-green-900/40 border border-green-500/50 rounded-lg">
            <p className="font-bold text-green-300 mb-1">Creation Complete!</p>
            <p className="text-sm text-gray-300">
              App generated at:{" "}
              <span className="font-mono text-white">{result.path}</span>
            </p>
            {/* Future: Add link to preview if possible */}
          </div>
        </div>
      )}
    </Card>
  );
};
