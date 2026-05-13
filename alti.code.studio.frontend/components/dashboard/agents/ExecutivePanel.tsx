"use client";

import React, { useState } from "react";
import { Play, ClipboardList, Target, Lightbulb, BarChart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ExecutivePanel() {
  const [missionGoal, setMissionGoal] = useState("");
  const [activeMission, setActiveMission] = useState<any>(null);

  const handleStartMission = () => {
    // Mock mission start
    setActiveMission({
      id: "msn-" + Math.floor(Math.random() * 1000),
      goal: missionGoal,
      status: "PLANNING",
      progress: 0,
    });
    setMissionGoal("");

    // Simulate progress
    setTimeout(
      () =>
        setActiveMission((prev: any) => ({
          ...prev,
          status: "EXECUTING",
          progress: 30,
        })),
      1000,
    );
    setTimeout(
      () => setActiveMission((prev: any) => ({ ...prev, progress: 60 })),
      2000,
    );
    setTimeout(
      () =>
        setActiveMission((prev: any) => ({
          ...prev,
          status: "COMPLETED",
          progress: 100,
        })),
      3000,
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {/* The Director */}
      <Card className="bg-black/40 border-cyan-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-cyan-500">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" /> The Director
            </div>
            <Badge className="border-cyan-500 text-cyan-500" variant="outline">
              Standby
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Mission Control</label>
            <div className="flex gap-2">
              <Input
                className="bg-gray-900 border-cyan-500/30 text-cyan-100"
                placeholder="Describe mission objective..."
                value={missionGoal}
                onChange={(e) => setMissionGoal(e.target.value)}
              />
              <Button
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={handleStartMission}
              >
                <Play className="h-4 w-4 mr-1" /> Start
              </Button>
            </div>
          </div>

          {activeMission && (
            <div className="p-4 bg-cyan-950/20 rounded border border-cyan-500/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-cyan-300 font-mono">
                  {activeMission.id}
                </span>
                <Badge
                  className={`
                  ${activeMission.status === "COMPLETED" ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}
                `}
                >
                  {activeMission.status}
                </Badge>
              </div>
              <div className="text-sm text-gray-300 truncate">
                {activeMission.goal}
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full transition-all duration-500"
                  style={{ width: `${activeMission.progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* The Strategist */}
      <Card className="bg-black/40 border-orange-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-orange-500">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" /> The Strategist
            </div>
            <Badge
              className="border-orange-500 text-orange-500"
              variant="outline"
            >
              Optimizing
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              className="border-orange-500/30 text-orange-400 hover:bg-orange-900/20 h-auto py-4 flex flex-col gap-2"
              variant="outline"
            >
              <ClipboardList className="h-6 w-6" />
              <span>Optimize Workflow</span>
            </Button>
            <Button
              className="border-orange-500/30 text-orange-400 hover:bg-orange-900/20 h-auto py-4 flex flex-col gap-2"
              variant="outline"
            >
              <BarChart className="h-6 w-6" />
              <span>Success Analysis</span>
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs text-gray-500 uppercase tracking-widest">
              Efficiency Insights
            </label>
            <div className="text-sm text-gray-400 space-y-1">
              <p>• Parallel execution reduced build time by 15%</p>
              <p>• Caching suggested for Docker layer steps</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
