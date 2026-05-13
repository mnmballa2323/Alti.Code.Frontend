"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardBody } from "@heroui/react";

import { trpc } from "@/lib/trpc";

// Excalidraw must be dynamically imported to avoid SSR issues
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false },
);

export default function ArchitectureStudio() {
  const { data: health, isLoading } = trpc.health.useQuery(undefined, {
    retry: false,
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div>Loading...</div>;

  return (
    <div className="flex h-screen w-full flex-col p-4 bg-background">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Agent Architecture Studio</h1>
        <div className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${isLoading ? "bg-yellow-500" : health ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-sm text-default-500">
            tRPC: {health || "Disconnected"}
          </span>
        </div>
      </div>

      <Card className="flex-grow shadow-lg h-[calc(100vh-100px)]">
        <CardBody className="p-0 overflow-hidden relative h-full">
          <Excalidraw
            initialData={{
              appState: { viewBackgroundColor: "#1e1e1e", theme: "dark" },
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
