"use client";

import React, { useState, useEffect } from "react";
import {
  DownloadCloud,
  CheckCircle2,
  ShieldCheck,
  Box,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/lib/config";

interface AgentPlugin {
  id: string;
  name: string;
  description: string;
  author: string;
  installed: boolean;
  price: string;
  downloads: number;
}

export default function AgentStore() {
  const [plugins, setPlugins] = useState<AgentPlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketplace();
  }, []);

  const fetchMarketplace = async () => {
    try {
      const response = await axios.get(`${API_URL}/marketplace/agents`);

      setPlugins(response.data.data);
    } catch (error) {
      toast.error("Failed to connect to the Swarm Marketplace");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (agentId: string) => {
    setInstallingId(agentId);
    try {
      const response = await axios.post(`${API_URL}/marketplace/install`, {
        agentId,
      });

      if (response.data.success) {
        toast.success(`Neural Link Established: ${response.data.message}`);
        // Optimistically update UI
        setPlugins(
          plugins.map((p) =>
            p.id === agentId ? { ...p, installed: true } : p,
          ),
        );
      } else {
        toast.info(response.data.message);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Neural Link Failed";

      toast.error(msg);
    } finally {
      setInstallingId(null);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 relative h-full overflow-y-auto">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Box className="h-8 w-8 text-indigo-400" />
            The Swarm Marketplace
          </h2>
          <p className="text-zinc-400 mt-2">
            Discover and install specialized AI agents to expand your Hive Mind
            capabilities.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plugins.map((plugin) => (
            <Card
              key={plugin.id}
              className="bg-[#12141c] border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge
                    className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 mb-2"
                    variant="outline"
                  >
                    {plugin.price}
                  </Badge>
                  {plugin.installed && (
                    <Badge
                      className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                      variant="default"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Installed
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl text-zinc-100">
                  {plugin.name}
                </CardTitle>
                <CardDescription className="text-zinc-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Verified by {plugin.author}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-zinc-300 text-sm h-12 line-clamp-2">
                  {plugin.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                  <DownloadCloud className="w-4 h-4" />
                  {plugin.downloads.toLocaleString()} installs
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={plugin.installed || installingId === plugin.id}
                  onClick={() => handleInstall(plugin.id)}
                >
                  {installingId === plugin.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Installing...
                    </>
                  ) : plugin.installed ? (
                    "Neural Link Active"
                  ) : (
                    <>
                      <DownloadCloud className="w-4 h-4 mr-2" /> Install Agent
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
