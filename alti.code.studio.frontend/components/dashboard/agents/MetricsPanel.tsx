"use client";

import React from "react";
import { Zap, TrendingUp, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MetricsPanel() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Analyst Section */}
      <Card className="bg-black/40 border-purple-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-purple-500">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Analyst Insights
            </div>
            <Badge
              className="border-purple-500 text-purple-500"
              variant="outline"
            >
              Predicting
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-purple-950/20 rounded-lg border border-purple-900/30">
                <p className="text-sm text-purple-200">Predicted Load</p>
                <p className="text-2xl font-bold text-white">450 RPS</p>
                <p className="text-xs text-purple-300">Peak at 14:00</p>
              </div>
              <div className="p-3 bg-purple-950/20 rounded-lg border border-purple-900/30">
                <p className="text-sm text-purple-200">Traffic Trend</p>
                <p className="text-2xl font-bold text-green-400">Stable</p>
              </div>
            </div>
            <Button className="w-full bg-purple-900/50 hover:bg-purple-900 text-purple-200 border border-purple-800">
              View Detailed Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simulator Section */}
      <Card className="bg-black/40 border-orange-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-orange-500">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" /> Chaos Simulator
            </div>
            <Badge
              className="border-orange-500 text-orange-500"
              variant="outline"
            >
              Idle
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-orange-950/20 rounded-lg border border-orange-900/30 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-bold text-orange-200">
                  Inject Faults
                </p>
                <p className="text-xs text-orange-400">
                  Simulate latency or errors to test resilience.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                className="border-orange-800 text-orange-500 hover:bg-orange-950"
                variant="outline"
              >
                High Latency
              </Button>
              <Button
                className="border-orange-800 text-orange-500 hover:bg-orange-950"
                variant="outline"
              >
                Error Spikes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
