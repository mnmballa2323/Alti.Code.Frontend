"use client";

import React, { useState } from "react";
import {
  Anchor,
  Compass,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OperationsPanel() {
  const [nodeCount, setNodeCount] = useState(3);
  const [healthStatus, setHealthStatus] = useState("NOMINAL");

  const handleScale = (delta: number) => {
    setNodeCount(Math.max(1, nodeCount + delta));
  };

  const handleEmergency = () => {
    setHealthStatus("CRITICAL");
    setTimeout(() => setHealthStatus("NOMINAL"), 5000);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {/* The Captain */}
      <Card className="bg-black/40 border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-red-500">
            <div className="flex items-center gap-2">
              <Anchor className="h-5 w-5" /> The Captain
            </div>
            <Badge
              className={`
                border-opacity-50
                ${healthStatus === "NOMINAL" ? "border-green-500 text-green-500" : "border-red-500 text-red-500 animate-pulse bg-red-950"}
            `}
              variant="outline"
            >
              {healthStatus}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
              <div className="text-xs text-gray-500">CPU Load</div>
              <div className="text-xl font-mono text-gray-200">12%</div>
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
              <div className="text-xs text-gray-500">Memory</div>
              <div className="text-xl font-mono text-gray-200">4.2GB</div>
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
              <div className="text-xs text-gray-500">Uptime</div>
              <div className="text-xl font-mono text-gray-200">4d 2h</div>
            </div>
          </div>

          <Button
            className="w-full bg-red-900/40 hover:bg-red-900/80 border border-red-500/50"
            variant="destructive"
            onClick={handleEmergency}
          >
            <AlertTriangle className="h-4 w-4 mr-2" /> Declare Emergency
          </Button>
        </CardContent>
      </Card>

      {/* The Navigator */}
      <Card className="bg-black/40 border-teal-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-teal-500">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5" /> The Navigator
            </div>
            <Badge className="border-teal-500 text-teal-500" variant="outline">
              Auto-Scaling
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-teal-950/20 rounded border border-teal-500/20">
            <div>
              <div className="text-sm text-gray-400">Active Nodes</div>
              <div className="text-2xl font-bold text-teal-300">
                {nodeCount}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="h-8 w-8"
                size="icon"
                variant="outline"
                onClick={() => handleScale(-1)}
              >
                <TrendingDown className="h-4 w-4" />
              </Button>
              <Button
                className="h-8 w-8"
                size="icon"
                variant="outline"
                onClick={() => handleScale(1)}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            className="w-full border-teal-500/30 text-teal-400 hover:bg-teal-900/20"
            variant="outline"
          >
            <DollarSign className="h-4 w-4 mr-2" /> Optimize Costs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
