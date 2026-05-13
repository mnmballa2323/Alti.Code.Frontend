"use client";

import React from "react";
import {
  Shield,
  Lock,
  Activity,
  FileText,
  Users,
  Code,
  Zap,
  Globe,
  Search,
  Database,
  Brush,
  Building2,
  Scissors,
  Megaphone,
  CheckCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const agents = [
  {
    name: "The Sentinel",
    role: "Security",
    icon: Shield,
    status: "Active",
    color: "text-red-500",
    border: "border-red-500",
  },
  {
    name: "The Governor",
    role: "Compliance",
    icon: Lock,
    status: "Active",
    color: "text-blue-500",
    border: "border-blue-500",
  },
  {
    name: "The Analyst",
    role: "Data",
    icon: Activity,
    status: "Predicting",
    color: "text-purple-500",
    border: "border-purple-500",
  },
  {
    name: "The Scribe",
    role: "Docs",
    icon: FileText,
    status: "Idle",
    color: "text-yellow-500",
    border: "border-yellow-500",
  },
  {
    name: "The Recruiter",
    role: "HR",
    icon: Users,
    status: "Idle",
    color: "text-green-500",
    border: "border-green-500",
  },
  {
    name: "The Simulator",
    role: "Chaos",
    icon: Zap,
    status: "Idle",
    color: "text-orange-500",
    border: "border-orange-500",
  },
  {
    name: "The Architect",
    role: "DevOps",
    icon: Building2,
    status: "Standby",
    color: "text-cyan-500",
    border: "border-cyan-500",
  },
  {
    name: "The Surgeon",
    role: "Refactor",
    icon: Scissors,
    status: "Standby",
    color: "text-pink-500",
    border: "border-pink-500",
  },
  {
    name: "The Spokesperson",
    role: "Release",
    icon: Megaphone,
    status: "Standby",
    color: "text-indigo-500",
    border: "border-indigo-500",
  },
  {
    name: "The Detective",
    role: "Audit",
    icon: Search,
    status: "Scanning",
    color: "text-emerald-500",
    border: "border-emerald-500",
  },
  {
    name: "The Oracle",
    role: "DBA",
    icon: Database,
    status: "Standby",
    color: "text-teal-500",
    border: "border-teal-500",
  },
  {
    name: "The Painter",
    role: "Design",
    icon: Brush,
    status: "Standby",
    color: "text-fuchsia-500",
    border: "border-fuchsia-500",
  },
  {
    name: "The Diplomat",
    role: "i18n",
    icon: Globe,
    status: "Standby",
    color: "text-sky-500",
    border: "border-sky-500",
  },
  {
    name: "The Composer",
    role: "Coding",
    icon: Code,
    status: "Coding",
    color: "text-lime-500",
    border: "border-lime-500",
  },
  {
    name: "The Critic",
    role: "QA",
    icon: CheckCircle,
    status: "Testing",
    color: "text-rose-500",
    border: "border-rose-500",
  },
];

export default function AgentStatusGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {agents.map((agent) => (
        <Card
          key={agent.name}
          className={`bg-black/40 border-gray-800 hover:bg-gray-900/60 transition-colors group`}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center gap-3 text-center">
            <div
              className={`p-3 rounded-full bg-gray-900/50 group-hover:bg-gray-800 ${agent.color} border ${agent.border} bg-opacity-20 border-opacity-30`}
            >
              {React.createElement(agent.icon || Code, {
                className: `h-6 w-6 ${agent.color}`,
              })}
            </div>
            <div>
              <p className="font-bold text-sm text-gray-200">{agent.name}</p>
              <p className="text-xs text-gray-500">{agent.role}</p>
            </div>
            <Badge
              className={`text-xs ${agent.color} border-opacity-50`}
              variant="outline"
            >
              {agent.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
