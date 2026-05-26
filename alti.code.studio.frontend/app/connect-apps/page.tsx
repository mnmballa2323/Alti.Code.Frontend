"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";

import { SAAS_MOCKS } from "./catalog";

import ChatBotLayout from "@/components/ChatbotLayout";
import { API_URL } from "@/lib/config";

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
    description:
      "Modern issue tracking and project management for software teams.",
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
    description:
      "CRM integration to manage leads, contacts, and custom objects.",
    icon: "logos:salesforce",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
  {
    id: "discord",
    name: "Discord",
    description:
      "Interact with community channels, manage roles, and deploy bots.",
    icon: "logos:discord-icon",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
];

const coreAppIds = new Set(CORE_APPS.map((app) => app.id));

// Remove duplicates from SAAS_MOCKS that are already in CORE_APPS
const FALLBACK_APPS: AppIntegration[] = [
  ...CORE_APPS,
  ...SAAS_MOCKS.filter((mockApp) => !coreAppIds.has(mockApp.slug)).map(
    (mockApp, i) => ({
      id: `app-${mockApp.slug}`,
      name: mockApp.name,
      description: `Seamlessly connect and automate workflows directly with ${mockApp.name}.`,
      icon: mockApp.icon,
      color: "bg-white border border-gray-200",
      status: "disconnected" as const,
      type: "official" as const,
    }),
  ),
].sort((a, b) => a.name.localeCompare(b.name));

const AppIcon = ({ app, className = "w-8 h-8" }: { app: AppIntegration; className?: string }) => {
  const [imageError, setImageError] = useState(false);
  
  const slug = app.id.replace("app-", "").toLowerCase();
  
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
    "21risk": "https://logo.clearbit.com/21risk.com",
    "2chat": "https://logo.clearbit.com/2chat.co",
    "accredible_certificates": "https://logos.composio.dev/api/accredible",
    "active_campaign": "https://logos.composio.dev/api/activecampaign",
    "active_trail": "https://logos.composio.dev/api/activetrail",
    "addepar": "https://logo.clearbit.com/addepar.com",
    "addressfinder": "https://logo.clearbit.com/addressfinder.com.au",
    "addresszen": "https://logo.clearbit.com/addresszen.com",
    "adrapid": "https://logo.clearbit.com/adrapid.com",
    "adyntel": "https://logo.clearbit.com/adyntel.com",
    "aeroleads": "https://logo.clearbit.com/aeroleads.com",
    "affinda": "https://logo.clearbit.com/affinda.com",
    "affinity": "https://logo.clearbit.com/affinity.co",
  };

  const customMappings: Record<string, string> = {
    googledrive: "google-drive",
    googlesheets: "google-sheets",
    gmail: "gmail",
  };
  
  const logoUrl = (() => {
    if (localLogoMappings[slug]) {
      return `/assets/apps-logos/${localLogoMappings[slug]}`;
    }
    if (specialLogoUrls[slug]) {
      return specialLogoUrls[slug];
    }
    const mappedSlug = customMappings[slug] || slug.replace(/_/g, "-");
    return `https://logos.composio.dev/api/${mappedSlug}`;
  })();

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

  if (!imageError) {
    return (
      <img
        src={logoUrl}
        alt={`${app.name} logo`}
        className={`${className} object-contain p-0.5 rounded-lg`}
        onError={() => setImageError(true)}
      />
    );
  }

  const initials = app.name.slice(0, 2).toUpperCase();
  const gradientClass = getAvatarColor(app.name);

  return (
    <div className={`rounded-lg flex items-center justify-center font-bold text-[10px] bg-gradient-to-br tracking-tight ${gradientClass} ${className}`}>
      {initials}
    </div>
  );
};

export default function ConnectAppsPage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [apps, setApps] = useState<AppIntegration[]>(FALLBACK_APPS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // New States
  const [activeTab, setActiveTab] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const [selectedApp, setSelectedApp] = useState<AppIntegration | null>(null);
  const [appTriggers, setAppTriggers] = useState<any[]>([]);
  const [appTools, setAppTools] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [modalTab, setModalTab] = useState("tools");

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
  }, []);

  const openAppDetailsModal = async (app: AppIntegration) => {
    setSelectedApp(app);
    setAppTriggers([]);
    setAppTools([]);
    setModalTab("tools");
    setLoadingDetails(true);
    onOpen();

    try {
      const slug = app.id.replace("app-", "");
      const headers = accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {};
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

    // Always fetch initially to establish state
    fetchConnections();

    // Start 3-second polling if any app is currently in the 'connecting' state
    const isConnecting = apps.some((a) => a.status === "connecting");

    if (isConnecting) {
      pollInterval = setInterval(fetchConnections, 3000);
    }

    return () => clearInterval(pollInterval);
  }, [apps.some((a) => a.status === "connecting"), accessToken]);

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
        {
          appName: slug,
        },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );

      if (res.data && res.data.success && res.data.data?.redirectUrl) {
        // Open the OAuth URL in a new tab so the user can securely authenticate
        window.open(res.data.data.redirectUrl, "_blank");
        // State remains "connecting", the auto-poll effect will flip it to "connected" automatically!
        window.dispatchEvent(new CustomEvent("sync-connect-apps"));
      } else {
        throw new Error("No redirect URL returned from backend");
      }
    } catch (err) {
      console.error("Connection failed:", err);
      // Revert status to disconnected if something failed
      setApps((prev) => {
        const next = prev.map((app) =>
          app.id === id ? { ...app, status: "disconnected" } : app,
        );
        window.dispatchEvent(new CustomEvent("sync-connect-apps"));
        return next;
      });
    }
  };

  const handleDisconnect = async (id: string) => {
    // Show spinner while disconnecting
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
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
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
      // Revert back to connected on failure
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
