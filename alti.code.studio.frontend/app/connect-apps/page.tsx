"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";
import { Input, Button, Chip } from "@heroui/react";

import { SAAS_MOCKS } from "./catalog";
import ChatBotLayout from "@/components/ChatbotLayout";
import { API_URL } from "@/lib/config";
import { AlertWrapper } from "@/components/ui/AlertWrapper";

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

type Tool = {
  name: string;
  description: string;
  server?: string;
  inputSchema?: any;
};

// Command Preset Registry for MCP & Google MCP Toolbox
const COMMAND_PRESETS: Record<string, { command: string; args: string[] }> = {
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
  "mcp_filesystem": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/michaelmeram/workspace/alti.code.studio"]
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
  "mcp_everart": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-everart"]
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

const CORE_APPS: AppIntegration[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Sync repositories, read PRs, and commit code directly.",
    icon: "mdi:github",
    color: "bg-gray-800 dark:bg-white text-white dark:text-gray-900",
    status: "disconnected",
    type: "official",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Read channel messages and send notifications.",
    icon: "logos:slack-icon",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Manage sprints, update tickets, and track velocity.",
    icon: "logos:jira",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Search internal docs and update knowledge base.",
    icon: "logos:notion-icon",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Modern issue tracking and project management for software teams.",
    icon: "logos:linear",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
  {
    id: "googledrive",
    name: "Google Drive",
    description: "Read and write documents directly to Google Workspace.",
    icon: "logos:google-drive",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "CRM integration to manage leads, contacts, opportunities, and accounts.",
    icon: "logos:salesforce",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
  {
    id: "discord",
    name: "Discord",
    description: "Interact with community channels, manage roles, and deploy bots.",
    icon: "logos:discord-icon",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
];

const coreAppIds = new Set(CORE_APPS.map((app) => app.id));

const FALLBACK_APPS: AppIntegration[] = [
  ...CORE_APPS,
  ...SAAS_MOCKS.filter((mockApp) => !coreAppIds.has(mockApp.slug)).map(
    (mockApp) => ({
      id: `app-${mockApp.slug}`,
      name: mockApp.name,
      description: mockApp.slug.startsWith("mcp_toolbox_")
        ? `Connect and explore data dynamically within ${mockApp.name} powered by the Google Cloud MCP Toolbox.`
        : `Seamlessly connect and automate workflows directly with ${mockApp.name}.`,
      icon: mockApp.icon,
      color: "bg-white border border-gray-200",
      status: "disconnected" as const,
      type: "official" as const,
    }),
  ),
].sort((a, b) => a.name.localeCompare(b.name));

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
    // Core Apps
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
    
    // Google MCP Toolbox & Database Integrations
    "alloydb": "google-cloud.svg",
    "spanner": "google-cloud.svg",
    "bigquery": "googl-bigquery.svg",
    "bigtable": "google-cloud.svg",
    "cloudsql": "google-cloud.svg",
    "dataproc": "google-cloud.svg",
    "monitoring": "google-cloud.svg",
    "logging": "google-cloud.svg",
    "healthcare": "google-cloud.svg",
    "knowledge_catalog": "google-cloud.svg",
    
    // AWS & Azure Integrations
    "aws_ec2": "aws.svg",
    "aws_knowledge_base": "aws.svg",
    "aws_lambda": "aws.svg",
    "aws_s3": "aws.svg",
    "azure_vm": "azure.svg",
    "azure_blob": "azure.svg",
    
    // Official Git & Filesystem MCP Integrations
    "git": "git.svg",
    "filesystem": "filesystem.svg",
    
    // A Apps
    "ably": "ably.svg",
    "acculynx": "acculynx.jpeg",
    "active_campaign": "activecampaign.png",
    "activecampaign": "activecampaign.png",
    "affinity": "affinity.jpeg",
    "agencyzoom": "agencyzoom_logo.jpeg",
    "ahrefs": "ahrefs.png",
    "airtable": "airtable.svg",
    "amcards": "amcards.svg",
    "amplitude": "amplitude.svg",
    "apaleo": "apaleo.png",
    "apollo": "apollo.jpg",
    "asana": "asana.png",
    "attio": "attio.webp",
    
    // B Apps
    "baselinker": "baselinker-logo.png",
    "baserow": "baserow-logo.jpeg",
    "bitbucket": "bitbucket.svg",
    "bolna": "bolna-logo.png",
    "borneo": "borneo.jpeg",
    "brandfetch": "brandfetch-logo.png",
    "brex": "brex-staging-logo.png",
    "browseai": "browseai.svg",
    
    // C Apps
    "cal": "cal-logo.png",
    "calendarhero": "calendarhero_fixed_20250722.png",
    "calendly": "calendly.svg",
    "canva": "canva.jpeg",
    "canvas": "canvas.jpeg",
    "capsule_crm": "capsule_crm-logo.png",
    "clickup": "clickup.png",
    "coda": "coda.png",
    
    // Other standard integrations
    "docusign": "docusign.svg",
    "dropbox": "dropbox.svg",
    "figma": "figma.svg",
    "hubspot": "hubspot.webp",
    "linkedin": "linkedin.svg",
    "shopify": "shopify.svg",
    "supabase": "supabase.jpeg",
    "trello": "trello.svg",
    "twitter": "twitter.png",
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
    "everart": "https://logo.clearbit.com/everart.ai",
    "mcp_everart": "https://logo.clearbit.com/everart.ai",
    "mcp_time": "https://avatars.githubusercontent.com/u/150796347?s=200&v=4",
    "mcp_memory": "https://avatars.githubusercontent.com/u/150796347?s=200&v=4",
    "aws_ec2": "https://logo.clearbit.com/amazon.com",
    "mcp_aws_ec2": "https://logo.clearbit.com/amazon.com",
    "aws_knowledge_base": "https://logo.clearbit.com/amazon.com",
    "mcp_aws_knowledge_base": "https://logo.clearbit.com/amazon.com",
    "aws_lambda": "https://logo.clearbit.com/amazon.com",
    "mcp_aws_lambda": "https://logo.clearbit.com/amazon.com",
    "aws_s3": "https://logo.clearbit.com/amazon.com",
    "mcp_aws_s3": "https://logo.clearbit.com/amazon.com",
    "azure_vm": "https://logo.clearbit.com/microsoft.com",
    "mcp_azure_vm": "https://logo.clearbit.com/microsoft.com",
    "azure_blob": "https://logo.clearbit.com/microsoft.com",
    "mcp_azure_blob": "https://logo.clearbit.com/microsoft.com",
    "git": "https://logo.clearbit.com/git-scm.com",
    "mcp_git": "https://logo.clearbit.com/git-scm.com",
    "filesystem": "https://avatars.githubusercontent.com/u/150796347?s=200&v=4",
    "mcp_filesystem": "https://avatars.githubusercontent.com/u/150796347?s=200&v=4",
    "mcp_chromadb": "https://logo.clearbit.com/trychroma.com",
    "mcp_everything": "https://avatars.githubusercontent.com/u/150796347?s=200&v=4",
    "accredible_certificates": "https://logo.clearbit.com/accredible.com",
    "active_campaign": "https://logo.clearbit.com/activecampaign.com",
    "activecampaign": "https://logo.clearbit.com/activecampaign.com",
    "active_trail": "https://logo.clearbit.com/activetrail.com",
    "activetrail": "https://logo.clearbit.com/activetrail.com",
    "addepar": "https://logo.clearbit.com/addepar.com",
    "addressfinder": "https://logo.clearbit.com/addressfinder.com.au",
    "addresszen": "https://logo.clearbit.com/addresszen.com",
    "adrapid": "https://logo.clearbit.com/adrapid.com",
    "adyntel": "https://logo.clearbit.com/adyntel.com",
    "aeroleads": "https://logo.clearbit.com/aeroleads.com",
    "affinda": "https://logo.clearbit.com/affinda.com",
    "affinity": "https://logo.clearbit.com/affinity.co",
    "alloydb": "https://logo.clearbit.com/google.com",
    "mcp_toolbox_alloydb": "https://logo.clearbit.com/google.com",
    "spanner": "https://logo.clearbit.com/google.com",
    "mcp_toolbox_spanner": "https://logo.clearbit.com/google.com",
    "bigquery": "https://logo.clearbit.com/google.com",
    "mcp_toolbox_bigquery": "https://logo.clearbit.com/google.com",
    "bigtable": "https://logo.clearbit.com/google.com",
    "mcp_toolbox_bigtable": "https://logo.clearbit.com/google.com",
    "cloudsql": "https://logo.clearbit.com/google.com",
    "mcp_toolbox_cloudsql": "https://logo.clearbit.com/google.com",
    "looker": "https://logo.clearbit.com/looker.com",
    "mcp_toolbox_looker": "https://logo.clearbit.com/looker.com",
    "dataproc": "https://logo.clearbit.com/google.com",
    "mcp_toolbox_dataproc": "https://logo.clearbit.com/google.com",
    "monitoring": "https://logo.clearbit.com/google.com",
    "mcp_toolbox_monitoring": "https://logo.clearbit.com/google.com",
    "logging": "https://logo.clearbit.com/google.com",
    "mcp_toolbox_logging": "https://logo.clearbit.com/google.com",
    "healthcare": "https://logo.clearbit.com/google.com",
    "mcp_toolbox_healthcare": "https://logo.clearbit.com/google.com",
    "knowledge_catalog": "https://logo.clearbit.com/google.com",
    "mcp_toolbox_knowledge_catalog": "https://logo.clearbit.com/google.com",
    "oceanbase": "https://logo.clearbit.com/oceanbase.com",
    "mcp_toolbox_oceanbase": "https://logo.clearbit.com/oceanbase.com",
    "mssql": "https://logo.clearbit.com/microsoft.com",
    "mcp_toolbox_mssql": "https://logo.clearbit.com/microsoft.com",
    "cockroachdb": "https://logo.clearbit.com/cockroachlabs.com",
    "mcp_toolbox_cockroachdb": "https://logo.clearbit.com/cockroachlabs.com",
    "yugabytedb": "https://logo.clearbit.com/yugabyte.com",
    "mcp_toolbox_yugabytedb": "https://logo.clearbit.com/yugabyte.com",
    "clickhouse": "https://logo.clearbit.com/clickhouse.com",
    "mcp_toolbox_clickhouse": "https://logo.clearbit.com/clickhouse.com",
    "tidb": "https://logo.clearbit.com/pingcap.com",
    "mcp_toolbox_tidb": "https://logo.clearbit.com/pingcap.com",
    "firebird": "https://logo.clearbit.com/firebirdsql.org",
    "mcp_toolbox_firebird": "https://logo.clearbit.com/firebirdsql.org",
    "singlestore": "https://logo.clearbit.com/singlestore.com",
    "mcp_toolbox_singlestore": "https://logo.clearbit.com/singlestore.com",
    "mariadb": "https://logo.clearbit.com/mariadb.org",
    "mcp_toolbox_mariadb": "https://logo.clearbit.com/mariadb.org",
    "couchbase": "https://logo.clearbit.com/couchbase.com",
    "mcp_toolbox_couchbase": "https://logo.clearbit.com/couchbase.com",
    "cassandra": "https://logo.clearbit.com/cassandra.apache.org",
    "mcp_toolbox_cassandra": "https://logo.clearbit.com/cassandra.apache.org",
    "dgraph": "https://logo.clearbit.com/dgraph.io",
    "mcp_toolbox_dgraph": "https://logo.clearbit.com/dgraph.io",
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

  return (
    <div className={`rounded-xl flex items-center justify-center font-bold text-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white ${className}`}>
      {app.name.slice(0, 2).toUpperCase()}
    </div>
  );
};

export default function ConnectAppsPage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [apps, setApps] = useState<AppIntegration[]>(FALLBACK_APPS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // States
  const [activeTab, setActiveTab] = useState("all");
  const [selectedApp, setSelectedApp] = useState<AppIntegration | null>(null);
  const [appTriggers, setAppTriggers] = useState<any[]>([]);
  const [appTools, setAppTools] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [modalTab, setModalTab] = useState("tools");

  // Dynamic Stdio MCP Server Config States
  const [activeTools, setActiveTools] = useState<Tool[]>([]);
  const [command, setCommand] = useState("npx");
  const [argsInput, setArgsInput] = useState("");
  const [isMcpConnecting, setIsMcpConnecting] = useState(false);
  const [mcpError, setMcpError] = useState<string | null>(null);

  const cleanSlug = selectedApp ? selectedApp.id.replace("app-", "").toLowerCase() : "";
  const isMcp = cleanSlug.startsWith("mcp_") || cleanSlug.startsWith("mcp_toolbox_");
  const isServerActive = activeTools.some((t) => t.server === cleanSlug);

  // Synchronize dynamic active app with the Sidebar column 2
  useEffect(() => {
    if (selectedApp) {
      window.dispatchEvent(
        new CustomEvent("active-connect-app", { detail: selectedApp })
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("active-connect-app", { detail: null })
      );
    }
  }, [selectedApp]);

  useEffect(() => {
    const handleSelectApp = (e: any) => {
      const app = e.detail;
      if (app) {
        openAppDetailsModal(app);
      } else {
        setSelectedApp(null);
      }
    };
    window.addEventListener("select-connect-app", handleSelectApp);
    return () => window.removeEventListener("select-connect-app", handleSelectApp);
  }, [activeTools]);

  const fetchActiveTools = async () => {
    try {
      const res = await axios.get(`${API_URL}/mcp/tools/local`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (res.data.success) {
        setActiveTools(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch active tools", err);
    }
  };

  const openAppDetailsModal = async (app: AppIntegration) => {
    setSelectedApp(app);
    setAppTriggers([]);
    setAppTools([]);
    setModalTab("tools");
    setLoadingDetails(true);
    setMcpError(null);

    const slug = app.id.replace("app-", "");
    const isLocalMcp = slug.startsWith("mcp_") || slug.startsWith("mcp_toolbox_");

    if (isLocalMcp) {
      // Ingest Launcher Presets dynamically
      const preset = COMMAND_PRESETS[slug];
      if (preset) {
        setCommand(preset.command);
        setArgsInput(preset.args.join(" "));
      } else {
        setCommand("npx");
        setArgsInput(`-y @modelcontextprotocol/server-${slug.replace("mcp_", "")}`);
      }
      setLoadingDetails(false);
      return;
    }

    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      const [triggersRes, toolsRes] = await Promise.all([
        axios
          .get(`${API_URL}/mcp/composio/triggers/${slug}`, { headers })
          .catch(() => ({ data: { success: false, data: [] } })),
        axios
          .get(`${API_URL}/mcp/composio/tools/${slug}`, { headers })
          .catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (triggersRes.data?.success) setAppTriggers(triggersRes.data.data);
      if (toolsRes.data?.success) setAppTools(toolsRes.data.data);
    } catch (err) {
      console.error("Failed to load app details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const fetchConnections = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        // Sync local active tools first
        await fetchActiveTools();

        const res = await axios.get(`${API_URL}/mcp/composio/connections`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const connectedIds = new Set(
            res.data.data.map((c: any) =>
              (c.appId || c.toolkit || c.appName || "").toLowerCase(),
            ),
          );

          setApps((prev) => {
            const nextApps = prev.map((app) => {
              const slug = app.id.replace("app-", "").toLowerCase();

              // For local/remote MCP Servers, determine status dynamically based on registered tools
              if (slug.startsWith("mcp_") || slug.startsWith("mcp_toolbox_")) {
                const active = activeTools.some((t) => t.server === slug);
                return { ...app, status: active ? "connected" : "disconnected" };
              }

              if (connectedIds.has(slug)) {
                return { ...app, status: "connected" };
              }
              if (app.status === "connecting") return app;

              return { ...app, status: "disconnected" };
            });
            window.dispatchEvent(new CustomEvent("sync-connect-apps"));
            return nextApps;
          });
        }
      } catch (err) {
        console.error("Failed to fetch connections", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();

    const isConnecting = apps.some((a) => a.status === "connecting");
    if (isConnecting) {
      pollInterval = setInterval(fetchConnections, 3000);
    }

    return () => clearInterval(pollInterval);
  }, [apps.some((a) => a.status === "connecting"), accessToken, activeTools.length]);

  const handleConnect = async (id: string) => {
    setApps((prev) => {
      const next = prev.map((app) =>
        app.id === id ? { ...app, status: "connecting" } : app,
      );
      window.dispatchEvent(new CustomEvent("sync-connect-apps"));
      return next;
    });

    try {
      const slug = id.replace("app-", "");
      const res = await axios.post(
        `${API_URL}/mcp/composio/connect`,
        { appName: slug },
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        },
      );

      if (res.data && res.data.success && res.data.data?.redirectUrl) {
        window.open(res.data.data.redirectUrl, "_blank");
        window.dispatchEvent(new CustomEvent("sync-connect-apps"));
      } else {
        throw new Error("No redirect URL returned from backend");
      }
    } catch (err) {
      console.error("Connection failed:", err);
      setApps((prev) => {
        const next = prev.map((app) =>
          app.id === id ? { ...app, status: "disconnected" } : app,
        );
        window.dispatchEvent(new CustomEvent("sync-connect-apps"));
        return next;
      });
    }
  };

  const handleLaunchMcpServer = async () => {
    if (!selectedApp) return;
    setIsMcpConnecting(true);
    setMcpError(null);
    const slug = selectedApp.id.replace("app-", "");
    const parsedArgs = argsInput.trim() ? argsInput.split(/\s+/) : [];

    try {
      await axios.post(
        `${API_URL}/mcp/connect`,
        {
          name: slug,
          command,
          args: parsedArgs
        },
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );
      await fetchActiveTools();
      // Sync local status mapping
      setApps((prev) =>
        prev.map((app) =>
          app.id === selectedApp.id ? { ...app, status: "connected" } : app
        )
      );
      window.dispatchEvent(new CustomEvent("sync-connect-apps"));
    } catch (err: any) {
      setMcpError(err.response?.data?.message || "Launch failed. Ensure paths and commands are accurate.");
    } finally {
      setIsMcpConnecting(false);
    }
  };

  const handleDisconnectMcpServer = async () => {
    if (!selectedApp) return;
    setIsMcpConnecting(true);
    const slug = selectedApp.id.replace("app-", "");

    try {
      // Direct REST dynamic transport disconnect triggers
      await axios.post(
        `${API_URL}/mcp/composio/disconnect`,
        { appName: slug },
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );
      await fetchActiveTools();
      setApps((prev) =>
        prev.map((app) =>
          app.id === selectedApp.id ? { ...app, status: "disconnected" } : app
        )
      );
      window.dispatchEvent(new CustomEvent("sync-connect-apps"));
    } catch (err) {
      console.error("Failed to disconnect server", err);
    } finally {
      setIsMcpConnecting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    setApps((prev) => {
      const next = prev.map((app) =>
        app.id === id ? { ...app, status: "connecting" } : app,
      );
      window.dispatchEvent(new CustomEvent("sync-connect-apps"));
      return next;
    });
    try {
      const slug = id.replace("app-", "");

      await axios.post(
        `${API_URL}/mcp/composio/disconnect`,
        { appName: slug },
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        },
      );
      setApps((prev) => {
        const next = prev.map((app) =>
          app.id === id ? { ...app, status: "disconnected" } : app,
        );
        window.dispatchEvent(new CustomEvent("sync-connect-apps"));
        return next;
      });
    } catch (err) {
      console.error("Disconnect failed:", err);
      setApps((prev) => {
        const next = prev.map((app) =>
          app.id === id ? { ...app, status: "connected" } : app,
        );
        window.dispatchEvent(new CustomEvent("sync-connect-apps"));
        return next;
      });
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "connected" && app.status === "connected");

    return matchesSearch && matchesTab;
  });

  // Extract tools belonging to the active MCP server
  const activeMcpTools = activeTools.filter((t) => t.server === cleanSlug);

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-default-50 dark:bg-background flex flex-col h-full font-sans w-full">
        {/* Standardized Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-10 relative w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900 flex items-center gap-2">
                Integrations
              </h1>
            </div>
          </div>
        </div>

        {/* Master-Detail Split Screen Container */}
        <div className="flex flex-1 w-full overflow-hidden bg-white dark:bg-[#0A0A0A]">
          {/* Right Column: Center Presentation Area */}
          <div className="flex-1 bg-white dark:bg-[#0A0A0A] flex flex-col h-full overflow-y-auto relative">
            <AnimatePresence mode="wait">
              {!selectedApp ? (
                /* Idle Hub View */
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center gap-8 min-h-full"
                >
                  <div className="flex flex-col items-center gap-4">
                    {/* Blue Spars Circle Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 text-white bg-gradient-to-br from-primary to-indigo-600 shrink-0">
                      <Icon icon="solar:stars-line-bold" className="text-3xl" />
                    </div>

                    <h2 className="text-2xl font-bold text-default-900 tracking-tight">
                      Isolated Action Hub
                    </h2>
                    <p className="text-sm text-default-500 max-w-md leading-relaxed">
                      Connect and prompt individual web applications securely. Select an application in the sidebar to configure authentication and interact with its tools in a focused, zero-hallucination agent session.
                    </p>
                  </div>

                  {/* Dual Bottom Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
                    <div className="p-5 border border-default-200 dark:border-default-100/50 rounded-2xl flex flex-col gap-2.5 bg-[#f4f4f5]/30 dark:bg-default-50/5 hover:border-default-300 dark:hover:border-default-100 transition-all">
                      <div className="flex items-center gap-2 text-primary">
                        <Icon icon="solar:shield-keyhole-bold" className="text-xl" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          100% Isolated Scoping
                        </span>
                      </div>
                      <p className="text-xs text-default-500 leading-normal">
                        Tools are locked dynamically to ensure strict deterministic execution.
                      </p>
                    </div>

                    <div className="p-5 border border-default-200 dark:border-default-100/50 rounded-2xl flex flex-col gap-2.5 bg-[#f4f4f5]/30 dark:bg-default-50/5 hover:border-default-300 dark:hover:border-default-100 transition-all">
                      <div className="flex items-center gap-2 text-primary">
                        <Icon icon="solar:key-bold" className="text-xl" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Composio MCP Auth
                        </span>
                      </div>
                      <p className="text-xs text-default-500 leading-normal">
                        Universal OAuth management handles complex authentications seamlessly.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : isMcp ? (
                /* MCP Server Details Panel (Studio Presets + Stdio Transport Configs) */
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col items-center justify-start p-8 max-w-xl mx-auto w-full gap-6 min-h-full py-12"
                >
                  {mcpError && (
                    <AlertWrapper className="w-full" variant="danger">
                      <div className="flex items-center gap-2 text-xs">
                        <Icon icon="solar:danger-triangle-bold" />
                        <span>{mcpError}</span>
                      </div>
                    </AlertWrapper>
                  )}

                  {/* Connect Server Card Wrapper */}
                  <div className="w-full p-8 border border-default-200 dark:border-default-100/50 bg-[#F9F9FB]/50 dark:bg-[#0E0E10]/30 rounded-3xl shadow-sm flex flex-col items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-black border border-default-200 dark:border-default-100/50 shadow-sm shrink-0 overflow-hidden">
                      <AppIcon app={selectedApp} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex flex-col gap-1 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <h2 className="text-xl font-bold text-default-900">
                          {selectedApp.name}
                        </h2>
                        {isServerActive && (
                          <Chip size="sm" color="success" variant="flat" className="h-5 text-[10px] font-semibold">
                            Active
                          </Chip>
                        )}
                      </div>
                      <p className="text-xs text-default-400 font-mono">
                        source: {cleanSlug}
                      </p>
                      <p className="text-xs text-default-500 leading-relaxed px-2 mt-2">
                        {selectedApp.description}
                      </p>
                    </div>

                    {/* Stdio Transport Parameters input fields */}
                    <div className="w-full flex flex-col gap-3">
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
                          placeholder="-y @modelcontextprotocol/server-sqlite"
                          value={argsInput}
                          variant="bordered"
                          onValueChange={setArgsInput}
                        />
                      </div>

                      {isServerActive ? (
                        <button
                          type="button"
                          disabled={isMcpConnecting}
                          onClick={handleDisconnectMcpServer}
                          className="w-full font-bold text-sm h-12 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-danger/20"
                        >
                          {isMcpConnecting ? (
                            <Icon icon="line-md:loading-twotone-loop" className="text-base animate-spin" />
                          ) : (
                            <Icon icon="solar:stop-circle-bold" className="text-base" />
                          )}
                          Stop MCP Server
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isMcpConnecting}
                          onClick={handleLaunchMcpServer}
                          className="w-full font-bold text-sm h-12 rounded-xl bg-primary text-white hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10"
                        >
                          {isMcpConnecting ? (
                            <Icon icon="line-md:loading-twotone-loop" className="text-base animate-spin" />
                          ) : (
                            <Icon icon="solar:play-circle-bold" className="text-base" />
                          )}
                          Launch MCP Server
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-default-400 font-medium">
                      <Icon icon="solar:server-square-bold" className="text-xs text-primary" />
                      Ingested seamlessly via secure Stdio pipeline
                    </div>
                  </div>

                  {/* Ingested Server Tools Tab list */}
                  <div className="w-full flex flex-col gap-4 mt-2">
                    <div className="flex border-b border-default-200 dark:border-default-100/50">
                      <button
                        type="button"
                        className="pb-2.5 text-xs font-bold border-b-2 border-primary text-primary px-1"
                      >
                        Ingested Capabilities ({activeMcpTools.length})
                      </button>
                    </div>

                    <div className="w-full">
                      {activeMcpTools.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-default-200 dark:border-default-100 rounded-2xl">
                          <span className="text-xs text-default-400 italic">
                            {isServerActive 
                              ? "No tools registered for this active server."
                              : "Launch the MCP server to dynamically ingest its standard capabilities."}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {activeMcpTools.map((tool) => (
                            <div
                              key={tool.name}
                              className="flex flex-col p-3.5 rounded-2xl border border-default-200 dark:border-default-100 bg-[#F9F9FB]/30 dark:bg-default-50/5 hover:border-primary/20 transition-all"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="text-primary text-base shrink-0" icon="solar:bolt-circle-bold" />
                                <p className="font-bold text-xs text-default-800 truncate">{tool.name}</p>
                              </div>
                              <p className="text-[11px] text-default-500 leading-normal pl-6">
                                {tool.description}
                              </p>
                              {tool.inputSchema?.required && (
                                <div className="flex gap-1.5 flex-wrap mt-2 pl-6">
                                  {tool.inputSchema.required.map((req: string) => (
                                    <Chip key={req} size="sm" color="danger" variant="flat" className="h-4 text-[8px] px-1.5 font-mono">
                                      {req}*
                                    </Chip>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Selected App Connection details & Capabilities */
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col items-center justify-start p-8 max-w-xl mx-auto w-full gap-6 min-h-full py-12"
                >
                  {/* Connect App Card Wrapper */}
                  <div className="w-full p-8 border border-default-200 dark:border-default-100/50 bg-[#F9F9FB]/50 dark:bg-[#0E0E10]/30 rounded-3xl shadow-sm flex flex-col items-center text-center gap-6">
                    {/* App logo inside custom box */}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-black border border-default-200 dark:border-default-100/50 shadow-sm shrink-0 overflow-hidden">
                      <AppIcon app={selectedApp} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-xl font-bold text-default-900">
                        Connect {selectedApp.name}
                      </h2>
                      <p className="text-xs text-default-500 leading-relaxed px-2">
                        Integrate {selectedApp.name} to seamlessly execute automated workflows, synchronize data, and orchestrate {selectedApp.name} actions directly within Alti.
                      </p>
                    </div>

                    {/* Authorize button triggers */}
                    <div className="w-full">
                      {selectedApp.status === "disconnected" ? (
                        <button
                          type="button"
                          onClick={() => handleConnect(selectedApp.id)}
                          className="w-full font-bold text-sm h-12 rounded-xl bg-primary text-white hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10"
                        >
                          <Icon icon="solar:key-bold" className="text-base" />
                          Authorize Connection
                        </button>
                      ) : selectedApp.status === "connecting" ? (
                        <button
                          disabled
                          type="button"
                          className="w-full font-bold text-sm h-12 rounded-xl bg-default-100 dark:bg-default-200 text-default-400 flex items-center justify-center gap-2 cursor-wait"
                        >
                          <Icon icon="line-md:loading-twotone-loop" className="text-base" />
                          Authenticating Connection...
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDisconnect(selectedApp.id)}
                          className="w-full font-bold text-sm h-12 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-danger/20"
                        >
                          Disconnect Connection
                        </button>
                      )}
                    </div>

                    {/* Footnote */}
                    <div className="flex items-center gap-1.5 text-[10px] text-default-400 font-medium">
                      <Icon icon="solar:lock-bold" className="text-xs" />
                      Authenticated securely via Composio protocol
                    </div>
                  </div>

                  {/* Capabilities Accordion Tab Views inside the details page */}
                  <div className="w-full flex flex-col gap-4 mt-2">
                    <div className="flex border-b border-default-200 dark:border-default-100/50">
                      <button
                        type="button"
                        className={`pb-2.5 text-xs font-bold border-b-2 transition-colors px-1 ${
                          modalTab === "tools"
                            ? "border-primary text-primary"
                            : "border-transparent text-default-400 hover:text-default-700"
                        }`}
                        onClick={() => setModalTab("tools")}
                      >
                        Capabilities (Tools)
                      </button>
                      <button
                        type="button"
                        className={`ml-6 pb-2.5 text-xs font-bold border-b-2 transition-colors px-1 ${
                          modalTab === "triggers"
                            ? "border-primary text-primary"
                            : "border-transparent text-default-400 hover:text-default-700"
                        }`}
                        onClick={() => setModalTab("triggers")}
                      >
                        Webhooks (Triggers)
                      </button>
                    </div>

                    {/* Tab contents list */}
                    <div className="w-full">
                      {loadingDetails ? (
                        <div className="flex flex-col items-center py-8 gap-3">
                          <Icon className="text-xl text-primary animate-spin" icon="line-md:loading-twotone-loop" />
                          <span className="text-[11px] text-default-400">Syncing with Composio...</span>
                        </div>
                      ) : modalTab === "tools" ? (
                        appTools.length === 0 ? (
                          <div className="text-center py-10 border border-dashed border-default-200 dark:border-default-100 rounded-2xl">
                            <span className="text-xs text-default-400">No capabilities found</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {appTools.map((tool) => (
                              <div
                                key={tool.id}
                                className="flex flex-col p-3.5 rounded-2xl border border-default-200 dark:border-default-100 bg-[#F9F9FB]/30 dark:bg-default-50/5 hover:border-primary/20 transition-all"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Icon className="text-primary text-base shrink-0" icon="solar:bolt-circle-bold" />
                                  <p className="font-bold text-xs text-default-800 truncate">{tool.name}</p>
                                </div>
                                <p className="text-[11px] text-default-500 leading-normal pl-6">
                                  {tool.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        )
                      ) : appTriggers.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-default-200 dark:border-default-100 rounded-2xl">
                          <span className="text-xs text-default-400">No webhooks found</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {appTriggers.map((trigger) => (
                            <div
                              key={trigger.id}
                              className="flex items-center justify-between p-3.5 rounded-2xl border border-default-200 dark:border-default-100 bg-[#F9F9FB]/30 dark:bg-default-50/5 hover:border-primary/20 transition-all"
                            >
                              <div className="min-w-0 pr-3">
                                <p className="font-bold text-xs text-default-800 truncate mb-0.5">{trigger.name}</p>
                                <p className="text-[9px] text-default-400 font-mono truncate">{trigger.id}</p>
                              </div>
                              <button className="px-3 h-7 bg-default-100 hover:bg-success hover:text-white rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider shrink-0">
                                Enable
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
