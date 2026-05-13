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

          setApps((prev) =>
            prev.map((app) => {
              const slug = app.id.replace("app-", "").toLowerCase();

              if (connectedIds.has(slug)) {
                return { ...app, status: "connected" };
              }
              if (app.status === "connecting") return app;

              return { ...app, status: "disconnected" };
            }),
          );
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
    setApps((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: "connecting" } : app,
      ),
    );

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
      } else {
        throw new Error("No redirect URL returned from backend");
      }
    } catch (err) {
      console.error("Connection failed:", err);
      // Revert status to disconnected if something failed
      setApps((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "disconnected" } : app,
        ),
      );
    }
  };

  const handleDisconnect = async (id: string) => {
    // Show spinner while disconnecting
    setApps((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: "connecting" } : app,
      ),
    );
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
      setApps((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "disconnected" } : app,
        ),
      );
    } catch (err) {
      console.error("Disconnect failed:", err);
      // Revert back to connected on failure
      setApps((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "connected" } : app,
        ),
      );
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
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-50 relative w-full">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3 shrink-0">
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900">
                Integrations
              </h1>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end ml-8">
              <div className="relative max-w-sm w-full hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 z-10 pointer-events-none" />
                <input
                  className="w-full bg-default-50 dark:bg-background border border-default-200 rounded-full h-8 pl-9 pr-8 text-sm font-medium placeholder:font-normal focus:outline-none focus:border-indigo-500 transition-all relative z-0"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600"
                    onClick={() => setSearch("")}
                  >
                    <Icon
                      className="text-base"
                      icon="solar:close-circle-bold"
                    />
                  </button>
                )}
              </div>

              <div className="flex bg-default-50 dark:bg-background border border-default-200 h-8 p-0.5 rounded-full shrink-0">
                <button
                  className={`h-full px-4 rounded-full text-xs font-medium transition-colors ${activeTab === "all" ? "bg-white dark:bg-default-200 text-black dark:text-white shadow-sm border border-default-200" : "text-default-500 hover:text-black dark:hover:text-white border border-transparent"}`}
                  onClick={() => setActiveTab("all")}
                >
                  All Apps
                </button>
                <button
                  className={`h-full px-4 rounded-full text-xs font-medium transition-colors ${activeTab === "connected" ? "bg-white dark:bg-default-200 text-black dark:text-white shadow-sm border border-default-200" : "text-default-500 hover:text-black dark:hover:text-white border border-transparent"}`}
                  onClick={() => setActiveTab("connected")}
                >
                  Connected
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="relative flex flex-1 w-full bg-default-50 overflow-hidden">
          <div className="container mx-auto max-w-7xl h-full overflow-y-auto relative flex flex-col pt-6">
            {/* Grid Layout */}
            <div className="px-6 pb-12">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Icon
                    className="text-4xl text-indigo-500"
                    icon="line-md:loading-twotone-loop"
                  />
                  <p className="text-default-400 text-sm">
                    Syncing Composio Catalog...
                  </p>
                </div>
              ) : (
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredApps.map((app) => (
                      <motion.div
                        key={app.id}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative flex flex-col justify-between p-5 bg-white dark:bg-default-50 rounded-2xl border border-default-200 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 cursor-pointer"
                        exit={{ opacity: 0, scale: 0.98 }}
                        initial={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => openAppDetailsModal(app)}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-default-900 m-0 truncate pr-4">
                            {app.name}
                          </h3>
                          <div className="flex items-center gap-2 shrink-0">
                            {app.status === "connected" && (
                              <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-success/15 text-success border border-success/30 rounded-full">
                                <Icon icon="solar:check-circle-bold" />
                                Connected
                              </span>
                            )}
                            {app.type === "custom" &&
                              app.status !== "connected" && (
                                <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/20 rounded-full">
                                  Custom
                                </span>
                              )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end mt-2 pt-4 border-t border-default-100">
                          {app.status === "disconnected" ? (
                            <button
                              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-colors w-full h-10 rounded-lg text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConnect(app.id);
                              }}
                            >
                              Connect
                            </button>
                          ) : app.status === "connecting" ? (
                            <button
                              disabled
                              className="bg-indigo-50 text-indigo-500 font-semibold w-full h-10 rounded-lg text-sm flex items-center justify-center gap-2 cursor-wait"
                            >
                              <Icon
                                className="text-lg"
                                icon="line-md:loading-twotone-loop"
                              />
                              Authenticating
                            </button>
                          ) : (
                            <button
                              className="font-semibold bg-danger/5 hover:bg-danger/10 text-danger w-full h-10 rounded-lg text-sm transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDisconnect(app.id);
                              }}
                            >
                              Disconnect
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {!loading && filteredApps.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-default-400">
                  <Icon
                    className="text-6xl mb-4 opacity-50"
                    icon={
                      activeTab === "connected"
                        ? "solar:plug-circle-bold"
                        : "solar:ghost-bold"
                    }
                  />
                  <h3 className="text-xl font-bold text-default-600 mb-1">
                    No integrations found
                  </h3>
                  <p className="text-center mb-6 max-w-md">
                    {activeTab === "connected"
                      ? "You haven't connected any apps yet. Switch to 'All Integrations' to explore the catalog."
                      : "Try searching for something else."}
                  </p>
                  {activeTab === "connected" && (
                    <button
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-6 h-11 rounded-full font-bold transition-colors"
                      onClick={() => setActiveTab("all")}
                    >
                      Browse Integrations
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* App Details Modal */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          />
          {/* Modal Content */}
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="dark:bg-default-50 border border-default-200"
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{
              position: "relative",
              background: "white",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <div className="flex flex-col gap-1 p-6 pb-2">
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 flex items-center justify-center rounded-2xl shrink-0 ${selectedApp?.color}`}
                  >
                    <Icon
                      className="text-3xl"
                      icon={selectedApp?.icon || "solar:box-bold"}
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedApp?.name}</h2>
                    <p className="text-sm text-default-500 font-medium">
                      Integration Capabilities & Settings
                    </p>
                  </div>
                </div>
                <button
                  className="p-2 text-default-400 hover:text-default-600 hover:bg-default-100 rounded-full transition-colors"
                  onClick={onClose}
                >
                  <Icon className="text-2xl" icon="solar:close-circle-bold" />
                </button>
              </div>
            </div>
            <div className="px-6 border-b border-default-100 mt-4">
              <div className="flex gap-8">
                <button
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${modalTab === "tools" ? "border-indigo-500 text-indigo-600" : "border-transparent text-default-500 hover:text-default-800"}`}
                  onClick={() => setModalTab("tools")}
                >
                  Capabilities (Tools)
                </button>
                <button
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${modalTab === "triggers" ? "border-indigo-500 text-indigo-600" : "border-transparent text-default-500 hover:text-default-800"}`}
                  onClick={() => setModalTab("triggers")}
                >
                  Webhooks (Triggers)
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-default-50/30">
              {loadingDetails ? (
                <div className="flex flex-col items-center py-16 gap-4">
                  <Icon
                    className="text-4xl text-indigo-500"
                    icon="line-md:loading-twotone-loop"
                  />
                  <p className="text-default-500 font-medium text-sm">
                    Syncing with Composio...
                  </p>
                </div>
              ) : modalTab === "tools" ? (
                appTools.length === 0 ? (
                  <div className="text-center py-16">
                    <Icon
                      className="text-5xl text-default-300 mx-auto mb-4"
                      icon="solar:magic-stick-3-bold"
                    />
                    <h3 className="font-bold text-default-700 text-lg mb-1">
                      No Capabilities Found
                    </h3>
                    <p className="text-default-500">
                      This integration doesn't expose any actions yet.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {appTools.map((tool) => (
                      <div
                        key={tool.id}
                        className="flex flex-col p-4 rounded-xl border border-default-200 bg-white hover:border-indigo-500/30 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon
                            className="text-indigo-500 text-xl"
                            icon="solar:bolt-circle-bold"
                          />
                          <p className="font-bold text-default-800">
                            {tool.name}
                          </p>
                        </div>
                        <p className="text-sm text-default-500 leading-relaxed pl-7">
                          {tool.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              ) : appTriggers.length === 0 ? (
                <div className="text-center py-16">
                  <Icon
                    className="text-5xl text-default-300 mx-auto mb-4"
                    icon="solar:bell-off-bold"
                  />
                  <h3 className="font-bold text-default-700 text-lg mb-1">
                    No Webhooks Found
                  </h3>
                  <p className="text-default-500">
                    This integration doesn't expose any triggers yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {appTriggers.map((trigger) => (
                    <div
                      key={trigger.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-default-200 bg-white hover:border-indigo-500/30 hover:shadow-sm transition-all"
                    >
                      <div>
                        <p className="font-bold text-default-800 mb-0.5">
                          {trigger.name}
                        </p>
                        <p className="text-xs text-default-500 font-mono">
                          {trigger.id}
                        </p>
                      </div>
                      <button className="px-4 py-1.5 bg-default-100 hover:bg-success hover:text-white rounded-lg text-xs font-bold transition-colors uppercase tracking-wide">
                        Enable
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </ChatBotLayout>
  );
}
