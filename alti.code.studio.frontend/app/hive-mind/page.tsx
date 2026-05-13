"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardHeader, CardBody, Chip } from "@heroui/react";

// Use the main backend endpoint (port 5100)
const SOCKET_URL = "http://localhost:5100"; 

export default function HiveMindPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [alerts, setAlerts] = useState<{ id: string; time: string; msg: string; type: string }[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket Server on the default namespace
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      setAlerts(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: "Successfully connected to Swarm Orbit.", type: "SYSTEM" }, ...prev].slice(0, 50));
    });
    
    newSocket.on("disconnect", () => setIsConnected(false));

    // Listen to the universal stream and filter by type
    newSocket.on("agent:stream", (payload: any) => {
      if (payload.agent !== 'swarm') return;

      const { type, data } = payload;

      if (type === "dag_topology") {
        // Map backend nodes to ReactFlow nodes
        const layoutNodes = data.nodes.map((n: any, i: number) => ({
          id: n.id,
          type: 'default',
          position: { x: (i % 3) * 280 + 50, y: Math.floor(i / 3) * 180 + 50 },
          data: { 
            label: (
              <div className="flex flex-col items-center gap-1 p-2">
                <span className="font-bold text-sm text-indigo-300 tracking-wider">{n.name}</span>
                <span className="text-[10px] text-gray-400 max-w-[180px] truncate">{n.assignedTask}</span>
                <Chip size="sm" color="default" variant="flat" className="mt-2 text-[10px]">PENDING</Chip>
              </div>
            ) 
          },
          style: {
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(99, 102, 241, 0.4)",
            borderRadius: "16px",
            color: "white",
            backdropFilter: "blur(12px)",
            width: 220,
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)"
          }
        }));

        // Map backend edges to ReactFlow edges
        const layoutEdges = data.edges.map((e: any, i: number) => ({
          id: `e-${e.from}-${e.to}`,
          source: e.from,
          target: e.to,
          animated: true,
          style: { stroke: 'rgba(99, 102, 241, 0.8)', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(99, 102, 241, 0.8)' }
        }));

        setNodes(layoutNodes);
        setEdges(layoutEdges);
        
        setAlerts(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `Topological graph generated with ${data.nodes.length} nodes.`, type: "TOPOLOGY" }, ...prev].slice(0, 50));
      }

      if (type === "node_status") {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === data.nodeId) {
              let color: "default" | "primary" | "success" | "danger" | "warning" = "default";
              let borderColor = "rgba(99, 102, 241, 0.5)";
              let shadow = "none";
              
              if (data.status === 'running') { color = "primary"; borderColor = "rgba(59, 130, 246, 0.9)"; shadow = "0 0 20px rgba(59, 130, 246, 0.4)"; }
              if (data.status === 'completed') { color = "success"; borderColor = "rgba(34, 197, 94, 0.9)"; shadow = "0 0 20px rgba(34, 197, 94, 0.4)"; }
              if (data.status === 'remediating') { color = "warning"; borderColor = "rgba(234, 179, 8, 0.9)"; shadow = "0 0 20px rgba(234, 179, 8, 0.4)"; }
              if (data.status === 'failed') { color = "danger"; borderColor = "rgba(239, 68, 68, 0.9)"; shadow = "0 0 20px rgba(239, 68, 68, 0.4)"; }

              return {
                ...n,
                style: { ...n.style, border: `2px solid ${borderColor}`, boxShadow: shadow },
                data: {
                  ...n.data,
                  label: (
                    <div className="flex flex-col items-center gap-1 p-2">
                      <span className="font-bold text-sm text-indigo-300 tracking-wider">{data.agentName}</span>
                      <Chip size="sm" color={color} variant="flat" className="mt-2 uppercase tracking-widest text-[9px]">
                        {data.status} {data.attempt ? `(ATT ${data.attempt})` : ''}
                      </Chip>
                    </div>
                  )
                }
              };
            }
            return n;
          })
        );
      }

      if (type === "hive_mind_alert") {
        setAlerts(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: data.alert, type: "COGNITIVE" }, ...prev].slice(0, 50));
      }
    });

    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, [setNodes, setEdges]);

  return (
    <div className="flex flex-col h-screen bg-[#030308] text-white p-6 gap-6 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <div className="flex justify-between items-center z-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Swarm Hive-Mind Visualizer
          </h1>
          <p className="text-sm text-indigo-200/50 mt-1 font-medium tracking-wide">Real-time DAG Execution & Cognitive Telemetry Bus</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
          <span className="text-xs text-white/50 font-bold uppercase tracking-widest">Uplink:</span>
          <Chip color={isConnected ? "success" : "danger"} variant="flat" size="sm" className="font-bold tracking-wider">
            {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </Chip>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0 z-10">
        {/* DAG Visualizer Container */}
        <div className="flex-1 border border-indigo-500/20 rounded-3xl bg-[#080816]/80 overflow-hidden relative backdrop-blur-xl shadow-2xl">
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange}
            fitView
            className="bg-transparent"
          >
            <Background color="#6366f1" gap={24} size={1} opacity={0.1} />
            <Controls className="bg-black/50 border border-white/10 fill-white rounded-xl overflow-hidden" />
            <MiniMap className="bg-[#050510] border border-indigo-500/30 rounded-xl m-4 overflow-hidden mask-image-none" nodeColor="rgba(99,102,241,0.8)" maskColor="rgba(0,0,0,0.5)" />
          </ReactFlow>
        </div>

        {/* Live Stream Panel */}
        <Card className="w-[420px] bg-[#080816]/80 border border-indigo-500/20 backdrop-blur-xl rounded-3xl shadow-2xl shrink-0 flex flex-col">
          <CardHeader className="border-b border-white/10 p-5 bg-white/5">
            <h3 className="font-bold text-lg text-white flex items-center gap-3 tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse"></span>
              Live Telemetry Stream
            </h3>
          </CardHeader>
          <CardBody className="overflow-y-auto p-4 flex flex-col gap-3">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-4">
                <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/50">Listening to Matrix...</p>
              </div>
            ) : (
              alerts.map(a => (
                <div key={a.id} className="flex flex-col gap-1.5 text-xs border border-white/5 bg-white/5 rounded-xl p-3.5 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300">
                  <div className="flex justify-between items-center text-white/40 mb-1">
                    <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-full ${a.type === 'COGNITIVE' ? 'bg-purple-500/20 text-purple-300' : a.type === 'TOPOLOGY' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-blue-500/20 text-blue-300'}`}>
                      [{a.type}]
                    </span>
                    <span className="font-mono text-[10px]">{a.time}</span>
                  </div>
                  <span className="text-white/80 leading-relaxed font-medium">{a.msg}</span>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
