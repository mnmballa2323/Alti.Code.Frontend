"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { 
  Input, 
  Chip, 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Select, 
  SelectItem,
  Tabs,
  Tab
} from "@heroui/react";
import { useSession } from "next-auth/react";
import axios from "axios";

import { API_URL } from "@/lib/config";
import ChatBotLayout from "@/components/ChatbotLayout";

// Standard Showcase Static Agents
const LANGUAGE_AGENTS = [
  { name: "Python Expert", slug: "python", icon: "logos:python", description: "Data science, async FastAPI, type-safe Pydantic models, and ML pipelines." },
  { name: "TypeScript Expert", slug: "typescript", icon: "logos:typescript-icon", description: "Strict-mode TS, generics, mapped types, conditional types, and Zod schemas." },
  { name: "Rust Expert", slug: "rust", icon: "logos:rust", description: "Memory-safe systems code, lifetimes, async with Tokio, and crate design." },
  { name: "Go Expert", slug: "golang", icon: "logos:go", description: "Idiomatic Go: goroutines, channels, context propagation, and standard library." },
  { name: "Java Expert", slug: "java", icon: "logos:java", description: "Spring Boot, JVM tuning, generics, streams, and concurrent programming." },
  { name: "C++ Expert", slug: "cpp", icon: "logos:c-plusplus", description: "Modern C++23, RAII, move semantics, templates, and STL algorithms." },
  { name: "Kotlin Expert", slug: "kotlin", icon: "logos:kotlin-icon", description: "Android, coroutines, sealed classes, and multiplatform development." },
  { name: "Swift Expert", slug: "swift", icon: "logos:swift", description: "SwiftUI, async/await, Combine, and Apple ecosystem best practices." },
  { name: "Ruby Expert", slug: "ruby", icon: "logos:ruby", description: "Rails conventions, ActiveRecord, metaprogramming, and DSL design." },
  { name: "PHP Expert", slug: "php", icon: "logos:php", description: "Laravel, Symfony, PSR standards, and modern PHP 8.x features." },
  { name: "Solidity Expert", slug: "solidity", icon: "logos:solidity", description: "EVM smart contracts, gas optimisation, security auditing, and ERC standards." },
  { name: "Haskell Expert", slug: "haskell", icon: "logos:haskell-icon", description: "Pure functional programming, monads, type classes, and lazy evaluation." },
  { name: "Elixir Expert", slug: "elixir", icon: "logos:elixir", description: "Phoenix, OTP, GenServer, and fault-tolerant distributed systems." },
  { name: "Scala Expert", slug: "scala", icon: "logos:scala", description: "Akka, Spark, Cats, and functional programming on the JVM." },
  { name: "Dart Expert", slug: "dart", icon: "logos:dart", description: "Flutter, null-safety, isolates, and cross-platform mobile development." }
];

const CLOUD_AGENTS = [
  { name: "AWS Expert", slug: "aws", icon: "logos:aws", description: "EC2, Lambda, RDS, S3, CloudFormation, CDK, and IAM policy design." },
  { name: "GCP Expert", slug: "gcp", icon: "logos:google-cloud", description: "Cloud Run, BigQuery, GKE, Pub/Sub, Vertex AI, and Terraform on GCP." },
  { name: "Azure Expert", slug: "azure", icon: "logos:microsoft-azure", description: "AKS, Azure Functions, Cosmos DB, Entra ID, and DevOps pipelines." },
  { name: "Cloudflare Expert", slug: "cloudflare", icon: "logos:cloudflare", description: "Workers, R2, D1, Pages, WAF rules, and edge-native architectures." },
  { name: "Vercel Expert", slug: "vercel", icon: "logos:vercel-icon", description: "Next.js deployment, Edge Functions, ISR, and monorepo projects." }
];

const INTEGRATION_AGENTS = [
  { name: "Stripe Expert", slug: "stripe", icon: "logos:stripe", description: "Payments, subscriptions, Radar fraud, Connect marketplaces, and webhooks." },
  { name: "Twilio Expert", slug: "twilio", icon: "logos:twilio-icon", description: "SMS, WhatsApp, Voice, Verify OTP, A2P 10DLC, and Studio Flows." },
  { name: "SendGrid Expert", slug: "sendgrid", icon: "logos:sendgrid-icon", description: "Transactional email, dynamic templates, suppressions, and deliverability." },
  { name: "OpenAI SDK Expert", slug: "openai", icon: "simple-icons:openai", description: "Chat completions, Assistants v2, tool calling, vision, embeddings, and fine-tuning." },
  { name: "Anthropic Expert", slug: "anthropic", icon: "simple-icons:anthropic", description: "Claude 3.x APIs, tool use, streaming, vision, and prompt caching." }
];

const SECTIONS = [
  { id: "languages", label: "Languages & Runtimes", icon: "solar:code-square-bold", gradient: "from-blue-500 to-indigo-600", agents: LANGUAGE_AGENTS },
  { id: "cloud", label: "Cloud & Infrastructure", icon: "solar:cloud-bold", gradient: "from-sky-400 to-blue-500", agents: CLOUD_AGENTS },
  { id: "integrations", label: "Third-Party Integrations", icon: "solar:bolt-bold", gradient: "from-amber-400 to-orange-500", agents: INTEGRATION_AGENTS }
];

export default function AgentsShowcasePage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  // Active View Tab: "roster" or "laboratory"
  const [activeView, setActiveView] = useState<"roster" | "laboratory">("laboratory");

  // Roster Browse State
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Laboratory State
  const [languagesCatalog, setLanguagesCatalog] = useState<Record<string, any[]>>({});
  const [functionsCatalog, setFunctionsCatalog] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState("");
  const [selectedFunc, setSelectedFunc] = useState("");
  
  // Summoned & Loading State
  const [summoning, setSummoning] = useState(false);
  const [activeSpecialist, setActiveSpecialist] = useState<any | null>(null);
  
  // Sandbox testing state
  const [taskPrompt, setTaskPrompt] = useState("");
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  // Fetch Polyglot Swarm catalog on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await axios.get(`${API_URL}/agents/polyglot/catalog`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        });
        if (res.data.success) {
          setLanguagesCatalog(res.data.data.languages || {});
          setFunctionsCatalog(res.data.data.functions || []);
        }
      } catch (err) {
        console.error("Failed to load dynamic agent catalog", err);
      }
    };
    fetchCatalog();
  }, [accessToken]);

  // Handle Dynamic Summoning
  const handleSummon = async () => {
    if (!selectedLang || !selectedFunc) return;
    setSummoning(true);
    setExecutionResult(null);

    try {
      const res = await axios.post(
        `${API_URL}/agents/polyglot/summon`,
        { langId: selectedLang, funcId: selectedFunc },
        { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} }
      );
      if (res.data.success) {
        setActiveSpecialist(res.data.data);
      }
    } catch (err) {
      console.error("Failed to summon specialist agent", err);
    } finally {
      setSummoning(false);
    }
  };

  // Handle Dynamic Sandbox Execution
  const handleExecute = async () => {
    if (!activeSpecialist || !taskPrompt) return;
    setExecuting(true);

    try {
      const res = await axios.post(
        `${API_URL}/agents/polyglot/execute`,
        {
          langId: selectedLang,
          funcId: selectedFunc,
          task: taskPrompt
        },
        { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} }
      );
      if (res.data.success) {
        setExecutionResult(res.data.data);
      }
    } catch (err) {
      console.error("Agent execution failed", err);
    } finally {
      setExecuting(false);
    }
  };

  // Group languages for the Select selector
  const languageSelectItems = Object.entries(languagesCatalog).flatMap(([cat, list]) => 
    list.map(l => ({
      id: l.id,
      name: `${l.name} (${cat.replace('_', ' ').toUpperCase()})`,
      desc: l.desc
    }))
  );

  const totalShowcase = SECTIONS.reduce((sum, s) => sum + s.agents.length, 0);

  const filteredSections = SECTIONS.map((sec) => ({
    ...sec,
    agents: sec.agents.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((sec) => activeSection === null || sec.id === activeSection);

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-7xl h-[calc(100vh-80px)] overflow-y-auto">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 drop-shadow-sm">
              Sovereign Swarm Center
            </h1>
            <p className="text-default-400 mt-2 text-base md:text-lg">
              Manage and dynamically spawn specialized AI neural workers on-demand
            </p>
          </div>
          
          {/* Top Toggle Switch */}
          <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl w-full md:w-auto">
            <button
              onClick={() => setActiveView("laboratory")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeView === "laboratory" 
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20" 
                  : "text-default-400 hover:text-white"
              }`}
            >
              <Icon icon="solar:globus-bold-duotone" />
              Dynamic Lab
            </button>
            <button
              onClick={() => setActiveView("roster")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeView === "roster" 
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20" 
                  : "text-default-400 hover:text-white"
              }`}
            >
              <Icon icon="solar:users-group-rounded-bold-duotone" />
              Swarm Roster
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeView === "laboratory" ? (
            <motion.div
              key="lab"
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Summoning and Playground Panel */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <Card className="border border-white/10 bg-white/5 backdrop-blur-lg shadow-xl">
                  <CardHeader className="flex gap-3 border-b border-white/10 pb-4">
                    <div className="p-2 bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-400">
                      <Icon className="text-xl" icon="solar:magic-stick-3-bold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Dynamic Swarm Forge</h3>
                      <p className="text-xs text-default-400">Spawn any Language + Function specialist instantly</p>
                    </div>
                  </CardHeader>
                  <CardBody className="flex flex-col gap-5 py-6">
                    {/* Language Selector */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-default-400 block mb-2">
                        Target Language ({languageSelectItems.length} Options)
                      </label>
                      <Select
                        aria-label="Select Target Language"
                        className="w-full"
                        placeholder="Choose a programming language..."
                        classNames={{
                          trigger: "bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-xl",
                          value: "text-white font-medium",
                          popoverContent: "bg-zinc-900 border border-white/10 text-white"
                        }}
                        selectedKeys={selectedLang ? [selectedLang] : []}
                        onChange={(e) => setSelectedLang(e.target.value)}
                      >
                        {languageSelectItems.map((item) => (
                          <SelectItem key={item.id} className="text-white hover:bg-white/10" value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    {/* Functional Role Selector */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-default-400 block mb-2">
                        Core Functional Specialization ({functionsCatalog.length} Options)
                      </label>
                      <Select
                        aria-label="Select Functional Specialization"
                        className="w-full"
                        placeholder="Choose a core system function..."
                        classNames={{
                          trigger: "bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-xl",
                          value: "text-white font-medium",
                          popoverContent: "bg-zinc-900 border border-white/10 text-white"
                        }}
                        selectedKeys={selectedFunc ? [selectedFunc] : []}
                        onChange={(e) => setSelectedFunc(e.target.value)}
                      >
                        {functionsCatalog.map((item) => (
                          <SelectItem key={item.id} className="text-white hover:bg-white/10" value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    {/* Forge Button */}
                    <Button
                      onClick={handleSummon}
                      className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 font-semibold text-white mt-2 rounded-xl py-6 shadow-lg shadow-violet-500/20"
                      isLoading={summoning}
                      disabled={!selectedLang || !selectedFunc}
                    >
                      <Icon className="text-lg" icon="solar:star-fall-minimalistic-bold" />
                      Summon Specialist Agent
                    </Button>
                  </CardBody>
                </Card>

                {/* Interactive Testing Sandbox */}
                {activeSpecialist && (
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col gap-4"
                  >
                    <Card className="border border-white/10 bg-white/5 backdrop-blur-lg">
                      <CardHeader className="flex gap-3 border-b border-white/10 pb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-success/20 border border-success/30 text-success text-lg">
                          🟢
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-base">{activeSpecialist.name}</h4>
                          <span className="text-xs text-success font-mono font-bold">Online & Active in Swarm</span>
                        </div>
                      </CardHeader>
                      <CardBody className="py-5 flex flex-col gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-default-400 block mb-2">
                            Prompt Specialist Agent
                          </label>
                          <textarea
                            value={taskPrompt}
                            onChange={(e) => setTaskPrompt(e.target.value)}
                            placeholder="Describe the algorithm, data structure, or module to generate..."
                            className="w-full h-32 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-default-500 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none font-mono"
                          />
                        </div>

                        <Button
                          onClick={handleExecute}
                          className="bg-success text-black font-bold rounded-xl py-5 hover:bg-success/90 transition-colors shadow-lg shadow-success/15"
                          isLoading={executing}
                          disabled={!taskPrompt}
                        >
                          <Icon className="text-lg" icon="solar:programming-bold" />
                          Initiate Neural Invocations
                        </Button>
                      </CardBody>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Execution Results Panel */}
              <div className="lg:col-span-7">
                {executionResult ? (
                  <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: 20 }}
                    className="flex flex-col gap-4 h-full"
                  >
                    {/* Telemetry Bar */}
                    <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <Icon className="text-xl text-fuchsia-400" icon="solar:tuning-square-bold-duotone" />
                        <span className="text-xs text-default-400 font-bold uppercase tracking-wider">Swarm Telemetry</span>
                      </div>
                      <div className="flex gap-3">
                        <Chip className="bg-white/5 border border-white/10 text-white font-mono" size="sm">
                          Latency: {executionResult.executionTimeMs}ms
                        </Chip>
                        <Chip className="bg-success/20 border border-success/30 text-success font-mono font-bold" size="sm">
                          Confidence: {executionResult.confidence}%
                        </Chip>
                      </div>
                    </div>

                    {/* Result Content Tabs */}
                    <Card className="border border-white/10 bg-white/5 backdrop-blur-lg h-full">
                      <CardBody className="p-0">
                        <Tabs
                          aria-label="Agent Output Tabs"
                          className="px-4 pt-4 border-b border-white/10 pb-2"
                          classNames={{
                            tabList: "bg-black/30 border border-white/5 p-1 rounded-xl",
                            tab: "font-semibold text-xs py-2 px-4 rounded-lg",
                            tabContent: "group-data-[selected=true]:text-white text-default-400"
                          }}
                        >
                          {/* Code Tab */}
                          <Tab
                            key="code"
                            title={
                              <div className="flex items-center gap-1.5">
                                <Icon icon="solar:code-bold" />
                                Generated Code
                              </div>
                            }
                          >
                            <div className="p-5 font-mono text-sm overflow-x-auto max-h-[500px] bg-black/40 text-emerald-400 rounded-b-2xl whitespace-pre">
                              {executionResult.code}
                            </div>
                          </Tab>

                          {/* Unit Tests Tab */}
                          <Tab
                            key="tests"
                            title={
                              <div className="flex items-center gap-1.5">
                                <Icon icon="solar:test-tube-bold" />
                                Autogenerated Tests
                              </div>
                            }
                          >
                            <div className="p-5 font-mono text-sm overflow-x-auto max-h-[500px] bg-black/40 text-blue-400 rounded-b-2xl whitespace-pre">
                              {executionResult.unitTests}
                            </div>
                          </Tab>

                          {/* Big-O Tab */}
                          <Tab
                            key="complexity"
                            title={
                              <div className="flex items-center gap-1.5">
                                <Icon icon="solar:chart-square-bold" />
                                Big-O Analysis
                              </div>
                            }
                          >
                            <div className="p-6 flex flex-col gap-4 text-white">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                                  <span className="text-xs text-default-400 block mb-1 uppercase font-bold">Time Complexity</span>
                                  <span className="text-2xl font-black text-rose-400 font-mono">
                                    {executionResult.complexity?.time || "O(N)"}
                                  </span>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                                  <span className="text-xs text-default-400 block mb-1 uppercase font-bold">Space Complexity</span>
                                  <span className="text-2xl font-black text-amber-400 font-mono">
                                    {executionResult.complexity?.space || "O(1)"}
                                  </span>
                                </div>
                              </div>
                              <div className="p-4 bg-black/30 border border-white/5 rounded-xl mt-2">
                                <h5 className="font-bold text-sm mb-1 uppercase tracking-wider text-default-400">Algorithmic Reasoning</h5>
                                <p className="text-sm leading-relaxed text-default-200">
                                  {executionResult.complexity?.description || "No description provided."}
                                </p>
                              </div>
                            </div>
                          </Tab>

                          {/* Explanation Tab */}
                          <Tab
                            key="explanation"
                            title={
                              <div className="flex items-center gap-1.5">
                                <Icon icon="solar:document-text-bold" />
                                Explanations
                              </div>
                            }
                          >
                            <div className="p-6 text-sm text-default-200 leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-line">
                              {executionResult.explanation}
                            </div>
                          </Tab>
                        </Tabs>
                      </CardBody>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-white/10 bg-white/5 rounded-2xl text-center p-8">
                    <div className="text-default-400 max-w-sm">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto text-default-500">
                        👾
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Awaiting Invocations</h4>
                      <p className="text-sm text-default-400 leading-relaxed">
                        Summon a dynamic specialist agent on the left, then enter a task prompt to generate premium, production-ready systems code.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            // Swarm Roster View (Static catalog)
            <motion.div
              key="roster"
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  isClearable
                  aria-label="Search agents"
                  className="max-w-xs"
                  classNames={{ inputWrapper: "bg-white/5 border-white/10" }}
                  placeholder="Search agents…"
                  startContent={
                    <Icon
                      className="text-default-400 text-lg"
                      icon="solar:magnifer-linear"
                    />
                  }
                  value={search}
                  onClear={() => setSearch("")}
                  onValueChange={setSearch}
                />
                <div className="flex gap-2 flex-wrap">
                  <Chip
                    className={`cursor-pointer ${activeSection === null ? "bg-violet-600 text-white" : "border-white/20 text-default-400"}`}
                    variant={activeSection === null ? "solid" : "bordered"}
                    onClick={() => setActiveSection(null)}
                  >
                    All
                  </Chip>
                  {SECTIONS.map((s) => (
                    <Chip
                      key={s.id}
                      className={`cursor-pointer ${activeSection === s.id ? "bg-violet-600 text-white" : "border-white/20 text-default-400"}`}
                      variant={activeSection === s.id ? "solid" : "bordered"}
                      onClick={() =>
                        setActiveSection(activeSection === s.id ? null : s.id)
                      }
                    >
                      {s.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Sections list */}
              <div className="space-y-12">
                {filteredSections.map((section) => (
                  <section key={section.id}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${section.gradient} shadow-lg`}>
                        <Icon className="text-lg text-white" icon={section.icon} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{section.label}</h2>
                        <p className="text-xs text-default-500">{section.agents.length} agents</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.agents.map((agent) => (
                        <Card key={agent.slug} className="border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                          <CardBody className="flex gap-4 p-5">
                            <div className="text-3xl p-2 bg-black/20 rounded-xl w-fit h-fit flex items-center justify-center">
                              <Icon icon={agent.icon} />
                            </div>
                            <div>
                              <h4 className="font-bold text-white">{agent.name}</h4>
                              <p className="text-xs text-default-400 mt-1">{agent.description}</p>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ChatBotLayout>
  );
}
