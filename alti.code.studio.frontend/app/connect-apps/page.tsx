"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Plus, Server } from "lucide-react";
import { Input, Chip, cn } from "@heroui/react";
import { useSearchParams } from "next/navigation";

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

// Command Preset Registry for MCP & Azure MCP Toolbox
const COMMAND_PRESETS: Record<string, { command: string; args: string[] }> = {
  mcp_sqlite: {
    command: "npx",
    args: [
      "-y",
      "@modelcontextprotocol/server-sqlite",
      "--file",
      "database.sqlite",
    ],
  },
  mcp_github: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
  },
  mcp_open_seo: {
    command: "npx",
    args: ["-y", "open-seo"],
  },
  mcp_opencode: {
    command: "opencode",
    args: ["serve", "--port", "4096", "--hostname", "127.0.0.1"],
  },
  mcp_openspec: {
    command: "npx",
    args: ["-y", "@fission-ai/openspec@latest", "init"],
  },
  mcp_website_cloner: {
    command: "git",
    args: ["clone", "https://github.com/JCodesMore/ai-website-cloner-template.git"],
  },
  mcp_fetch: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-fetch"],
  },
  mcp_postgresql: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres"],
  },
  mcp_puppeteer: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"],
  },
  mcp_brave_search: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
  },
  mcp_everything: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-everything"],
  },
  mcp_memory: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"],
  },
  mcp_sequential_thinking: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
  },
  mcp_time: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-time"],
  },
  mcp_git: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-git"],
  },
  mcp_filesystem: {
    command: "npx",
    args: [
      "-y",
      "@modelcontextprotocol/server-filesystem",
      "/Users/michaelmeram/workspace/alti.code.studio",
    ],
  },
  mcp_gitlab: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-gitlab"],
  },
  mcp_evernote: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-evernote"],
  },
  mcp_everart: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-everart"],
  },
  mcp_slack: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
  },
  mcp_sentry: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sentry"],
  },
  mcp_redis: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-redis"],
  },

};

const FALLBACK_APPS: AppIntegration[] = SAAS_MOCKS.map(
  (mockApp) => ({
    id: `app-${mockApp.slug}`,
    name: mockApp.name,
    description: `Seamlessly connect and automate workflows directly with ${mockApp.name}.`,
    icon: mockApp.icon,
    color: "bg-white border border-gray-200",
    status: "disconnected" as const,
    type: "official" as const,
  }),
).sort((a, b) => a.name.localeCompare(b.name));


const AppIcon = ({
  app,
  className = "w-8 h-8",
}: {
  app: AppIntegration;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);

  if (app.icon.startsWith("solar:") || app.icon.startsWith("mdi:")) {
    return (
      <div
        className={cn(
          "rounded-xl flex items-center justify-center bg-gray-55/10 shrink-0",
          className,
        )}
      >
        <Icon icon={app.icon} className="size-5 text-gray-600" />
      </div>
    );
  }

  if (app.id === "custom-mcp-launcher") {
    return (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center bg-primary/10 text-primary rounded-xl",
          className,
        )}
      >
        <Plus className="size-4 shrink-0" />
      </div>
    );
  }

  const slug = app.id.replace("app-", "").toLowerCase();
  let cleanSlug = slug.startsWith("_") ? slug.slice(1) : slug;

  if (cleanSlug.startsWith("mcp_")) {
    cleanSlug = cleanSlug.slice(4);
  }

  const localSVGRegistry: Record<string, React.ReactNode> = {

    ansible: (
      <svg
        className="w-full h-full p-0.5 object-contain"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Ansible</title>
        <path
          d="M10.617 11.473l4.686 3.695-3.102-7.662zM12 0C5.371 0 0 5.371 0 12s5.371 12 12 12 12-5.371 12-12S18.629 0 12 0zm5.797 17.305c-.011.471-.403.842-.875.83-.236 0-.416-.09-.664-.293l-6.19-5-2.079 5.203H6.191L11.438 5.44c.124-.314.427-.52.764-.506.326-.014.63.189.742.506l4.774 11.494c.045.111.08.234.08.348-.001.009-.001.009-.001.023z"
          fill="#EE0000"
        />
      </svg>
    ),
    anthropic: (
      <svg
        className="w-full h-full p-0.5 object-contain"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Anthropic</title>
        <path
          d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"
          fill="#191919"
        />
      </svg>
    ),
    apollo_graphql: (
      <svg
        className="w-full h-full p-0.5 object-contain"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Apollo GraphQL</title>
        <path
          d="M12,0C5.372,0 0,5.373 0,12 0,18.628 5.372,24 12,24 18.627,24 24,18.628 24,12A12.014,12.014 0 0 0 23.527,8.657 0.6,0.6 0 0 0 22.4,9.066H22.398C22.663,10.009 22.8,10.994 22.8,12A10.73,10.73 0 0 1 19.637,19.637 10.729,10.729 0 0 1 12,22.8 10.73,10.73 0 0 1 4.363,19.637 10.728,10.728 0 0 1 1.2,12 10.73,10.73 0 0 1 4.363,4.363 10.728,10.728 0 0 1 12,1.2C14.576,1.2 17.013,2.096 18.958,3.74A1.466,1.466 0 1 0 19.82,2.9 11.953,11.953 0 0 0 12,0ZM10.56,5.88 6.36,16.782H8.99L9.677,14.934H13.646L12.927,12.892H10.314L12.014,8.201 15.038,16.781H17.669L13.47,5.88Z"
          fill="#311C87"
        />
      </svg>
    ),
    argocd: (
      <svg
        className="w-full h-full p-0.5 object-contain"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>ArgoCD</title>
        <path
          d="M12.581 0c.436.037.871.1 1.299.186 1.679.383 3.121 1.213 4.382 2.365 1.161 1.06 1.917 2.372 2.335 3.881.089.321.216.56.586.624.205.035.238.245.239.43.003.646.002 1.294.002 1.94l-.002 1.21c-.001.356-.116.479-.466.474-.211-.003-.293.119-.344.291-.146.489-.33.966-.552 1.426-.818 1.682-2.084 2.938-3.688 3.87-.077.045-.155.088-.233.131-.252.137-.258.146-.155.415.114.299.358.529.664.625.269.096.553.134.827.21a.672.672 0 0 1 .236.094c-.066.082-.156.067-.231.082-.36.073-.713.184-1.086.17a1.275 1.275 0 0 1-.438-.064c-.114-.045-.152-.006-.176.109a5.354 5.354 0 0 0-.084.92c-.015.617-.071 1.23-.112 1.844-.042.598-.018.651.558.842.281.094.563.187.842.286.069.024.15.038.192.117-.04.057-.098.035-.146.035-.493.003-.985.005-1.478.001-.524-.005-.806-.282-.845-.803-.055-.762-.12-1.524-.182-2.286a.947.947 0 0 0-.026-.12c-.079.455-.065.879-.084 1.298-.023.528-.008 1.057-.007 1.584 0 .27.086.388.335.483.359.135.711.295 1.114.262.141-.012.276.062.402.129.032.017.073.033.069.073-.004.043-.049.047-.084.045-.657-.019-1.317.065-1.972-.028-.323-.046-.533-.236-.631-.552-.094-.303-.114-.617-.137-.93-.046-.626-.078-1.253-.116-1.88a.222.222 0 0 0-.061-.171.282.282 0 0 0-.031.193c-.002.956-.002 1.911-.001 2.866 0 .388.123.575.494.708.481.172.976.298 1.47.423.11.028.225.047.242.192h-1.852c-.051-.01-.103-.022-.155-.03-.701-.1-1.001-.372-1.143-1.042l-.067-.331-.226-1.103c-.069.12-.118.25-.144.386-.083.399-.151.802-.243 1.2-.113.493-.444.763-.932.857l-.33.063H8.558c.057-.171.216-.185.355-.221.476-.127.96-.223 1.417-.409a.603.603 0 0 0 .397-.521c.058-.435.002-.865-.013-1.296a1.528 1.528 0 0 0-.078-.315.405.405 0 0 0-.071.207c-.026.296-.049.591-.075.886-.038.432-.273.716-.679.81a1.702 1.702 0 0 1-.37.045c-.557.003-1.115-.001-1.673-.005-.048 0-.109.019-.148-.065.178-.103.377-.168.582-.187a5.67 5.67 0 0 0 .939-.193c.42-.114.522-.249.512-.687-.023-.931-.091-1.86-.069-2.791.004-.184.001-.368.001-.551a2.387 2.387 0 0 0-.05.385 40.299 40.299 0 0 1-.186 2.623c-.052.513-.296.748-.804.805-.446.051-.889.002-1.332-.02-.108-.006-.234.012-.339-.064.043-.066.106-.07.16-.087.362-.115.725-.224 1.086-.344.246-.081.35-.235.355-.492a2.241 2.241 0 0 0-.003-.232 45.315 45.315 0 0 1-.105-2.149 5.487 5.487 0 0 0-.035-.478c-.024-.188-.131-.287-.295-.258-.505.092-.99-.006-1.473-.139-.059-.016-.134-.007-.178-.088a.986.986 0 0 1 .285-.09c.255-.052.507-.121.753-.208.312-.112.564-.347.695-.651.089-.203.056-.317-.112-.398-1.418-.683-2.512-1.73-3.391-3.017a8.152 8.152 0 0 1-1.123-2.447c-.067-.246-.156-.3-.383-.26-.306.053-.401.006-.535-.273v-3.49c.144-.303.205-.341.534-.329.235.01.247-.004.309-.242.396-1.508 1.082-2.861 2.171-3.988C6.9 1.42 8.523.631 10.34.203c.456-.108.922-.15 1.387-.203h.854Zm7.974 8.948a7.34 7.34 0 0 0-.048-.938 8.353 8.353 0 0 0-.099-.65c-.598-2.964-2.344-5.02-5.051-6.268-1.553-.715-3.21-.835-4.878-.511-3.248.633-5.396 2.583-6.539 5.652-.436 1.173-.495 2.406-.37 3.65.087.935.339 1.846.745 2.694.585 1.213 1.444 2.207 2.477 3.058.343.286.719.528 1.121.719.235.111.247.105.245-.146.006-.16.003-.32-.009-.48-.125-1.02-.142-2.045-.169-3.069a.392.392 0 0 0-.184-.353c-.385-.268-.713-.592-.921-1.019-.474-.97-.372-2.361.813-3.215.136-.097.217-.19.198-.373a1.724 1.724 0 0 1 .031-.442c.177-1.187.748-2.138 1.722-2.84.68-.492 1.442-.772 2.286-.782.483-.007.953.11 1.414.244 1.609.467 2.846 2.07 2.845 3.697a.64.64 0 0 0 .268.565c.463.371.821.83.943 1.426.22 1.077-.083 1.982-.979 2.634-.266.194-.347.406-.333.698.002.047 0 .095-.002.142l-.062 1.439c-.025.586-.138 1.165-.117 1.754.008.223.006.226.201.128a7.46 7.46 0 0 0 2.393-1.903c1.32-1.577 2.074-3.372 2.059-5.511ZM9.117 12.102c1.489.021 2.443-1.578 1.716-2.879a1.937 1.937 0 0 0-1.699-.991c-1.094-.004-1.954.822-1.958 1.881-.005 1.148.813 1.985 1.941 1.989Zm5.794 0c1.101.002 1.935-.823 1.935-1.917 0-1.091-.846-1.949-1.92-1.947-1.064.003-1.94.866-1.943 1.915-.003 1.105.831 1.948 1.928 1.949Zm-1.472 1.937c-.208.128-.407.277-.63.384-.536.257-1.063.257-1.579-.048-.158-.094-.308-.201-.464-.298-.047-.028-.092-.103-.15-.062-.044.03-.01.1-.001.151.037.179.064.362.082.544.027.565.293.992.742 1.31a.984.984 0 0 0 .791.186c.565-.119 1.025-.614 1.124-1.218.043-.266.005-.544.109-.803a.133.133 0 0 0-.024-.146Zm-8.78-4.92c-.012-1.102.143-2.055.54-2.961.633-1.443 1.642-2.553 2.98-3.374a.378.378 0 0 1 .459.067c.06.06.036.118.01.178a1.09 1.09 0 0 1-.48.51c-1.079.639-1.829 1.571-2.357 2.688a6.325 6.325 0 0 0-.618 2.986c.055 1.309.439 2.516 1.213 3.588.088.104.148.23.173.365.01.08.059.168-.031.228a.312.312 0 0 1-.288.041.502.502 0 0 1-.234-.185c-.72-.979-1.193-2.056-1.331-3.273-.036-.326-.004-.653-.036-.858ZM8.94 2.34a.373.373 0 0 1 .378-.382c.211.001.409.226.416.473.004.138-.309.39-.476.386-.189-.005-.318-.2-.318-.477Zm-.465 7.48a.609.609 0 0 1 .586-.631c.38-.003.671.271.675.633.004.356-.27.622-.639.621-.38-.002-.621-.241-.622-.623Zm6.496.623c-.381-.002-.625-.255-.621-.646a.635.635 0 0 1 .596-.613.656.656 0 0 1 .669.643c.001.354-.275.618-.644.616Z"
          fill="#EF6A39"
        />
      </svg>
    ),
  };

  if (localSVGRegistry[cleanSlug]) {
    return (
      <div
        className={cn(
          "rounded-xl flex items-center justify-center bg-transparent shrink-0",
          className,
        )}
      >
        {localSVGRegistry[cleanSlug]}
      </div>
    );
  }

  const localLogoMappings: Record<string, string> = {
    github: "github.png",
    slack: "slack.svg",
    jira: "jira.svg",
    notion: "notion.svg",
    linear: "linear.png",
    discord: "discord.svg",
    gmail: "gmail.svg",
    git: "git.svg",
    filesystem: "filesystem.svg",
    supabase: "supabase.jpeg",
    posthog: "posthog.svg",
    sentry: "sentry.svg",
    docker: "docker-icon.png",
    kubernetes: "kubernetes.png",
    azure: "azure.svg",
  };

  const simpleIconsMapping: Record<string, string> = {
    apollo_graphql: "apollographql",
    bun_runtime: "bun",
    deno_runtime: "deno",
    prisma_orm: "prisma",
    hasura_graphql: "hasura",
    stripe_dev: "stripe",
    teams: "microsoftteams",
    nextjs: "nextdotjs",
    springboot: "springboot",
    brave_search: "brave",
    argocd: "argo",
    ansible: "ansible",
    anthropic: "anthropic",
  };

  const getUrlsToTry = () => {
    const urls: string[] = [];
    const addUrl = (url: string) => {
      if (url && !urls.includes(url)) urls.push(url);
    };

    // 1. Try explicit app.logo if provided
    if (app.logo) {
      addUrl(app.logo);
    }

    // 2. Try local mapped asset (offline-first!)
    const localFile = localLogoMappings[cleanSlug] || localLogoMappings[slug];

    if (localFile) {
      addUrl(`/assets/apps-logos/${localFile}`);
    }

    // 3. Try official jsDelivr/unpkg Simple Icons npm CDN (highly CSP-compliant and fast)
    const simpleIconBrand =
      simpleIconsMapping[cleanSlug] || cleanSlug.replace(/_/g, "");

    addUrl(
      `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${simpleIconBrand}.svg`,
    );
    addUrl(
      `https://unpkg.com/simple-icons@latest/icons/${simpleIconBrand}.svg`,
    );
    addUrl(`https://cdn.simpleicons.org/${simpleIconBrand}`);

    // 5. Try Clearbit Logo API
    addUrl(`https://logo.clearbit.com/${simpleIconBrand}.com`);

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

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-blue-500 to-indigo-600 text-white",
      "from-purple-500 to-pink-600 text-white",
      "from-emerald-500 to-teal-600 text-white",
      "from-amber-500 to-orange-600 text-white",
      "from-rose-500 to-red-600 text-white",
      "from-cyan-500 to-blue-600 text-white",
    ];
    let hash = 0;

    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;

    return colors[index];
  };

  // Render the image if we haven't exhausted our fallback options
  if (!imageError && currentLogoUrl) {
    return (
      <img
        alt={`${app.name} logo`}
        className={cn(className, "object-contain p-0.5 rounded-xl shrink-0")}
        src={currentLogoUrl}
        onError={handleImageError}
      />
    );
  }

  // Fallback 1: System custom server icon
  if (app.type === "custom") {
    return (
      <div
        className={cn(
          "rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shrink-0",
          className,
        )}
      >
        <Server className="size-4 text-white shrink-0" />
      </div>
    );
  }

  // Fallback 2: Ultimate bulletproof initials box (strictly bypasses broken Iconify components to ensure no blank circles!)
  const initials = app.name.slice(0, 2).toUpperCase();
  const gradientClass = getAvatarColor(app.name);

  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center font-bold text-xs bg-gradient-to-br tracking-tight shrink-0",
        gradientClass,
        className,
      )}
    >
      {initials}
    </div>
  );
};

function ConnectAppsContent() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [apps, setApps] = useState<AppIntegration[]>(FALLBACK_APPS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const searchParams = useSearchParams();

  // States
  const [notification, setNotification] = useState<{ type: "success" | "danger"; message: string } | null>(null);

  useEffect(() => {
    const status = searchParams.get("status");
    const provider = searchParams.get("provider");
    const msg = searchParams.get("message");

    if (status === "success") {
      setNotification({
        type: "success",
        message: `Successfully connected to ${provider ? provider.toUpperCase() : "integration"}!`,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === "error") {
      setNotification({
        type: "danger",
        message: msg || "Failed to authenticate connection. Please try again.",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState("all");
  const [selectedApp, setSelectedApp] = useState<AppIntegration | null>(null);
  const [appTriggers, setAppTriggers] = useState<any[]>([]);
  const [appTools, setAppTools] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [modalTab, setModalTab] = useState("tools");

  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Dynamic Stdio MCP Server Config States
  const [activeTools, setActiveTools] = useState<Tool[]>([]);
  const [command, setCommand] = useState("npx");
  const [argsInput, setArgsInput] = useState("");
  const [isMcpConnecting, setIsMcpConnecting] = useState(false);
  const [mcpError, setMcpError] = useState<string | null>(null);

  // Custom MCP Form States
  const [customServersList, setCustomServersList] = useState<any[]>([]);
  const [mcpTitle, setMcpTitle] = useState("");
  const [mcpName, setMcpName] = useState("");
  const [mcpDescription, setMcpDescription] = useState("");
  const [envInput, setEnvInput] = useState("");

  const cleanSlug = selectedApp
    ? selectedApp.id.replace("app-", "").toLowerCase()
    : "";
  const isOauthProvider = ["mcp_github", "mcp_gitlab", "mcp_slack", "mcp_jira"].includes(cleanSlug);
  const isMcp =
    (cleanSlug.startsWith("mcp_") && !isOauthProvider) ||
    selectedApp?.type === "custom";
  const isServerActive = activeTools.some((t) => t.server === cleanSlug);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Synchronize dynamic active app with the Sidebar column 2
  useEffect(() => {
    if (selectedApp) {
      window.dispatchEvent(
        new CustomEvent("active-connect-app", { detail: selectedApp }),
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("active-connect-app", { detail: null }),
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

    return () =>
      window.removeEventListener("select-connect-app", handleSelectApp);
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

    if (app.id === "custom-mcp-launcher") {
      setMcpName("");
      setMcpTitle("");
      setMcpDescription("");
      setCommand("npx");
      setArgsInput("");
      setEnvInput("");
      setLoadingDetails(false);

      return;
    }

    if (app.type === "custom") {
      const customConfig = customServersList.find((s) => s.name === slug);

      if (customConfig) {
        setMcpName(customConfig.name);
        setMcpTitle(customConfig.title);
        setMcpDescription(customConfig.description);
        setCommand(customConfig.command);
        setArgsInput(customConfig.args.join(" "));
        const envStr = Object.entries(customConfig.env || {})
          .map(([k, v]) => `${k}=${v}`)
          .join("\n");

        setEnvInput(envStr);
      }
      setLoadingDetails(false);

      return;
    }

    const isLocalMcp =
      slug.startsWith("mcp_");

    if (isLocalMcp) {
      // Ingest Launcher Presets dynamically
      const preset = COMMAND_PRESETS[slug];

      if (preset) {
        setCommand(preset.command);
        setArgsInput(preset.args.join(" "));
      } else {
        setCommand("npx");
        setArgsInput(
          `-y @modelcontextprotocol/server-${slug.replace("mcp_", "")}`,
        );
      }
      setLoadingDetails(false);

      return;
    }

    setLoadingDetails(false);
  };

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const fetchConnections = async () => {
      if (!accessToken) {
        setApps(FALLBACK_APPS);
        setLoading(false);

        return;
      }

      try {
        // Sync local active tools first
        await fetchActiveTools();

        // Fetch custom registered MCP servers
        let customServers: any[] = [];
        let activeOauthProviders: string[] = [];

        try {
          const [customRes, activeRes] = await Promise.all([
            axios.get(`${API_URL}/mcp/custom`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            }),
            axios.get(`${API_URL}/integrations/active`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            }),
          ]);

          if (customRes.data && customRes.data.success) {
            customServers = customRes.data.data || [];
            setCustomServersList(customServers);
          }
          if (activeRes.data && activeRes.data.success) {
            activeOauthProviders = (activeRes.data.data || []).map((conn: any) => conn.provider);
          }
        } catch (e) {
          console.error("Failed to fetch custom servers or active OAuth connections", e);
        }

        // Custom MCP Apps
        const customAppsMapped = customServers.map((s: any) => ({
          id: `app-${s.name}`,
          name: s.title,
          description: s.description,
          icon: "solar:server-square-bold",
          color: "bg-white border border-gray-200",
          status: activeTools.some((t: any) => t.server === s.name)
            ? ("connected" as const)
            : ("disconnected" as const),
          type: "custom" as const,
        }));

        // Standard SaaS & Presets
        const standardAppsMapped = FALLBACK_APPS.map((app) => {
          const slug = app.id.replace("app-", "").toLowerCase();
          const isOauthConnected = activeOauthProviders.includes(slug) || activeOauthProviders.includes(`mcp_${slug}`);
          const active = isOauthConnected || activeTools.some((t: any) => t.server === slug);

          return {
            ...app,
            status: active
              ? ("connected" as const)
              : ("disconnected" as const),
          };
        });

        // Sort all custom + standard apps alphabetically by name
        const otherAppsSorted = [
          ...customAppsMapped,
          ...standardAppsMapped,
        ].sort((a, b) => a.name.localeCompare(b.name));

        setApps(otherAppsSorted);
        window.dispatchEvent(new CustomEvent("sync-connect-apps"));
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
  }, [
    apps.some((a) => a.status === "connecting"),
    accessToken,
    activeTools.length,
  ]);

  const handleConnect = async (id: string) => {
    const slug = id.replace("app-", "");
    const providerMap: Record<string, string> = {
      mcp_github: "github",
      mcp_gitlab: "gitlab",
      mcp_slack: "slack",
      mcp_jira: "jira",
    };

    const oauthProvider = providerMap[slug];
    if (oauthProvider) {
      // Redirect directly to native user-scoped OAuth connection endpoint
      const connectUrl = `${API_URL}/integrations/connect/${oauthProvider}?token=${accessToken || ""}`;
      window.location.href = connectUrl;
      return;
    }

    setApps((prev) => {
      const next = prev.map((app) =>
        app.id === id ? { ...app, status: "connecting" as const } : app,
      );

      window.dispatchEvent(new CustomEvent("sync-connect-apps"));

      return next;
    });

    try {
      const preset = COMMAND_PRESETS[slug] || {
        command: "npx",
        args: ["-y", `@modelcontextprotocol/server-${slug.replace("mcp_", "")}`],
      };
      const res = await axios.post(
        `${API_URL}/mcp/connect`,
        { name: slug, command: preset.command, args: preset.args },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );

      if (res.data && res.data.success) {
        setApps((prev) => {
          const next = prev.map((app) =>
            app.id === id ? { ...app, status: "connected" as const } : app,
          );

          window.dispatchEvent(new CustomEvent("sync-connect-apps"));

          return next;
        });
      } else {
        throw new Error("No success returned from backend");
      }
    } catch (err) {
      console.error("Connection failed:", err);
      setApps((prev) => {
        const next = prev.map((app) =>
          app.id === id ? { ...app, status: "disconnected" as const } : app,
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

    // Parse KEY=VALUE env input
    const parsedEnv: Record<string, string> = {};

    if (envInput.trim()) {
      envInput.split("\n").forEach((line) => {
        const parts = line.split("=");

        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join("=").trim();

          if (key) parsedEnv[key] = value;
        }
      });
    }

    try {
      await axios.post(
        `${API_URL}/mcp/connect`,
        {
          name: slug,
          command,
          args: parsedArgs,
          env: parsedEnv,
        },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );
      await fetchActiveTools();
      // Sync local status mapping
      setApps((prev) =>
        prev.map((app) =>
          app.id === selectedApp.id
            ? { ...app, status: "connected" as const }
            : app,
        ),
      );
      window.dispatchEvent(new CustomEvent("sync-connect-apps"));
    } catch (err: any) {
      setMcpError(
        err.response?.data?.message ||
          "Launch failed. Ensure paths and commands are accurate.",
      );
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
        `${API_URL}/mcp/disconnect`,
        { name: slug },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );
      await fetchActiveTools();
      setApps((prev) =>
        prev.map((app) =>
          app.id === selectedApp.id
            ? { ...app, status: "disconnected" as const }
            : app,
        ),
      );
      window.dispatchEvent(new CustomEvent("sync-connect-apps"));
    } catch (err) {
      console.error("Failed to disconnect server", err);
    } finally {
      setIsMcpConnecting(false);
    }
  };

  const handleRegisterCustomMcp = async () => {
    if (!mcpName.trim() || !command.trim()) {
      setMcpError("Server slug name and launcher command are required.");

      return;
    }

    setIsMcpConnecting(true);
    setMcpError(null);

    const parsedEnv: Record<string, string> = {};

    if (envInput.trim()) {
      envInput.split("\n").forEach((line) => {
        const parts = line.split("=");

        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join("=").trim();

          if (key) parsedEnv[key] = value;
        }
      });
    }

    const parsedArgs = argsInput.trim() ? argsInput.split(/\s+/) : [];
    const cleanName = mcpName.trim().replace(/\s+/g, "_").toLowerCase();

    try {
      const res = await axios.post(
        `${API_URL}/mcp/custom`,
        {
          name: cleanName,
          title: mcpTitle.trim(),
          description: mcpDescription.trim(),
          command,
          args: parsedArgs,
          env: parsedEnv,
        },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );

      if (res.data && res.data.success) {
        window.dispatchEvent(new CustomEvent("sync-connect-apps"));

        const newAppId = `app-${cleanName}`;
        const newAppItem = {
          id: newAppId,
          name: mcpTitle.trim() || mcpName.trim(),
          description:
            mcpDescription.trim() ||
            `Custom Model Context Protocol server running via ${command}`,
          icon: "solar:server-square-bold",
          color: "bg-white border border-gray-200",
          status: "disconnected" as const,
          type: "custom" as const,
        };

        setSelectedApp(newAppItem);
        setMcpName("");
        setMcpTitle("");
        setMcpDescription("");
      }
    } catch (err: any) {
      setMcpError(
        err.response?.data?.message || "Failed to register custom MCP server.",
      );
    } finally {
      setIsMcpConnecting(false);
    }
  };

  const handleDeleteCustomMcpServer = async () => {
    if (!selectedApp) return;
    setIsMcpConnecting(true);
    const slug = selectedApp.id.replace("app-", "");

    try {
      await axios.delete(`${API_URL}/mcp/custom/${slug}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      setSelectedApp(null);
      window.dispatchEvent(new CustomEvent("sync-connect-apps"));
    } catch (err: any) {
      setMcpError(
        err.response?.data?.message || "Failed to delete custom server.",
      );
    } finally {
      setIsMcpConnecting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    const slug = id.replace("app-", "");
    const providerMap: Record<string, string> = {
      mcp_github: "github",
      mcp_gitlab: "gitlab",
      mcp_slack: "slack",
      mcp_jira: "jira",
    };

    const oauthProvider = providerMap[slug];

    setApps((prev) => {
      const next = prev.map((app) =>
        app.id === id ? { ...app, status: "connecting" as const } : app,
      );

      window.dispatchEvent(new CustomEvent("sync-connect-apps"));

      return next;
    });
    try {
      if (oauthProvider) {
        await axios.delete(`${API_URL}/integrations/disconnect/${oauthProvider}`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
      } else {
        await axios.post(
          `${API_URL}/mcp/disconnect`,
          { name: slug },
          {
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : {},
          },
        );
      }
      setApps((prev) => {
        const next = prev.map((app) =>
          app.id === id ? { ...app, status: "disconnected" as const } : app,
        );

        window.dispatchEvent(new CustomEvent("sync-connect-apps"));

        return next;
      });
    } catch (err) {
      console.error("Disconnect failed:", err);
      setApps((prev) => {
        const next = prev.map((app) =>
          app.id === id ? { ...app, status: "connected" as const } : app,
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
        {/* Master-Detail Split Screen Container */}
        <div className="flex flex-1 w-full overflow-hidden bg-white dark:bg-[#0A0A0A]">
          {/* Right Column: Center Presentation Area */}
          <div className="flex-1 bg-white dark:bg-[#0A0A0A] flex flex-col h-full overflow-y-auto relative">
            {notification && (
              <div className="p-6 pb-0 w-full max-w-xl mx-auto shrink-0">
                <AlertWrapper className="w-full" variant={notification.type}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-xs">
                      <Icon className="text-base" icon={notification.type === "success" ? "solar:check-circle-bold" : "solar:danger-triangle-bold"} />
                      <span>{notification.message}</span>
                    </div>
                    <button onClick={() => setNotification(null)} className="hover:opacity-75 transition-opacity" type="button">
                      <Icon icon="solar:close-circle-bold" className="text-lg" />
                    </button>
                  </div>
                </AlertWrapper>
              </div>
            )}
            <AnimatePresence mode="wait">
              {!selectedApp ? (
                /* Idle Hub View */
                <motion.div
                  key="idle"
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center gap-8 min-h-full w-full"
                  exit={{ opacity: 0, scale: 0.98 }}
                  initial={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col items-center gap-4">
                    {/* Blue Spars Circle Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 text-white bg-gradient-to-br from-primary to-indigo-600 shrink-0">
                      <Icon className="text-3xl" icon="solar:stars-line-bold" />
                    </div>

                    <h2 className="text-2xl font-bold text-default-900 tracking-tight">
                      Isolated Action Hub
                    </h2>
                    <p className="text-sm text-default-500 max-w-md leading-relaxed">
                      Connect and prompt individual web applications securely.
                      Select an application in the sidebar to configure
                      authentication and interact with its tools in a focused,
                      zero-hallucination agent session.
                    </p>
                  </div>
                </motion.div>
              ) : isMcp ? (
                /* MCP Server Details Panel (Studio Presets + Stdio Transport Configs) */
                <motion.div
                  key={selectedApp.id}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col items-center justify-start p-8 max-w-xl mx-auto w-full gap-6 min-h-full py-12"
                  exit={{ opacity: 0, y: 8 }}
                  initial={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  {mcpError && (
                    <AlertWrapper className="w-full" variant="danger">
                      <div className="flex items-center gap-2 text-xs">
                        <Icon icon="solar:danger-triangle-bold" />
                        <span>{mcpError}</span>
                      </div>
                    </AlertWrapper>
                  )}

                  {selectedApp.id === "custom-mcp-launcher" ? (
                    /* 🆕 ADD CUSTOM MCP SERVER FORM */
                    <div className="w-full p-8 border border-default-200 dark:border-default-100/50 bg-[#F9F9FB]/50 dark:bg-[#0E0E10]/30 rounded-3xl shadow-sm flex flex-col gap-6">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                          <Icon
                            className="text-2xl animate-pulse"
                            icon="solar:add-circle-bold"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h2 className="text-xl font-bold text-default-900">
                            Add Custom MCP Server
                          </h2>
                          <p className="text-xs text-default-500 max-w-sm">
                            Configure standard input/output transport parameters
                            to launch and dynamically register any local or
                            community MCP server.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <Input
                          isRequired
                          label="Display Title"
                          placeholder="e.g. Local Database SQLite"
                          value={mcpTitle}
                          variant="bordered"
                          onValueChange={setMcpTitle}
                        />

                        <div className="flex gap-4">
                          <Input
                            isRequired
                            className="w-1/2"
                            label="Server Slug ID"
                            placeholder="e.g. local_sqlite"
                            value={mcpName}
                            variant="bordered"
                            onValueChange={setMcpName}
                          />
                          <Input
                            isRequired
                            className="w-1/2"
                            label="Command"
                            placeholder="npx"
                            value={command}
                            variant="bordered"
                            onValueChange={setCommand}
                          />
                        </div>

                        <Input
                          label="Description"
                          placeholder="Brief description of capabilities exposed by this server"
                          value={mcpDescription}
                          variant="bordered"
                          onValueChange={setMcpDescription}
                        />

                        <Input
                          label="Arguments"
                          placeholder="e.g. -y @modelcontextprotocol/server-sqlite --file db.sqlite"
                          value={argsInput}
                          variant="bordered"
                          onValueChange={setArgsInput}
                        />

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-semibold text-default-600 pl-1">
                            Environment Variables (Optional)
                          </label>
                          <textarea
                            className="w-full h-24 p-3 bg-transparent border border-default-200 dark:border-default-100 rounded-xl font-mono text-[10px] text-default-800 focus:outline-none focus:border-primary placeholder:text-default-400"
                            placeholder="KEY=VALUE&#10;GITHUB_TOKEN=token123"
                            value={envInput}
                            onChange={(e) => setEnvInput(e.target.value)}
                          />
                        </div>

                        <button
                          className="w-full font-bold text-sm h-12 rounded-xl bg-primary text-white hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10 mt-2"
                          disabled={isMcpConnecting}
                          type="button"
                          onClick={handleRegisterCustomMcp}
                        >
                          {isMcpConnecting ? (
                            <Icon
                              className="text-base animate-spin"
                              icon="line-md:loading-twotone-loop"
                            />
                          ) : (
                            <Icon
                              className="text-base"
                              icon="solar:disk-bold"
                            />
                          )}
                          Register & Launch Server
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* EXISTING PRESETS OR CUSTOM SERVERS */
                    <div className="w-full p-8 border border-default-200 dark:border-default-100/50 bg-[#F9F9FB]/50 dark:bg-[#0E0E10]/30 rounded-3xl shadow-sm flex flex-col items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-black border border-default-200 dark:border-default-100/50 shadow-sm shrink-0 overflow-hidden">
                        <AppIcon
                          app={selectedApp}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex flex-col gap-1 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <h2 className="text-xl font-bold text-default-900">
                            {selectedApp.name}
                          </h2>
                          {isServerActive && (
                            <Chip
                              className="h-5 text-[10px] font-semibold"
                              color="success"
                              size="sm"
                              variant="flat"
                            >
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

                        <div className="flex flex-col gap-1.5 mt-1">
                          <label className="text-[11px] font-semibold text-default-600 pl-1">
                            Environment Variables (Optional)
                          </label>
                          <textarea
                            className="w-full h-20 p-2.5 bg-transparent border border-default-200 dark:border-default-100 rounded-xl font-mono text-[10px] text-default-800 focus:outline-none focus:border-primary placeholder:text-default-400"
                            placeholder="KEY=VALUE&#10;GITHUB_TOKEN=token123"
                            value={envInput}
                            onChange={(e) => setEnvInput(e.target.value)}
                          />
                        </div>

                        {isServerActive ? (
                          <button
                            className="w-full font-bold text-sm h-12 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-danger/20 mt-2"
                            disabled={isMcpConnecting}
                            type="button"
                            onClick={handleDisconnectMcpServer}
                          >
                            {isMcpConnecting ? (
                              <Icon
                                className="text-base animate-spin"
                                icon="line-md:loading-twotone-loop"
                              />
                            ) : (
                              <Icon
                                className="text-base"
                                icon="solar:stop-circle-bold"
                              />
                            )}
                            Stop MCP Server
                          </button>
                        ) : (
                          <button
                            className="w-full font-bold text-sm h-12 rounded-xl bg-primary text-white hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10 mt-2"
                            disabled={isMcpConnecting}
                            type="button"
                            onClick={handleLaunchMcpServer}
                          >
                            {isMcpConnecting ? (
                              <Icon
                                className="text-base animate-spin"
                                icon="line-md:loading-twotone-loop"
                              />
                            ) : (
                              <Icon
                                className="text-base"
                                icon="solar:play-circle-bold"
                              />
                            )}
                            Launch MCP Server
                          </button>
                        )}

                        {selectedApp.type === "custom" && (
                          <button
                            className="w-full font-bold text-xs h-10 rounded-xl bg-default-100 hover:bg-danger/10 hover:text-danger active:scale-95 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-danger/20 mt-1"
                            disabled={isMcpConnecting}
                            type="button"
                            onClick={handleDeleteCustomMcpServer}
                          >
                            <Icon
                              className="text-sm"
                              icon="solar:trash-bin-trash-bold"
                            />
                            Delete Custom Integration
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-default-400 font-medium">
                        <Icon
                          className="text-xs text-primary"
                          icon="solar:server-square-bold"
                        />
                        Ingested seamlessly via secure Stdio pipeline
                      </div>
                    </div>
                  )}

                  {/* Ingested Server Tools Tab list */}
                  <div className="w-full flex flex-col gap-4 mt-2">
                    <div className="flex border-b border-default-200 dark:border-default-100/50">
                      <button
                        className="pb-2.5 text-xs font-bold border-b-2 border-primary text-primary px-1"
                        type="button"
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
                                <Icon
                                  className="text-primary text-base shrink-0"
                                  icon="solar:bolt-circle-bold"
                                />
                                <p className="font-bold text-xs text-default-800 truncate">
                                  {tool.name}
                                </p>
                              </div>
                              <p className="text-[11px] text-default-500 leading-normal pl-6">
                                {tool.description}
                              </p>
                              {tool.inputSchema?.required && (
                                <div className="flex gap-1.5 flex-wrap mt-2 pl-6">
                                  {tool.inputSchema.required.map(
                                    (req: string) => (
                                      <Chip
                                        key={req}
                                        className="h-4 text-[8px] px-1.5 font-mono"
                                        color="danger"
                                        size="sm"
                                        variant="flat"
                                      >
                                        {req}*
                                      </Chip>
                                    ),
                                  )}
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
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col items-center justify-start p-8 max-w-xl mx-auto w-full gap-6 min-h-full py-12"
                  exit={{ opacity: 0, y: 8 }}
                  initial={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Connect App Card Wrapper */}
                  <div className="w-full p-8 border border-default-200 dark:border-default-100/50 bg-[#F9F9FB]/50 dark:bg-[#0E0E10]/30 rounded-3xl shadow-sm flex flex-col items-center text-center gap-6">
                    {/* App logo inside custom box */}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-black border border-default-200 dark:border-default-100/50 shadow-sm shrink-0 overflow-hidden">
                      <AppIcon
                        app={selectedApp}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-xl font-bold text-default-900">
                        Connect {selectedApp.name}
                      </h2>
                      <p className="text-xs text-default-500 leading-relaxed px-2">
                        Integrate {selectedApp.name} to seamlessly execute
                        automated workflows, synchronize data, and orchestrate{" "}
                        {selectedApp.name} actions directly within Inso Code.
                      </p>
                    </div>

                    {/* Authorize button triggers */}
                    <div className="w-full">
                      {selectedApp.status === "disconnected" ? (
                        <button
                          className="w-full font-bold text-sm h-12 rounded-xl bg-primary text-white hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10"
                          type="button"
                          onClick={() => handleConnect(selectedApp.id)}
                        >
                          <Icon className="text-base" icon="solar:key-bold" />
                          Authorize Connection
                        </button>
                      ) : selectedApp.status === "connecting" ? (
                        <button
                          disabled
                          className="w-full font-bold text-sm h-12 rounded-xl bg-default-100 dark:bg-default-200 text-default-400 flex items-center justify-center gap-2 cursor-wait"
                          type="button"
                        >
                          <Icon
                            className="text-base"
                            icon="line-md:loading-twotone-loop"
                          />
                          Authenticating Connection...
                        </button>
                      ) : (
                        <button
                          className="w-full font-bold text-sm h-12 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-danger/20"
                          type="button"
                          onClick={() => handleDisconnect(selectedApp.id)}
                        >
                          Disconnect Connection
                        </button>
                      )}
                    </div>

                    {/* Footnote */}
                    <div className="flex items-center gap-1.5 text-[10px] text-default-400 font-medium">
                      <Icon className="text-xs" icon="solar:lock-bold" />
                      Authenticated securely via local protocol
                    </div>
                  </div>

                  {/* Capabilities Accordion Tab Views inside the details page */}
                  <div className="w-full flex flex-col gap-4 mt-2">
                    <div className="flex border-b border-default-200 dark:border-default-100/50">
                      <button
                        className={`pb-2.5 text-xs font-bold border-b-2 transition-colors px-1 ${
                          modalTab === "tools"
                            ? "border-primary text-primary"
                            : "border-transparent text-default-400 hover:text-default-700"
                        }`}
                        type="button"
                        onClick={() => setModalTab("tools")}
                      >
                        Capabilities (Tools)
                      </button>
                      <button
                        className={`ml-6 pb-2.5 text-xs font-bold border-b-2 transition-colors px-1 ${
                          modalTab === "triggers"
                            ? "border-primary text-primary"
                            : "border-transparent text-default-400 hover:text-default-700"
                        }`}
                        type="button"
                        onClick={() => setModalTab("triggers")}
                      >
                        Webhooks (Triggers)
                      </button>
                    </div>

                    {/* Tab contents list */}
                    <div className="w-full">
                      {loadingDetails ? (
                        <div className="flex flex-col items-center py-8 gap-3">
                          <Icon
                            className="text-xl text-primary animate-spin"
                            icon="line-md:loading-twotone-loop"
                          />
                          <span className="text-[11px] text-default-400">
                            Syncing connection...
                          </span>
                        </div>
                      ) : modalTab === "tools" ? (
                        appTools.length === 0 ? (
                          <div className="text-center py-10 border border-dashed border-default-200 dark:border-default-100 rounded-2xl">
                            <span className="text-xs text-default-400">
                              No capabilities found
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {appTools.map((tool) => (
                              <div
                                key={tool.id}
                                className="flex flex-col p-3.5 rounded-2xl border border-default-200 dark:border-default-100 bg-[#F9F9FB]/30 dark:bg-default-50/5 hover:border-primary/20 transition-all"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Icon
                                    className="text-primary text-base shrink-0"
                                    icon="solar:bolt-circle-bold"
                                  />
                                  <p className="font-bold text-xs text-default-800 truncate">
                                    {tool.name}
                                  </p>
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
                          <span className="text-xs text-default-400">
                            No webhooks found
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {appTriggers.map((trigger) => (
                            <div
                              key={trigger.id}
                              className="flex items-center justify-between p-3.5 rounded-2xl border border-default-200 dark:border-default-100 bg-[#F9F9FB]/30 dark:bg-default-50/5 hover:border-primary/20 transition-all"
                            >
                              <div className="min-w-0 pr-3">
                                <p className="font-bold text-xs text-default-800 truncate mb-0.5">
                                  {trigger.name}
                                </p>
                                <p className="text-[9px] text-default-400 font-mono truncate">
                                  {trigger.id}
                                </p>
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

export default function ConnectAppsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0A0A0A] h-screen">
        <Icon className="text-3xl text-primary animate-spin" icon="line-md:loading-twotone-loop" />
      </div>
    }>
      <ConnectAppsContent />
    </Suspense>
  );
}
