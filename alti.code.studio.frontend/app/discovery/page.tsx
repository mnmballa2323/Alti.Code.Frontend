"use client";

import React, { useState, useEffect } from "react";
import { 
  Button, 
  Input, 
  cn,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@heroui/react";
import { 
  Compass, 
  Search, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Bot, 
  Server, 
  ShieldCheck,
  Globe,
  Plus,
  Cpu,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import ChatBotLayout from "@/components/ChatbotLayout";
import { API_URL } from "@/lib/config";
import axios from "axios";

export default function DiscoveryPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "explorer">("catalog");
  const [catalogData, setCatalogData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "agent" | "mcp">("all");
  const [rawCatalogUrl, setRawCatalogUrl] = useState("");

  // Explorer State
  const [explorerTarget, setExplorerTarget] = useState("");
  const [exploring, setExploring] = useState(false);
  const [exploredCatalog, setExploredCatalog] = useState<any>(null);
  const [exploredUrl, setExploredUrl] = useState("");
  const [explorerError, setExplorerError] = useState<string | null>(null);

  // Install Modal State
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedInstall, setSelectedInstall] = useState<any>(null);
  const [installCommand, setInstallCommand] = useState("");
  const [installArgs, setInstallArgs] = useState("");
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState<string | null>(null);

  const [trackedCatalogs, setTrackedCatalogs] = useState<any[]>([]);
  const [loadingTracked, setLoadingTracked] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  const allTrackedEntries = trackedCatalogs.flatMap(cat => {
    const entries = cat.catalog?.entries || [];
    return entries.map((entry: any) => ({
      ...entry,
      sourceDomain: cat.domain,
      sourceDisplayName: cat.displayName
    }));
  });

  const filteredGlobalEntries = allTrackedEntries.filter((entry: any) => {
    if (!globalSearchQuery) return false;
    const matchesSearch = 
      entry.displayName?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      entry.identifier?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      entry.capabilities?.some((c: string) => c.toLowerCase().includes(globalSearchQuery.toLowerCase()));
    return matchesSearch;
  });

  const fetchTrackedCatalogs = async () => {
    setLoadingTracked(true);
    try {
      const res = await axios.get(`${API_URL}/discovery/federated`);
      if (res.data.success) {
        setTrackedCatalogs(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load tracked catalogs:", err);
    } finally {
      setLoadingTracked(false);
    }
  };

  const handleRemoveTracked = async (domain: string) => {
    try {
      const res = await axios.delete(`${API_URL}/discovery/federated/${domain}`);
      if (res.data.success) {
        fetchTrackedCatalogs();
        if (exploredCatalog && (exploredCatalog.host?.displayName === domain || exploredUrl.includes(domain))) {
          setExploredCatalog(null);
          setExploredUrl("");
        }
      }
    } catch (err: any) {
      console.error("Failed to remove tracked catalog:", err);
    }
  };

  const handleLoadCachedCatalog = (trackedEntry: any) => {
    setExploredCatalog(trackedEntry.catalog);
    setExploredUrl(trackedEntry.catalogUrl);
    setExplorerTarget(trackedEntry.domain || trackedEntry.origin);
    setExplorerError(null);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.protocol}//${window.location.host}/.well-known/ai-catalog.json`;
      setRawCatalogUrl(url);
    }

    fetchCatalog();
    fetchTrackedCatalogs();
  }, []);

  const fetchCatalog = () => {
    setLoading(true);
    fetch("/.well-known/ai-catalog.json")
      .then((res) => res.json())
      .then((data) => {
        setCatalogData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load catalog:", err);
        setLoading(false);
      });
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(rawCatalogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!catalogData) return;
    const blob = new Blob([JSON.stringify(catalogData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-catalog.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Federated Explorer - resolve catalog from target domain
  const handleExplore = async () => {
    if (!explorerTarget) return;
    setExploring(true);
    setExplorerError(null);
    setExploredCatalog(null);

    try {
      const res = await axios.post(`${API_URL}/discovery/resolve`, {
        url: explorerTarget
      });

      if (res.data.success) {
        setExploredCatalog(res.data.catalog);
        setExploredUrl(res.data.catalogUrl);
        fetchTrackedCatalogs();
      } else {
        setExplorerError(res.data.message || "Failed to resolve catalog.");
      }
    } catch (err: any) {
      setExplorerError(
        err.response?.data?.message || err.message || "Network error occurred."
      );
    } finally {
      setExploring(false);
    }
  };

  // Open confirmation modal for installing discovered tool/server
  const handleOpenInstall = (entry: any) => {
    setSelectedInstall(entry);
    const inferredPackage = entry.identifier.split(":").pop() || "discovered-mcp-server";
    setInstallCommand("npx");
    setInstallArgs(`-y @modelcontextprotocol/server-${inferredPackage}`);
    setInstallSuccess(null);
    onOpen();
  };

  // Submit local installation request
  const handleInstallConfirm = async () => {
    if (!selectedInstall) return;
    setInstalling(true);
    setInstallSuccess(null);

    try {
      const payload = {
        name: selectedInstall.identifier.split(":").pop(),
        title: selectedInstall.displayName,
        description: selectedInstall.description || "ARD Discovered MCP Server",
        command: installCommand,
        args: installArgs.split(" ").filter(Boolean),
        env: {}
      };

      const res = await axios.post(`${API_URL}/discovery/install`, payload);
      if (res.data.success) {
        setInstallSuccess(`Dynamic capability [${payload.name}] installed successfully!`);
        fetchCatalog(); // Refresh our local exposed catalog
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setExplorerError(err.response?.data?.message || err.message || "Installation failed.");
    } finally {
      setInstalling(false);
    }
  };

  const entries = catalogData?.entries || [];
  const filteredEntries = entries.filter((entry: any) => {
    const matchesSearch = 
      entry.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.identifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.capabilities?.some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const isAgent = entry.type === "application/x-agent+json";
    const isMcp = entry.type === "application/mcp-server-card+json" || entry.type === "application/mcp-server+json";

    if (filterType === "agent") return matchesSearch && isAgent;
    if (filterType === "mcp") return matchesSearch && isMcp;
    return matchesSearch;
  });

  return (
    <ChatBotLayout>
      <div className="flex-1 flex flex-col h-full bg-[#F4F4F6] dark:bg-[#090D16] overflow-y-auto">
        {/* Top Navbar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-[#0D1527]/70 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 text-blue-600 rounded-lg dark:bg-blue-400/10 dark:text-blue-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">ARD Discovery Hub</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Agentic Resource Discovery Catalog Compliance Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("catalog")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  activeTab === "catalog"
                    ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                )}
              >
                My Exposed Catalog
              </button>
              <button
                onClick={() => setActiveTab("explorer")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  activeTab === "explorer"
                    ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                )}
              >
                Federated Explorer
              </button>
            </div>

            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              ARD Spec Compliant
            </span>
          </div>
        </div>

        {/* Tab 1: My Exposed Catalog */}
        {activeTab === "catalog" && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-8 py-8 flex flex-col lg:flex-row gap-8">
            {/* Left Column: Directory */}
            <div className="flex-1 flex flex-col gap-6 lg:max-w-3xl">
              <div className="p-6 bg-white dark:bg-[#0D1527] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-2">Exposed Capabilities Directory</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                  This directory indexes the workspace’s active agents and MCP servers. According to the ARD specification, external federated AI agents can crawl and connect to these resources using standardized discovery signals.
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">Public Discovery Endpoint</label>
                    <div className="flex gap-2">
                      <Input
                        isReadOnly
                        value={rawCatalogUrl}
                        className="font-mono text-xs max-w-lg bg-zinc-50 dark:bg-zinc-900"
                        size="sm"
                      />
                      <Button
                        size="sm"
                        variant="flat"
                        color={copied ? "success" : "default"}
                        onClick={handleCopyUrl}
                        className="font-medium"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onClick={handleDownload}
                        className="font-medium"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                <div className="flex gap-2 bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-xl w-fit">
                  <button
                    onClick={() => setFilterType("all")}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                      filterType === "all" 
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" 
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    )}
                  >
                    All ({entries.length})
                  </button>
                  <button
                    onClick={() => setFilterType("agent")}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                      filterType === "agent" 
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" 
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    )}
                  >
                    Agents ({entries.filter((e: any) => e.type === "application/x-agent+json").length})
                  </button>
                  <button
                    onClick={() => setFilterType("mcp")}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                      filterType === "mcp" 
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" 
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    )}
                  >
                    MCP Servers ({entries.filter((e: any) => e.type !== "application/x-agent+json").length})
                  </button>
                </div>

                <div className="w-full md:w-64">
                  <Input
                    placeholder="Search resources..."
                    size="sm"
                    startContent={<Search className="w-4 h-4 text-zinc-400" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Entries list */}
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0D1527] border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <span className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3" />
                  <p className="text-sm text-zinc-400">Scanning workspace capabilities...</p>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#0D1527] border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <Compass className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No resources found</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredEntries.map((entry: any, idx: number) => {
                    const isAgent = entry.type === "application/x-agent+json";
                    return (
                      <div 
                        key={idx}
                        className="p-5 bg-white dark:bg-[#0D1527] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:border-blue-500/50 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "p-2.5 rounded-xl",
                            isAgent 
                              ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/5 dark:text-purple-400" 
                              : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-400"
                          )}>
                            {isAgent ? <Bot className="w-5 h-5" /> : <Server className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-zinc-800 dark:text-zinc-200">{entry.displayName}</h3>
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 uppercase">
                                {isAgent ? "Agent" : "MCP Server"}
                              </span>
                            </div>
                            <code className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono block mt-0.5">{entry.identifier}</code>
                            
                            <div className="flex flex-wrap gap-1 mt-3">
                              {entry.capabilities?.map((cap: string, cIdx: number) => (
                                <span 
                                  key={cIdx} 
                                  className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:bg-blue-400/5 dark:text-blue-400 text-[10px] font-mono rounded"
                                >
                                  {cap}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:items-end justify-between h-full md:min-h-[60px] gap-2">
                          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                            Representative Query:
                            <span className="italic block text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
                              "{entry.representativeQueries?.[0] || 'Trigger command'}"
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Code Preview & Handshakes */}
            <div className="w-full lg:w-96 flex flex-col gap-6">
              <div className="p-6 bg-white dark:bg-[#0D1527] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Discovery Handshakes
                </h3>

                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Well-Known Manifest Path</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Serving catalog dynamically at `/.well-known/ai-catalog.json`.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Robots.txt Agentmap</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Exposing the catalog location using standard robots directives.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">HTML Catalog Headers</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Injecting `link rel="ai-catalog"` dynamically in RootLayout head.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-[#0D1527] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex-1 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 text-sm">
                    <FileCode className="w-4 h-4 text-blue-500" />
                    ai-catalog.json
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:bg-blue-400/5 dark:text-blue-400 rounded">
                    v1.0
                  </span>
                </div>
                <div className="flex-1 bg-zinc-950 dark:bg-zinc-950/80 rounded-xl p-4 overflow-auto max-h-[400px] border border-zinc-900 font-mono text-[10px] text-zinc-300">
                  {catalogData ? (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(catalogData, null, 2)}</pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-600">
                      Loading preview...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Federated Explorer */}
        {activeTab === "explorer" && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-8 py-8 flex flex-col gap-6">
            
            {/* Search / Crawl Control */}
            <div className="p-6 bg-white dark:bg-[#0D1527] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-2">Federated Catalog Discovery</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Resolve capabilities published by external organizations. The crawler will look up the domain's `robots.txt` for `Agentmap` directives or crawl `/.well-known/ai-catalog.json` directly.
              </p>

              <div className="flex flex-col md:flex-row gap-3 max-w-2xl">
                <Input
                  placeholder="Enter external domain (e.g. google.com or localhost:3000)"
                  startContent={<Globe className="w-4 h-4 text-zinc-400" />}
                  value={explorerTarget}
                  onChange={(e) => setExplorerTarget(e.target.value)}
                  size="md"
                />
                <Button
                  color="primary"
                  isLoading={exploring}
                  onClick={handleExplore}
                  className="font-semibold shrink-0"
                >
                  <Search className="w-4 h-4" />
                  Resolve Catalog
                </Button>
              </div>

              {explorerError && (
                <div className="mt-4 p-4 bg-red-500/10 text-red-600 dark:bg-red-400/5 dark:text-red-400 border border-red-500/20 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{explorerError}</span>
                </div>
              )}
            </div>

            {/* Tracked Registries Grid */}
            <div className="p-6 bg-white dark:bg-[#0D1527] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-md font-bold text-zinc-800 dark:text-zinc-100">Monitored Federated Registries</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Tracked domains with compliant ARD catalogs that are queried dynamically by the Swarm for capability self-provisioning.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-64">
                    <Input
                      placeholder="Search all remote capabilities..."
                      size="sm"
                      startContent={<Search className="w-3.5 h-3.5 text-zinc-400" />}
                      value={globalSearchQuery}
                      onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    />
                  </div>
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 text-xs font-semibold rounded-full">
                    {trackedCatalogs.length} Active Domain{trackedCatalogs.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {globalSearchQuery && (
                <div className="mb-6 p-5 border border-blue-500/20 dark:border-blue-500/10 bg-blue-500/[0.02] dark:bg-blue-500/[0.01] rounded-xl flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 animate-pulse" />
                    Global Search Results ({filteredGlobalEntries.length})
                  </h4>
                  {filteredGlobalEntries.length === 0 ? (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">No capabilities found matching "{globalSearchQuery}" across monitored registries.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {filteredGlobalEntries.map((entry: any, idx: number) => {
                        const isAgent = entry.type === "application/x-agent+json";
                        return (
                          <div 
                            key={idx}
                            className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#090D16] hover:border-blue-500/35 rounded-xl flex items-center justify-between gap-4 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-lg",
                                isAgent 
                                  ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/5 dark:text-purple-400" 
                                  : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-400"
                              )}>
                                {isAgent ? <Bot className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{entry.displayName}</span>
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 uppercase">
                                    {isAgent ? "Agent" : "MCP Server"}
                                  </span>
                                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500">
                                    from <span className="font-semibold text-zinc-500 dark:text-zinc-400">{entry.sourceDisplayName}</span>
                                  </span>
                                </div>
                                <code className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono block mt-0.5">{entry.identifier}</code>
                              </div>
                            </div>
                            
                            {!isAgent && (
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<Plus className="w-3 h-3" />}
                                onClick={() => handleOpenInstall(entry)}
                                className="h-7 text-[10px] font-semibold"
                              >
                                Install
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {loadingTracked ? (
                <div className="flex items-center justify-center py-6">
                  <span className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-2" />
                  <span className="text-xs text-zinc-400">Loading tracked registries...</span>
                </div>
              ) : trackedCatalogs.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <Globe className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">No external catalogs resolved yet. Enter a domain above to register and track its capabilities.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trackedCatalogs.map((entry, idx) => {
                    const entryCount = entry.catalog?.entries?.length || 0;
                    return (
                      <div 
                        key={idx} 
                        className="p-4 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col justify-between gap-3 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">{entry.displayName}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:bg-blue-400/5 dark:text-blue-400">
                              {entryCount} Item{entryCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <code className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono block mt-1 truncate">{entry.domain}</code>
                          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{entry.identifier}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-zinc-200/60 dark:border-zinc-800/60 pt-3 mt-1">
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
                            Synced {new Date(entry.lastResolvedAt).toLocaleTimeString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="flat" 
                              color="primary"
                              onClick={() => handleLoadCachedCatalog(entry)}
                              className="h-7 text-[10px] font-semibold px-3"
                            >
                              Explore
                            </Button>
                            <Button 
                              size="sm" 
                              variant="light" 
                              color="danger"
                              onClick={() => handleRemoveTracked(entry.domain)}
                              className="h-7 text-[10px] font-semibold px-2"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Explored Results */}
            {exploredCatalog && (
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Entries List */}
                <div className="flex-1 flex flex-col gap-6">
                  
                  {/* Host Info */}
                  <div className="p-5 bg-white dark:bg-[#0D1527] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold tracking-wider uppercase">Publisher host identity</div>
                      <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200 mt-1">{exploredCatalog.host?.displayName || "Unknown Host"}</h3>
                      <code className="text-xs text-blue-500 font-mono mt-0.5 block">{exploredCatalog.host?.identifier || "did:web:unknown"}</code>
                    </div>
                    {exploredCatalog.host?.documentationUrl && (
                      <a 
                        href={exploredCatalog.host.documentationUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5"
                      >
                        Docs
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Discovered entries list */}
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-2">Discovered Capabilities ({exploredCatalog.entries?.length || 0})</h3>
                  <div className="flex flex-col gap-4">
                    {exploredCatalog.entries?.map((entry: any, idx: number) => {
                      const isAgent = entry.type === "application/x-agent+json";
                      return (
                        <div 
                          key={idx}
                          className="p-5 bg-white dark:bg-[#0D1527] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:border-blue-500/30 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                        >
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "p-2.5 rounded-xl",
                              isAgent 
                                ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/5 dark:text-purple-400" 
                                : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-400"
                            )}>
                              {isAgent ? <Bot className="w-5 h-5" /> : <Server className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-zinc-800 dark:text-zinc-200">{entry.displayName}</h3>
                                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 uppercase">
                                  {isAgent ? "Agent" : "MCP Server"}
                                </span>
                              </div>
                              <code className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono block mt-0.5">{entry.identifier}</code>
                              
                              <div className="flex flex-wrap gap-1 mt-3">
                                {entry.capabilities?.map((cap: string, cIdx: number) => (
                                  <span 
                                    key={cIdx} 
                                    className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:bg-blue-400/5 dark:text-blue-400 text-[10px] font-mono rounded"
                                  >
                                    {cap}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col md:items-end justify-between h-full md:min-h-[85px] gap-3">
                            <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                              Capabilities check:
                              <span className="italic block text-zinc-500 dark:text-zinc-400 mt-0.5">
                                "{entry.representativeQueries?.[0] || 'Trigger command'}"
                              </span>
                            </div>

                            {!isAgent && (
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<Plus className="w-3.5 h-3.5" />}
                                onClick={() => handleOpenInstall(entry)}
                                className="font-semibold w-full md:w-auto"
                              >
                                Install Locally
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Crawled Raw JSON View */}
                <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0">
                  <div className="p-6 bg-white dark:bg-[#0D1527] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 text-sm">
                        <FileCode className="w-4 h-4 text-blue-500" />
                        Raw resolved schema
                      </span>
                    </div>
                    <div className="flex-1 bg-zinc-950 dark:bg-zinc-950/80 rounded-xl p-4 overflow-auto max-h-[500px] border border-zinc-900 font-mono text-[10px] text-zinc-300">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(exploredCatalog, null, 2)}</pre>
                    </div>
                  </div>
                </div>

              </div>
            )}
            
          </div>
        )}
      </div>

      {/* Local Installation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" size="lg" className="dark:text-white">
        <ModalContent className="dark:bg-[#090D16] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
          <ModalHeader className="flex gap-2 items-center">
            <Cpu className="w-5 h-5 text-blue-500" />
            <span>Configure Discovered Capability</span>
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Confirm the launch execution command to spin up this discovered MCP server in your local Alti.Code.Studio workspace environment.
            </p>

            <div className="flex flex-col gap-3">
              <Input
                label="Capability Identifier"
                isReadOnly
                value={selectedInstall?.identifier || ""}
                size="sm"
                className="font-mono text-xs"
              />
              <Input
                label="Command"
                value={installCommand}
                onChange={(e) => setInstallCommand(e.target.value)}
                size="sm"
              />
              <Input
                label="Arguments"
                value={installArgs}
                onChange={(e) => setInstallArgs(e.target.value)}
                size="sm"
              />
            </div>

            {installSuccess && (
              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/5 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{installSuccess}</span>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="flex gap-2">
            <Button variant="flat" onClick={onClose} disabled={installing}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleInstallConfirm} isLoading={installing}>
              Activate Integration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChatBotLayout>
  );
}
