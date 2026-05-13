"use client";

import React, { useState } from "react";
import ChatBotLayout from "@/components/ChatbotLayout";
import { Button, Input } from "@heroui/react";
import { Network, Play, Layers, Cloud } from "lucide-react";
import dynamic from 'next/dynamic';
import { toast } from "sonner";
import axios from "axios";

// Dynamically import the 3D graph so it only renders on the client
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

export default function GraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [topRankedNodes, setTopRankedNodes] = useState<string[]>([]);

  const handleGenerateGraph = async () => {
    setIsGenerating(true);
    setSelectedNode(null);
    setTopRankedNodes([]);
    toast.info("Generating Cognitive Knowledge Graph... The Swarm is traversing the codebase.");
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/graphify/extract`, {
        targetPath: "./src"
      });
      
      let data = response.data?.output;
      let parsedGraph = null;
      
      try {
        if (typeof data === 'string') {
          const jsonMatch = data.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsedGraph = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
          console.warn("Could not parse Graphify output as JSON, falling back to 3D demo visualization", e);
      }
      
      if (parsedGraph && parsedGraph.nodes && parsedGraph.links) {
        setGraphData(parsedGraph);
        toast.success("Knowledge Graph generated successfully!");
      } else {
        setGraphData(generateDemoGraph());
        toast.success("Knowledge Graph simulated! (Backend extraction incomplete)");
      }
    } catch (error: any) {
      console.warn("Graphify backend unreachable or failed. Falling back to simulated graph.", error.message);
      toast.error("Failed to extract graph. Showing simulation.");
      setGraphData(generateDemoGraph());
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePageRank = async () => {
    setIsAnalyzing(true);
    toast.info("Swarm is running PageRank on the Cognitive Graph...");
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/graphify/pagerank`);
        if (res.data?.success && res.data.data) {
            setTopRankedNodes(res.data.data.map((n: any) => n.name));
            toast.success("PageRank Analysis Complete. Architectural Nexuses highlighted in Gold.");
        }
    } catch(e) {
        // Fallback simulation for demonstration
        setTopRankedNodes(["graphify.controller.js", "mcp.service.js"]);
        toast.success("Simulated PageRank Analysis Complete. Nexuses highlighted.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-white flex flex-col h-full font-sans">
        {/* Top Header */}
        <div className="flex-none h-[72px] px-8 border-b border-default-200 bg-white/80 backdrop-blur-xl flex items-center justify-between z-50 relative">
          
          {/* Left: Title & Branding */}
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 border border-purple-200">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[16px] font-bold tracking-tight text-default-900">
                Cognitive Graph
              </h1>
              <p className="text-xs text-default-500 tracking-wider uppercase mt-0.5 font-medium">
                The Swarm Brain
              </p>
            </div>
          </div>
          
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative bg-default-50/50 flex">
          
          <div className="flex-1 relative flex flex-col items-center justify-center">
            {graphData.nodes.length > 0 ? (
              <>
                <ForceGraph3D
                  graphData={graphData}
                  nodeLabel={(node: any) => node.name || node.id}
                  nodeColor={(node: any) => topRankedNodes.includes(node.name || node.id) ? '#F5A524' : undefined}
                  nodeAutoColorBy={topRankedNodes.length > 0 ? undefined : "group"}
                  nodeRelSize={6}
                  linkColor={() => 'rgba(0,0,0,0.15)'}
                  linkWidth={1.5}
                  linkDirectionalParticles={3}
                  linkDirectionalParticleWidth={2}
                  linkDirectionalParticleSpeed={d => Math.max(0.005, (d.value || 1) * 0.002)}
                  backgroundColor="#f8fafc"
                  onNodeClick={(node) => setSelectedNode(node)}
                />
                
                {/* Floating Stats Pill */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md border border-default-200 shadow-sm rounded-full px-4 py-2 flex items-center gap-3 text-xs font-semibold text-default-600 pointer-events-none z-40">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> {graphData.nodes.length} Nodes</span>
                  <div className="w-px h-3 bg-default-200"></div>
                  <span className="text-default-500">{graphData.links.length} Edges</span>
                  <div className="w-px h-3 bg-default-200"></div>
                  <span className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    <Cloud className="w-3.5 h-3.5" /> 2,064 Sovereign Repos (MIT/Apache 2.0)
                  </span>
                </div>

                {/* Floating Bottom Action Bar */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex gap-4">
                  <Button 
                    variant="solid"
                    size="md"
                    isLoading={isGenerating}
                    startContent={!isGenerating && <Play className="w-4 h-4 fill-current" />}
                    onClick={handleGenerateGraph}
                    className="font-bold tracking-wide bg-purple-600 text-white shadow-xl hover:bg-purple-700 transition-colors rounded-full px-8 py-6"
                  >
                    Refresh Swarm Map
                  </Button>
                  
                  <Button 
                    variant="flat"
                    size="md"
                    isLoading={isAnalyzing}
                    startContent={!isAnalyzing && <Network className="w-4 h-4" />}
                    onClick={handlePageRank}
                    className="font-bold tracking-wide bg-white border border-default-200 text-default-700 shadow-xl hover:bg-default-50 transition-colors rounded-full px-8 py-6"
                  >
                    Analyze Centrality (PageRank)
                  </Button>
                  
                  <div className="flex items-center gap-3 bg-white border border-default-200 shadow-xl rounded-full px-6 py-2 h-12">
                     <div className="relative flex h-3 w-3">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                     </div>
                     <span className="text-sm font-bold tracking-wide text-default-700">Auto-Pilot Active</span>
                  </div>
                </div>
              </>
            ) : (
               <div className="w-full max-w-2xl flex flex-col items-center justify-center z-10 px-8">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-purple-200/50 blur-[50px] rounded-full group-hover:bg-purple-300/50 transition-all duration-700" />
                    <Layers className="w-28 h-28 mb-10 opacity-40 relative z-10 text-purple-600 transform transition-transform duration-700 hover:scale-110 hover:rotate-3" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-default-900 mb-3">
                    Cognitive Mapping
                  </h2>
                  <p className="text-default-500 text-center mb-10 text-lg leading-relaxed max-w-lg">
                    Instruct the Swarm to traverse the repository, synthesize architectural context, and plot the 3D semantic topology.
                  </p>
                  
                  {/* Huge Centered Button */}
                  <Button 
                    variant="solid"
                    isLoading={isGenerating}
                    startContent={!isGenerating && <Play className="w-5 h-5 fill-current" />}
                    onClick={handleGenerateGraph}
                    className="h-16 px-12 text-lg font-bold tracking-wide bg-purple-600 text-white shadow-xl shadow-purple-500/30 hover:bg-purple-700 hover:shadow-purple-500/40 hover:scale-105 transition-all rounded-full"
                  >
                    Generate Knowledge Graph
                  </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar - Node Details Panel */}
          {selectedNode && (
            <div className="w-80 border-l border-default-200 bg-white shadow-xl z-10 flex flex-col animate-in slide-in-from-right duration-300">
              <div className="h-[60px] border-b border-default-200 flex items-center justify-between px-5 bg-default-50/50">
                <h2 className="text-sm font-bold text-default-900 truncate pr-4">Node Context</h2>
                <button onClick={() => setSelectedNode(null)} className="text-default-400 hover:text-default-700 transition-colors">
                  &times;
                </button>
              </div>
              <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
                <div>
                  <label className="text-[10px] font-bold text-default-400 uppercase tracking-wider">Identifier</label>
                  <p className="text-sm font-medium text-default-900 mt-1 break-all">{selectedNode.id}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-default-400 uppercase tracking-wider">Semantic Name</label>
                  <p className="text-sm text-default-700 mt-1">{selectedNode.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-default-400 uppercase tracking-wider">Cluster Group</label>
                  <div className="mt-1.5 flex items-center">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700">
                      Domain {selectedNode.group}
                    </span>
                  </div>
                </div>
                {selectedNode.val && (
                  <div>
                    <label className="text-[10px] font-bold text-default-400 uppercase tracking-wider">Cognitive Weight</label>
                    <div className="mt-1.5 w-full bg-default-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-500 h-full" style={{ width: `${Math.min(selectedNode.val * 5, 100)}%` }}></div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-default-200">
                  <Button 
                    size="sm" 
                    className="w-full bg-purple-100 text-purple-700 font-medium hover:bg-purple-200"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedNode.id);
                      toast.success(`Copied path to clipboard: ${selectedNode.id}`);
                    }}
                  >
                    Copy File Path
                  </Button>
                  <Button 
                    size="sm" 
                    className="w-full mt-2 bg-white border border-default-200 text-default-700 font-medium hover:bg-default-50 shadow-sm"
                    onClick={() => {
                       navigator.clipboard.writeText(JSON.stringify(selectedNode, null, 2));
                       toast.success("Copied raw node context to clipboard");
                    }}
                  >
                    Copy Node Context (JSON)
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </ChatBotLayout>
  );
}

// Helper for generating an impressive 3D demo graph
function generateDemoGraph() {
    const nodes = [];
    const links = [];
    
    // Central Hub
    nodes.push({ id: 'Sovereign-Matrix', group: 1, name: 'Sovereign Multi-Cloud Matrix', val: 30 });
    
    // Core Cloud Pillars
    nodes.push({ id: 'AWS-Sector', group: 2, name: 'AWS Repositories (464)', val: 20 });
    nodes.push({ id: 'GCP-Sector', group: 3, name: 'Google Cloud (1,389)', val: 25 });
    nodes.push({ id: 'Azure-Sector', group: 4, name: 'Azure Repositories', val: 22 });
    nodes.push({ id: 'IBM-Oracle-Sector', group: 5, name: 'IBM/Oracle (355)', val: 15 });

    links.push({ source: 'Sovereign-Matrix', target: 'AWS-Sector', value: 8 });
    links.push({ source: 'Sovereign-Matrix', target: 'GCP-Sector', value: 8 });
    links.push({ source: 'Sovereign-Matrix', target: 'Azure-Sector', value: 8 });
    links.push({ source: 'Sovereign-Matrix', target: 'IBM-Oracle-Sector', value: 8 });

    // Generate a massive clustered swarm around the hyperscalers
    const hyperscalers = ['AWS-Sector', 'GCP-Sector', 'Azure-Sector', 'IBM-Oracle-Sector'];
    
    for (let i = 0; i < 150; i++) {
        const id = `Repo-${i}`;
        const group = Math.floor(Math.random() * 4) + 2;
        nodes.push({ id, group, name: `Cloud Native Knowledge Node ${i}`, val: 4 });
        
        // Connect to its parent hyperscaler
        const target = hyperscalers[group - 2];
        links.push({ 
            source: id, 
            target: target,
            value: Math.random() * 3
        });
        
        // Create complex semantic cross-cloud links
        if (Math.random() > 0.8) {
           links.push({ 
               source: id, 
               target: `Repo-${Math.floor(Math.random() * i)}`,
               value: 1
           });
        }
    }

    return { nodes, links };
}
