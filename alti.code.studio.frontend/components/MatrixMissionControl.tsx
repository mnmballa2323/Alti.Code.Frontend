"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Card, CardBody, CardHeader, Chip } from "@heroui/react";

// Dynamically import react-force-graph-3d to avoid SSR issues with Three.js
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

export default function MatrixMissionControl() {
  const graphRef = useRef<any>();
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    // Initialize an immersive 3D Swarm Visualization
    // Simulating thousands of agents communicating in real-time
    const N = 300;
    const nodes = Array.from({ length: N }, (_, i) => ({
      id: i,
      group: Math.floor(Math.random() * 5),
      name: `Agent_${i}_${["Architect", "Security", "Frontend", "DBA", "SRE"][Math.floor(Math.random() * 5)]}`,
    }));

    const links = Array.from({ length: N }, (_, i) => i)
      .filter((id) => id)
      .map((id) => ({
        source: id,
        target: Math.round(Math.random() * (id - 1)),
      }));

    setGraphData({ nodes, links });

    // Simulate real-time Pub/Sub activity
    const interval = setInterval(() => {
      if (graphRef.current) {
        // Shoot dynamic light particles across edges
        const link = links[Math.floor(Math.random() * links.length)];

        graphRef.current.emitParticle(link);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleClick = useCallback(
    (node: any) => {
      // Aim camera at clicked node
      if (graphRef.current) {
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        graphRef.current.cameraPosition(
          {
            x: node.x * distRatio,
            y: node.y * distRatio,
            z: node.z * distRatio,
          },
          node, // lookAt
          3000, // ms transition
        );
      }
    },
    [graphRef],
  );

  return (
    <Card className="w-full h-[800px] bg-black/90 border-blue-500/30 border-1 shadow-[0_0_50px_rgba(0,100,255,0.15)] overflow-hidden">
      <CardHeader className="absolute z-10 flex-col items-start p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex gap-3 items-center">
          <h2 className="text-2xl font-bold text-white tracking-widest font-mono">
            SWARM_MATRIX
          </h2>
          <Chip
            className="font-mono border-none text-green-400"
            color="success"
            size="sm"
            variant="dot"
          >
            NEURAL LINK ACTIVE
          </Chip>
        </div>
        <p className="text-blue-400/80 font-mono text-sm mt-2 max-w-lg">
          Real-time topological visualization of the Google Cloud Pub/Sub
          Agentic Mesh. Monitoring 300+ highly specialized Sovereign Agents in
          multi-dimensional space.
        </p>
      </CardHeader>
      <CardBody className="p-0 m-0 w-full h-full cursor-crosshair">
        <ForceGraph3D
          ref={graphRef}
          backgroundColor="#000000"
          graphData={graphData}
          linkColor={() => "rgba(0, 150, 255, 0.2)"}
          linkDirectionalParticleSpeed={0.01}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticles={2}
          linkWidth={0.5}
          nodeAutoColorBy="group"
          nodeLabel="name"
          nodeResolution={16}
          nodeThreeObject={(node: any) => {
            // We could use native Three.js here to make them glowing spheres
            return undefined; // Fallback to default spheres
          }}
          onNodeClick={handleClick}
        />
      </CardBody>
    </Card>
  );
}
