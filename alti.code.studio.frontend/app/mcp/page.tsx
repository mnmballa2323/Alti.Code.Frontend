"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

import { AlertWrapper } from "@/components/ui/AlertWrapper";
import { API_URL } from "@/lib/config";
import { SAAS_MOCKS } from "../connect-apps/catalog";

type Tool = {
  name: string;
  description: string;
  server?: string;
  inputSchema?: any;
};

type AppIntegration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  logo?: string;
  color: string;
  status: "connected" | "disconnected" | "connecting";
  type: "official" | "custom";
};

// Command Preset Registry
const COMMAND_PRESETS: Record<string, { command: string; args: string[] }> = {
  // Reference MCP Servers
  "mcp_sqlite": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sqlite", "--file", "database.sqlite"]
  },
  "mcp_github": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"]
  },
  "mcp_fetch": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-fetch"]
  },
  "mcp_postgresql": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres"]
  },
  "mcp_puppeteer": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"]
  },
  "mcp_brave_search": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"]
  },
  "mcp_everything": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-everything"]
  },
  "mcp_memory": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"]
  },
  "mcp_sequential_thinking": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  },
  "mcp_time": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-time"]
  },
  "mcp_git": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-git"]
  },
  "mcp_gitlab": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-gitlab"]
  },
  "mcp_google_calendar": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-google-calendar"]
  },
  "mcp_google_maps": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-google-maps"]
  },
  "mcp_evernote": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-evernote"]
  },

  // Google MCP Toolbox Preset Databases
  "mcp_toolbox_alloydb": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=alloydb"]
  },
  "mcp_toolbox_spanner": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=spanner"]
  },
  "mcp_toolbox_bigquery": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=bigquery"]
  },
  "mcp_toolbox_bigtable": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=bigtable"]
  },
  "mcp_toolbox_cloudsql": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=cloudsql"]
  },
  "mcp_toolbox_looker": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=looker"]
  },
  "mcp_toolbox_dataproc": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=dataproc"]
  },
  "mcp_toolbox_monitoring": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=monitoring"]
  },
  "mcp_toolbox_logging": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=logging"]
  },
  "mcp_toolbox_healthcare": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=healthcare"]
  },
  "mcp_toolbox_knowledge_catalog": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=knowledge_catalog"]
  },
  "mcp_toolbox_mssql": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=mssql"]
  },
  "mcp_toolbox_cockroachdb": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=cockroachdb"]
  },
  "mcp_toolbox_yugabytedb": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=yugabytedb"]
  },
  "mcp_toolbox_clickhouse": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=clickhouse"]
  },
  "mcp_toolbox_tidb": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=tidb"]
  },
  "mcp_toolbox_oceanbase": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=oceanbase"]
  },
  "mcp_toolbox_firebird": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=firebird"]
  },
  "mcp_toolbox_singlestore": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=singlestore"]
  },
  "mcp_toolbox_mariadb": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=mariadb"]
  },
  "mcp_toolbox_couchbase": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=couchbase"]
  },
  "mcp_toolbox_cassandra": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=cassandra"]
  },
  "mcp_toolbox_dgraph": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=dgraph"]
  }
};

// Dynamic Branded Image Icon Component
const AppIcon = ({ app, className = "w-8 h-8" }: { app: AppIntegration; className?: string }) => {
  const [imageError, setImageError] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);
  
  const slug = app.id.replace("app-", "").toLowerCase();
  let cleanSlug = slug.startsWith("_") ? slug.slice(1) : slug;
  if (cleanSlug.startsWith("mcp_toolbox_")) {
    cleanSlug = cleanSlug.slice(12);
  } else if (cleanSlug.startsWith("mcp_")) {
    cleanSlug = cleanSlug.slice(4);
  }
  
  const localLogoMappings: Record<string, string> = {
    "github": "github.png",
    "slack": "slack.svg",
    "jira": "jira.svg",
    "notion": "notion.svg",
    "linear": "linear.png",
    "googledrive": "google-drive.svg",
    "googlesheets": "google-sheets.svg",
    "salesforce": "salesforce.svg",
    "discord": "discord.svg",
    "gmail": "gmail.svg",
    "ably": "ably.svg",
    "airtable": "airtable.svg",
    "asana": "asana.png",
    "bitbucket": "bitbucket.svg",
    "canva": "canva.jpeg",
    "clickup": "clickup.png",
    "figma": "figma.svg",
    "hubspot": "hubspot.webp",
    "shopify": "shopify.svg",
    "supabase": "supabase.jpeg",
    "trello": "trello.svg",
    "youtube": "youtube.svg",
    "zoom": "zoom.svg",
  };

  const specialLogoUrls: Record<string, string> = {
    "1password": "https://logo.clearbit.com/1password.com",
    "21risk": "https://github.com/21RISK.png",
    "2chat": "https://github.com/2ChatCo.png",
    "mcp_brave_search": "https://logo.clearbit.com/brave.com",
    "mcp_fetch": "https://avatars.githubusercontent.com/u/150796347?s=200&v=4",
    "mcp_puppeteer": "https://logo.clearbit.com/puppeteer.io",
    "mcp_postgresql": "https://logo.clearbit.com/postgresql.org",
    "mcp_sqlite": "https://logo.clearbit.com/sqlite.org",
    "mcp_gitlab": "https://logo.clearbit.com/gitlab.com",
    "mcp_google_calendar": "https://logo.clearbit.com/calendar.google.com",
    "mcp_google_maps": "https://logo.clearbit.com/maps.google.com",
    "mcp_evernote": "https://logo.clearbit.com/evernote.com",
    "mcp_time": "https://avatars.githubusercontent.com/u/150796347?s=200&v=4",
    "mcp_memory": "https://avatars.githubusercontent.com/u/150796347?s=200&v=4",
    "mcp_aws_knowledge_base": "https://logo.clearbit.com/aws.amazon.com",
    "mcp_chromadb": "https://logo.clearbit.com/trychroma.com",
    "mcp_everything": "https://avatars.githubusercontent.com/u/150796347?s=200&v=4",
  };

  const getUrlsToTry = () => {
    const urls: string[] = [];
    const addUrl = (url: string) => {
      if (url && !urls.includes(url)) urls.push(url);
    };

    const localFile = localLogoMappings[cleanSlug] || localLogoMappings[slug];
    if (localFile) addUrl(`/assets/apps-logos/${localFile}`);

    const specialUrl = specialLogoUrls[cleanSlug] || specialLogoUrls[slug];
    if (specialUrl) addUrl(specialUrl);

    addUrl(`https://logos.composio.dev/api/${cleanSlug.replace(/_/g, "-")}`);
    addUrl(`https://logos.composio.dev/api/${cleanSlug}`);

    const suffixToStrip = ["_search", "_database", "_integration", "_server", "_toolbox"];
    let brand = cleanSlug;
    for (const suffix of suffixToStrip) {
      if (brand.endsWith(suffix)) {
        brand = brand.slice(0, -suffix.length);
        break;
      }
    }

    const cleanName = app.name.toLowerCase().trim().replace(/[^a-z0-9\s-_]/g, "");
    const firstWord = cleanName.split(/\s+/)[0];

    const candidateDomains = [
      `${brand}.com`,
      `${firstWord}.com`,
      `${brand}.io`,
      `${brand}.org`,
      `${firstWord}.io`,
    ];

    for (const dom of candidateDomains) {
      addUrl(`https://logo.clearbit.com/${dom}`);
    }

    // Default MCP organizational fallback - no initial boxes
    addUrl("https://avatars.githubusercontent.com/u/150796347?s=200&v=4");

    return urls;
  };

  const urlsToTry = getUrlsToTry();
  const currentLogoUrl = urlsToTry[urlIndex];

  const handleImageError = () => {
    if (urlIndex < urlsToTry.length - 1) {
      setUrlIndex(urlIndex + 1);
    } else {
      setImageError(true);
    }
  };

  if (!imageError && currentLogoUrl) {
    return (
      <img
        src={currentLogoUrl}
        alt={`${app.name} logo`}
        className={`${className} object-contain p-0.5`}
        onError={handleImageError}
      />
    );
  }

  // Pure aesthetic circular initials
  return (
    <div className={`rounded-xl flex items-center justify-center font-bold text-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white ${className}`}>
      {app.name.slice(0, 2).toUpperCase()}
    </div>
  );
};

export default function McpDashboard() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [activeTab, setActiveTab] = useState<"directory" | "tools">("directory");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Connection drawer / modal state
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedServerApp, setSelectedServerApp] = useState<AppIntegration | null>(null);
  const [command, setCommand] = useState("npx");
  const [argsInput, setArgsInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const serverRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 120+ MCP & Google MCP Toolbox Server list parsed from SAAS_MOCKS
  const mcpServers: AppIntegration[] = SAAS_MOCKS.filter((mockApp) =>
    mockApp.slug.startsWith("mcp_") || mockApp.slug.startsWith("mcp_toolbox_")
  ).map((mockApp) => ({
    id: `app-${mockApp.slug}`,
    name: mockApp.name,
    description: mockApp.slug.startsWith("mcp_toolbox_")
      ? `Connect and explore data dynamically within ${mockApp.name} powered by the Google Cloud MCP Toolbox.`
      : `Integrate secure natural-language tool parameters and operations with ${mockApp.name}.`,
    icon: mockApp.icon,
    color: "bg-white border border-gray-200",
    status: "disconnected" as const,
    type: "official" as const,
  })).sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    fetchTools();
  }, []);

  // Listen to sidebar clicks
  useEffect(() => {
    const handleSelectServer = (e: any) => {
      const app = e.detail as AppIntegration;
      if (app) {
        setActiveTab("directory");
        setSelectedServerApp(app);
        
        // Load presets if available
        const slug = app.id.replace("app-", "");
        const preset = COMMAND_PRESETS[slug];
        if (preset) {
          setCommand(preset.command);
          setArgsInput(preset.args.join(" "));
        } else {
          setCommand("npx");
          setArgsInput(`-y @modelcontextprotocol/server-${slug.replace("mcp_", "")}`);
        }
        
        onOpen();

        // Scroll to server card smoothly
        setTimeout(() => {
          serverRefs.current[app.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    };
    window.addEventListener("select-mcp-server", handleSelectServer);
    return () => window.removeEventListener("select-mcp-server", handleSelectServer);
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/mcp/tools/local`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (res.data.success) {
        setTools(res.data.data);
      } else {
        setError("Failed to fetch tools.");
      }
    } catch (err) {
      setError(
        "Backend is unreachable. Ensure the server is running on port 5000.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchServer = async (onClose: () => void) => {
    if (!selectedServerApp) return;
    setIsConnecting(true);
    setError(null);
    try {
      const slug = selectedServerApp.id.replace("app-", "");
      const parsedArgs = argsInput.trim() ? argsInput.split(/\s+/) : [];
      
      await axios.post(
        `${API_URL}/mcp/connect`,
        {
          name: slug,
          command: command,
          args: parsedArgs
        },
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );
      
      await fetchTools();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to connect to the MCP server. Ensure parameters are valid.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Check if a server has any active tools registered
  const isServerActive = (slug: string) => {
    return tools.some((t) => t.server === slug);
  };

  const filteredServers = mcpServers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.server || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-default-50/50 p-6 overflow-y-auto w-full">
      {/* Standard Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
            Nervous System
          </h1>
          <p className="text-gray-500 mt-1">
            Standardized Client-Server Tool Execution Hub (Model Context Protocol)
          </p>
        </div>
        <Chip className="border-success" color="success" variant="dot">
          Orchestrator Online
        </Chip>
      </div>

      {error && (
        <AlertWrapper className="mb-4" variant="danger">
          <div className="flex items-center gap-2">
            <Icon icon="solar:danger-triangle-bold" />
            <span>{error}</span>
            <Button size="sm" variant="flat" onPress={() => setError(null)}>
              Clear
            </Button>
          </div>
        </AlertWrapper>
      )}

      {/* Controller Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Tab Selection */}
        <div className="flex p-1 bg-default-100 dark:bg-default-50 rounded-xl">
          <button
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "directory"
                ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white"
                : "text-default-500 hover:text-default-700"
            }`}
            onClick={() => setActiveTab("directory")}
          >
            Server Directory ({mcpServers.length})
          </button>
          <button
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "tools"
                ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white"
                : "text-default-500 hover:text-default-700"
            }`}
            onClick={() => setActiveTab("tools")}
          >
            Active Tools ({tools.length})
          </button>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Input
            className="max-w-xs"
            placeholder={activeTab === "directory" ? "Search servers..." : "Search tools..."}
            startContent={<Icon icon="solar:magnifer-linear" />}
            value={search}
            onValueChange={setSearch}
          />
          <Button
            color="primary"
            startContent={<Icon icon="solar:refresh-linear" />}
            variant="flat"
            onPress={fetchTools}
          >
            Sync Status
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner label="Synchronizing local transports..." size="lg" />
        </div>
      ) : activeTab === "directory" ? (
        /* MCP Server Directory Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServers.map((server) => {
            const slug = server.id.replace("app-", "");
            const active = isServerActive(slug);
            return (
              <Card
                key={server.id}
                ref={(el) => { serverRefs.current[server.id] = el; }}
                className={`hover:scale-[1.01] transition-all border ${
                  active ? "border-success/30 bg-success/5" : "border-default-200"
                }`}
              >
                <CardHeader className="flex gap-4 p-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-black border border-default-200 shadow-sm overflow-hidden shrink-0">
                    <AppIcon app={server} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold truncate">{server.name}</p>
                      {active && (
                        <Chip size="sm" color="success" variant="flat" className="h-5 text-[10px]">
                          Connected
                        </Chip>
                      )}
                    </div>
                    <span className="text-[10px] text-default-400 font-mono mt-0.5 truncate">
                      {slug}
                    </span>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="p-4 flex flex-col justify-between gap-4">
                  <p className="text-default-600 dark:text-default-300 text-xs leading-relaxed min-h-[48px]">
                    {server.description}
                  </p>
                  <Button
                    color={active ? "success" : "primary"}
                    size="sm"
                    className="font-bold text-xs"
                    startContent={<Icon icon={active ? "solar:settings-bold" : "solar:plug-circle-bold"} />}
                    variant={active ? "flat" : "solid"}
                    onPress={() => {
                      setSelectedServerApp(server);
                      const preset = COMMAND_PRESETS[slug];
                      if (preset) {
                        setCommand(preset.command);
                        setArgsInput(preset.args.join(" "));
                      } else {
                        setCommand("npx");
                        setArgsInput(`-y @modelcontextprotocol/server-${slug.replace("mcp_", "")}`);
                      }
                      onOpen();
                    }}
                  >
                    {active ? "Reconfigure" : "Launch Server"}
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Active Registered Tools view */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <Card key={tool.name} className="hover:scale-[1.01] transition-transform border border-default-200">
              <CardHeader className="flex gap-3 p-4">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Icon icon="solar:code-square-bold" width={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-bold truncate">{tool.name}</p>
                  <span className="text-[10px] text-default-400 font-mono mt-0.5 truncate">
                    source: {tool.server}
                  </span>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-4">
                <p className="text-default-600 dark:text-default-300 text-xs leading-relaxed mb-4 min-h-[36px]">
                  {tool.description || "No tool description provided."}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {tool.inputSchema?.required?.map((req: string) => (
                    <Chip key={req} color="danger" size="sm" variant="flat" className="h-5 text-[9px]">
                      {req}*
                    </Chip>
                  ))}
                  {Object.keys(tool.inputSchema?.properties || {})
                    .filter((p: string) => !tool.inputSchema?.required?.includes(p))
                    .map((prop: string) => (
                      <Chip key={prop} size="sm" variant="flat" className="h-5 text-[9px]">
                        {prop}
                      </Chip>
                    ))}
                </div>
              </CardBody>
            </Card>
          ))}
          {filteredTools.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-default-400 italic text-sm">
              No registered tools found. Connect an MCP server to ingest tools dynamically.
            </div>
          )}
        </div>
      )}

      {/* Dynamic Stdio Server Injection Configuration Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="rounded-3xl border border-default-200">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex gap-2 items-center text-lg">
                <Icon icon="solar:server-bold" className="text-primary" />
                Configure {selectedServerApp?.name}
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4 py-4">
                <p className="text-xs text-default-500 leading-relaxed">
                  Provide stdio command arguments to instantiate the server. The Nervous System orchestrates tool executions dynamically.
                </p>
                
                <div className="flex gap-3">
                  <Input
                    className="w-1/3"
                    label="Command"
                    placeholder="npx"
                    value={command}
                    variant="bordered"
                    onValueChange={setCommand}
                  />
                  <Input
                    className="w-2/3"
                    label="Arguments"
                    placeholder="-y @modelcontextprotocol/server-fetch"
                    value={argsInput}
                    variant="bordered"
                    onValueChange={setArgsInput}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose} className="font-bold text-xs">
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isConnecting}
                  onPress={() => handleLaunchServer(onClose)}
                  className="font-bold text-xs"
                >
                  Inject Transport
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
