import {
  Cpu,
  ShieldAlert,
  TrendingUp,
  FileText,
  Users,
  Target,
  Megaphone,
  Anchor,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentStatusGrid from "@/components/dashboard/agents/AgentStatusGrid";
import SecurityPanel from "@/components/dashboard/agents/SecurityPanel";
import MetricsPanel from "@/components/dashboard/agents/MetricsPanel";
import DocsPanel from "@/components/dashboard/agents/DocsPanel";
import OnboardingPanel from "@/components/dashboard/agents/OnboardingPanel";
import ExecutivePanel from "@/components/dashboard/agents/ExecutivePanel";
import IntegrationsPanel from "@/components/dashboard/agents/IntegrationsPanel";
import OperationsPanel from "@/components/dashboard/agents/OperationsPanel";

export default function AgentDashboard() {
  return (
    <div className="p-8 space-y-8 bg-[#0a0a0a] min-h-screen text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Agent Command Center
          </h1>
          <p className="text-gray-400 mt-2">
            Manage and monitor the AI agent fleet.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="border-green-500 text-green-500" variant="outline">
            System Online
          </Badge>
        </div>
      </div>

      <Tabs className="w-full" defaultValue="status">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 bg-gray-900/50 border border-gray-800 p-1 overflow-x-auto gap-1">
          <TabsTrigger
            className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 font-mono text-xs uppercase tracking-widest min-w-[80px]"
            value="status"
          >
            <Cpu className="mr-2 h-4 w-4" /> Status
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 font-mono text-xs uppercase tracking-widest min-w-[80px]"
            value="executive"
          >
            <Target className="mr-2 h-4 w-4" /> Executive
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400 font-mono text-xs uppercase tracking-widest min-w-[80px]"
            value="security"
          >
            <ShieldAlert className="mr-2 h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400 font-mono text-xs uppercase tracking-widest min-w-[80px]"
            value="metrics"
          >
            <TrendingUp className="mr-2 h-4 w-4" /> Metrics
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400 font-mono text-xs uppercase tracking-widest min-w-[80px]"
            value="docs"
          >
            <FileText className="mr-2 h-4 w-4" /> Docs
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-pink-600/20 data-[state=active]:text-pink-400 font-mono text-xs uppercase tracking-widest min-w-[80px]"
            value="integrations"
          >
            <Megaphone className="mr-2 h-4 w-4" /> Connect
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400 font-mono text-xs uppercase tracking-widest min-w-[80px]"
            value="onboarding"
          >
            <Users className="mr-2 h-4 w-4" /> HR
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-teal-600/20 data-[state=active]:text-teal-400 font-mono text-xs uppercase tracking-widest min-w-[80px]"
            value="operations"
          >
            <Anchor className="mr-2 h-4 w-4" /> Ops
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent className="space-y-4" value="status">
            <AgentStatusGrid />
          </TabsContent>
          <TabsContent value="executive">
            <ExecutivePanel />
          </TabsContent>
          <TabsContent value="security">
            <SecurityPanel />
          </TabsContent>
          <TabsContent value="metrics">
            <MetricsPanel />
          </TabsContent>
          <TabsContent value="docs">
            <DocsPanel />
          </TabsContent>
          <TabsContent value="integrations">
            <IntegrationsPanel />
          </TabsContent>
          <TabsContent value="onboarding">
            <OnboardingPanel />
          </TabsContent>
          <TabsContent value="operations">
            <OperationsPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
