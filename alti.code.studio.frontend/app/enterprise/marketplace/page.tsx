"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, Spinner, Chip, Button, Input } from "@heroui/react";
import {
  Store,
  Download,
  Star,
  Search,
  Package,
  Zap,
  Users,
} from "lucide-react";

import { marketplaceAPI } from "@/lib/enterprise-api";

export default function MarketplacePage() {
  const [stats, setStats] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, b] = await Promise.allSettled([
          marketplaceAPI.stats(),
          marketplaceAPI.browse(),
        ]);

        if (s.status === "fulfilled") setStats(s.value);
        if (b.status === "fulfilled")
          setAgents(Array.isArray(b.value) ? b.value : b.value?.agents || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner color="secondary" size="lg" />
        <span className="ml-3 text-default-400">Loading Marketplace...</span>
      </div>
    );
  }

  const filtered = agents.filter(
    (a: any) =>
      !search ||
      (a.name || a.id || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Agent Marketplace</h2>
          <p className="text-sm text-default-400">
            Browse, install, and rate enterprise agents
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-fuchsia-500/20"
          size="sm"
          startContent={<Package className="w-4 h-4" />}
        >
          Publish Agent
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.totalAgents ?? 0}
              </div>
              <div className="text-sm text-default-300">Published Agents</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.totalInstalls ?? 0}
              </div>
              <div className="text-sm text-default-300">Installs</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.avgRating?.toFixed(1) ?? "—"}
              </div>
              <div className="text-sm text-default-300">Avg Rating</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.categories ?? 0}
              </div>
              <div className="text-sm text-default-300">Categories</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search */}
      <Input
        classNames={{
          input: "text-white",
          inputWrapper:
            "bg-white/5 border-white/10 data-[hover=true]:bg-white/10 group-data-[focus=true]:bg-white/10",
        }}
        placeholder="Search agents..."
        startContent={<Search className="w-4 h-4 text-default-400" />}
        value={search}
        variant="bordered"
        onValueChange={setSearch}
      />

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((agent: any, i: number) => (
            <Card
              key={i}
              className="bg-white/5 border border-white/10 hover:border-fuchsia-500/30 transition-all hover:scale-[1.02]"
            >
              <CardBody className="py-5 px-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-fuchsia-500/30 to-pink-500/30">
                      <Zap className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold">
                        {agent.name || agent.id}
                      </div>
                      <div className="text-xs text-default-500">
                        v{agent.version || "1.0.0"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-default-400">
                      {agent.rating?.toFixed(1) ?? "—"}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-default-400 mb-3 line-clamp-2">
                  {agent.description ||
                    "An enterprise agent for automated tasks."}
                </p>
                <div className="flex items-center justify-between">
                  <Chip color="secondary" size="sm" variant="flat">
                    {agent.category || "general"}
                  </Chip>
                  <div className="flex items-center gap-1 text-xs text-default-500">
                    <Download className="w-3 h-3" />
                    {agent.installs ?? 0}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-default-400 border-2 border-dashed border-white/10 rounded-xl">
            <Store className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No agents published yet</p>
            <p className="text-sm mt-1">
              Publish your first agent to populate the marketplace
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
