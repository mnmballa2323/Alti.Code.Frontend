"use client";

import type { ComponentProps } from "react";

import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ScrollShadow,
  cn,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
} from "@heroui/react";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  Search,
  ChevronDown,
  Blocks,
  Waypoints,
  Network,
  BookOpen,
  Shield,
  Plus,
  Code,
  MessageSquare,
  MoreHorizontal,
  Edit2,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  Cloud,
  CheckCircle,
  Github,
  Users,
  Briefcase,
  Activity,
  Cpu,
  ShieldCheck,
  Landmark,
  Megaphone,
  Server,
  Layout,
  LayoutGrid,
  Crown,
  Scale,
  Calculator,
  Target,
  Palette,
  Settings2,
  Bug,
  TrendingUp,
  Bot,
  Database,
  FileText,
  ListTodo,
  LifeBuoy,
} from "lucide-react";
import { useSession } from "next-auth/react";

import MyAccountDropdown from "./MyAccountDropdown";

import {
  removeRepository,
  removeDocument,
} from "@/store/systemSlice";
import { RootState } from "@/store";
import { useModalStore } from "@/store/useModalStore";
import useFetchChatHistory from "@/hooks/useFetchChatHistory";
import {
  sendMessage,
  setChatContext,
  startNewChat,
} from "@/store/messagesSlice";
import { SAAS_MOCKS } from "@/app/connect-apps/catalog";

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

const AppIcon = ({ app, className = "w-8 h-8" }: { app: AppIntegration; className?: string }) => {
  const [imageError, setImageError] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);

  if (app.id === "custom-mcp-launcher") {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-primary/10 text-primary rounded-lg", className)}>
        <Plus className="size-4 shrink-0" />
      </div>
    );
  }

  const slug = app.id.replace("app-", "").toLowerCase();
  let cleanSlug = slug.startsWith("_") ? slug.slice(1) : slug;
  if (cleanSlug.startsWith("mcp_toolbox_")) {
    cleanSlug = cleanSlug.slice(12);
  } else if (cleanSlug.startsWith("mcp_")) {
    cleanSlug = cleanSlug.slice(4);
  }

  const localLogoMappings: Record<string, string> = {
    github: "github.png",
    slack: "slack.svg",
    jira: "jira.svg",
    notion: "notion.svg",
    linear: "linear.png",
    googledrive: "google-drive.svg",
    googlesheets: "google-sheets.svg",
    discord: "discord.svg",
    gmail: "gmail.svg",
    git: "git.svg",
    filesystem: "filesystem.svg",
    supabase: "supabase.jpeg",
    posthog: "posthog.svg",
    sentry: "sentry.svg",
    docker: "docker-icon.png",
    kubernetes: "kubernetes.png",
    aws: "aws.svg",
    azure: "azure.svg",
  };

  const simpleIconsMapping: Record<string, string> = {
    aws_dynamodb: "amazondynamodb",
    aws_ec2: "amazonec2",
    aws_lambda: "awslambda",
    aws_s3: "amazons3",
    aws_ecs: "amazonecs",
    aws_cdk: "amazonwebservices",
    aws_kb_retrieval: "amazonwebservices",
    apollo_graphql: "apollographql",
    google_drive: "googledrive",
    google_sheets: "googlesheets",
    google_calendar: "googlecalendar",
    google_maps: "googlemaps",
    bun_runtime: "bun",
    deno_runtime: "deno",
    prisma_orm: "prisma",
    hasura_graphql: "hasura",
    stripe_dev: "stripe",
    teams: "microsoftteams",
    nextjs: "nextdotjs",
    springboot: "springboot",
    brave_search: "brave",
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

    // 3. Try official Simple Icons SVG CDN (extremely fast and serves the exact brand SVG natively)
    const simpleIconBrand = simpleIconsMapping[cleanSlug] || cleanSlug.replace(/_/g, "");
    addUrl(`https://cdn.simpleicons.org/${simpleIconBrand}`);

    // 4. Try Composio official logo API
    addUrl(`https://logos.composio.dev/api/${cleanSlug.replace(/_/g, "-")}`);
    addUrl(`https://logos.composio.dev/api/${cleanSlug}`);

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
        src={currentLogoUrl}
        alt={`${app.name} logo`}
        className={cn(className, "object-contain p-0.5 rounded-lg shrink-0")}
        onError={handleImageError}
      />
    );
  }

  // Fallback 1: System custom server icon
  if (app.type === "custom") {
    return (
      <div className={cn("rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shrink-0", className)}>
        <Server className="size-4 text-white shrink-0" />
      </div>
    );
  }

  // Fallback 2: Ultimate bulletproof initials box (strictly bypasses broken Iconify components to ensure no blank circles!)
  const initials = app.name.slice(0, 2).toUpperCase();
  const gradientClass = getAvatarColor(app.name);

  return (
    <div className={cn("rounded-lg flex items-center justify-center font-bold text-[10px] bg-gradient-to-br tracking-tight shrink-0", gradientClass, className)}>
      {initials}
    </div>
  );
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

const FALLBACK_APPS: AppIntegration[] = [
  ...CORE_APPS,
  ...SAAS_MOCKS.filter((mockApp) => !coreAppIds.has(mockApp.slug)).map(
    (mockApp) => ({
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

import { AppDispatch } from "@/store";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Define types for the responses
type AiItem = {
  _id: string;
  prompt: string;
  reply: string;
};

type AiSession = {
  _id: string;
  user?: string;
  sessionId?: string;
  createdAt: string;
  responses: AiItem[];
};

type ApiResponse = {
  success: boolean;
  data: {
    llamaAiSessions: AiSession[];
  };
};

// Code-related chat history
const codeHistory = [
  {
    topic: "React Component Lifecycle Methods",
    chat: [
      {
        from: "user",
        message: "When should I use componentDidMount vs useEffect in React?",
      },
      {
        from: "assistant",
        message:
          "componentDidMount is for class components and runs once after initial render. For functional components, use useEffect with an empty dependency array (useEffect(() => {}, [])) to achieve the same behavior.",
      },
    ],
  },
  {
    topic: "CSS Grid Layout Issues",
    chat: [
      {
        from: "user",
        message: "My grid items aren't respecting the defined column sizes",
      },
      {
        from: "assistant",
        message:
          "Try adding grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) to your grid container. Also check for min-width constraints on child elements that might be overriding your grid layout.",
      },
    ],
  },
  {
    topic: "API Fetch Error Handling",
    chat: [
      {
        from: "user",
        message: "How can I properly handle 404 errors from my API calls?",
      },
      {
        from: "assistant",
        message:
          "Wrap your fetch in a try-catch block and check response.ok. For example: `if (!response.ok) throw new Error('Not found');` Then display appropriate UI in your catch block.",
      },
    ],
  },
  {
    topic: "TypeScript Interface vs Type",
    chat: [
      {
        from: "user",
        message: "When should I use interface versus type in TypeScript?",
      },
      {
        from: "assistant",
        message:
          "Use interfaces for object shapes that may be extended or implemented. Use type for unions, tuples, or complex type compositions. For simple object shapes, either works but interfaces are generally preferred.",
      },
    ],
  },
  {
    topic: "Deploying to Vercel",
    chat: [
      {
        from: "user",
        message: "My Next.js app deployment fails with 'Module not found'",
      },
      {
        from: "assistant",
        message:
          "This typically happens when dependencies aren't properly installed. Try deleting node_modules and package-lock.json, then run 'npm install' before redeploying. Also verify all imports match your package.json.",
      },
    ],
  },
];

// Chat-related history
const chatHistory = [
  {
    topic: "Planning a Weekend Trip",
    chat: [
      {
        from: "user",
        message:
          "I want to plan a weekend getaway. Any suggestions for a relaxing destination?",
      },
      {
        from: "assistant",
        message:
          "Consider visiting a mountain cabin or a lakeside retreat. Both offer peaceful environments away from city noise. What kind of activities do you enjoy - hiking, reading, or water sports?",
      },
    ],
  },
  {
    topic: "Healthy Meal Prep Ideas",
    chat: [
      {
        from: "user",
        message: "I need some healthy meal prep ideas for the week",
      },
      {
        from: "assistant",
        message:
          "Try preparing quinoa bowls with various toppings, overnight oats for breakfast, and sheet pan vegetables. Batch cooking proteins like grilled chicken or baked tofu saves time too.",
      },
    ],
  },
  {
    topic: "Book Recommendations",
    chat: [
      {
        from: "user",
        message: "Can you recommend some good fiction books?",
      },
      {
        from: "assistant",
        message:
          "Based on popular choices: 'The Seven Husbands of Evelyn Hugo' for contemporary fiction, 'The Name of the Wind' for fantasy, or 'Where the Crawdads Sing' for literary fiction. What genres do you usually enjoy?",
      },
    ],
  },
  {
    topic: "Learning a New Language",
    chat: [
      {
        from: "user",
        message: "What's the best way to start learning Spanish?",
      },
      {
        from: "assistant",
        message:
          "Start with basic conversational phrases, use apps like Duolingo or Babbel for daily practice, and try to consume Spanish media with subtitles. Consistent daily practice, even 15 minutes, is more effective than longer sporadic sessions.",
      },
    ],
  },
  {
    topic: "Home Organization Tips",
    chat: [
      {
        from: "user",
        message: "My home feels cluttered. How can I organize it better?",
      },
      {
        from: "assistant",
        message:
          "Start with one room at a time using the 'keep, donate, trash' method. Invest in storage solutions that fit your space, and follow the 'one in, one out' rule to prevent future clutter buildup.",
      },
    ],
  },
];

function AvatarDropdownIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_3076_10614)">
        <path
          d="M6.6665 7.50008L9.99984 4.16675L13.3332 7.50008"
          stroke="#A1A1AA"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.3332 12.5L9.99984 15.8333L6.6665 12.5"
          stroke="#A1A1AA"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_3076_10614">
          <rect fill="white" height="20" width="20" />
        </clipPath>
      </defs>
    </svg>
  );
}

function RecentPromptDropdown() {
  // const dispatch = useDispatch();
  return (
    <Dropdown className="min-w-fit p-0 rounded-lg">
      <DropdownTrigger>
        <Icon
          className="text-default-500 opacity-0 group-hover:opacity-100"
          icon="solar:menu-dots-bold"
          width={24}
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Dropdown menu with icons"
        className="p-0 w-fit"
        variant="faded"
      >
        <DropdownItem
          // onClick={() => {
          //   dispatch(setDeleteModel(true));
          // }}
          key="delete"
          className="dark:text-white text-black dark:data-[hover=true]:text-white data-[hover=true]:text-black"
          color="danger"
          startContent={
            <Icon
              className="dark:text-white text-black"
              height={20}
              icon="solar:trash-bin-minimalistic-linear"
              width={20}
            />
          }
        >
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default function Sidebar() {
  const { isOpen, onOpenChange } = useDisclosure();
  const { onOpen } = useModalStore();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken ?? null;
  const [repoSearch, setRepoSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("alti.code.studio");

  // Prefetch all key sidebar routes on mount to ensure instant 0ms transitions!
  useEffect(() => {
     router.prefetch("/");
     router.prefetch("/chat");
     router.prefetch("/agents-showcase");
     router.prefetch("/vault");
    router.prefetch("/cloud");
    router.prefetch("/instructions");
    router.prefetch("/guardrails");
    router.prefetch("/repositories");
    router.prefetch("/documents");
    router.prefetch("/connect-apps");
  }, [router]);

  const getHistoryTitle = () => {
    if (pathname?.startsWith("/chat/")) return "Chat";

    switch (pathname) {
      case "/":
        return "Code";
      case "/chat":
        return "Chat";
      case "/agents-showcase":
        return "Agent Arcade";
      case "/documents":
        return "Documentation";
      case "/instructions":
        return "Instructions";
      case "/guardrails":
        return "Guardrails";
      case "/repositories":
        return "Repositories";
      case "/connect-apps":
      case "/integrations":
        return "Integrations";

      case "/vault":
        return "Vault";
      case "/cloud":
        return "Cloud";

      default:
        return "Code";
    }
  };
  // const dispatch = useDispatch();
  const [currentMode, setCurrentMode] = useState<"chat" | "code">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [leftSidebarSearch, setLeftSidebarSearch] = useState("");

  const navigationItems = [
    {
      label: "Code",
      icon: Code,
      path: "/",
      isActive: pathname === "/" || pathname === "/code",
      onClick: () => {
        dispatch(startNewChat());
        router.push("/");
      },
    },
    {
      label: "Chat",
      icon: MessageSquare,
      path: "/chat",
      isActive: pathname.startsWith("/chat"),
      onClick: () => {
        router.push("/chat");
      },
    },
    {
      label: "Vault",
      icon: Lock,
      path: "/vault",
      isActive: pathname === "/vault",
      onClick: () => {
        if (pathname === "/vault") {
          window.dispatchEvent(
            new CustomEvent("select-secret", { detail: null }),
          );
        }
        router.push("/vault");
      },
    },
    {
      label: "Instructions",
      icon: BookOpen,
      path: "/instructions",
      isActive: pathname === "/instructions",
      onClick: () => {
        router.push("/instructions");
      },
    },
    {
      label: "Guardrails",
      icon: Shield,
      path: "/guardrails",
      isActive: pathname === "/guardrails",
      onClick: () => {
        router.push("/guardrails");
      },
    },
    {
      label: "Repositories",
      icon: Github,
      path: "/repositories",
      isActive: pathname === "/repositories",
      onClick: () => {
        router.push("/repositories");
      },
    },
    {
      label: "Documentation",
      icon: BookOpen,
      path: "/documents",
      isActive: pathname === "/documents",
      onClick: () => {
        router.push("/documents");
      },
    },
  ];

  const filteredNavigationItems = navigationItems.filter((item) =>
    item.label.toLowerCase().includes(leftSidebarSearch.toLowerCase())
  );

  const getPlusTooltipContent = () => {
    if (pathname === "/" || pathname === "/code") return "New Code";
    if (pathname.startsWith("/chat")) return "New Chat";
    if (pathname === "/vault") return "New Vault";
    if (pathname === "/instructions") return "New Instruction";
    if (pathname === "/guardrails") return "New Guardrail";
    if (pathname === "/repositories") return "New Repository";
    if (pathname === "/documents") return "New Documentation";
    return "New";
  };

  const [dataFolders, setDataFolders] = useState<
    { id: string; name: string }[]
  >([]);
  const [instructions, setInstructions] = useState<
    { id: string; name: string }[]
  >([]);
  const repositories = useSelector(
    (state: RootState) => state.system.repositories || [],
  );
  const [guardrails, setGuardrails] = useState<{ id: string; name: string }[]>(
    [],
  );

  // States and dynamic handlers for integrations / connect-apps catalog
  const [apps, setApps] = useState<AppIntegration[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Prefetch all navigation routes on mount to ensure instant, zero-latency page transitions
  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/chat");
    router.prefetch("/agents-showcase");
    router.prefetch("/vault");
    router.prefetch("/cloud");
    router.prefetch("/instructions");
    router.prefetch("/guardrails");
    router.prefetch("/repositories");
    router.prefetch("/documents");
    router.prefetch("/connect-apps");
  }, [router]);

  useEffect(() => {
    setLeftSidebarSearch("");
  }, [pathname]);

  useEffect(() => {
    const handleActiveApp = (e: any) => {
      setSelectedAppId(e.detail?.id || null);
    };
    window.addEventListener("active-connect-app", handleActiveApp);
    return () => window.removeEventListener("active-connect-app", handleActiveApp);
  }, []);

  useEffect(() => {
    if (pathname !== "/connect-apps") return;

    const fetchConnections = async () => {
      if (!token) {
        setApps(FALLBACK_APPS);
        setLoadingApps(false);
        return;
      }

      try {
        // Fetch local active tools first
        let activeTools: any[] = [];
        try {
          const toolsRes = await axios.get(`${API_URL}/mcp/tools/local`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (toolsRes.data && toolsRes.data.success) {
            activeTools = toolsRes.data.data || [];
          }
        } catch (e) {
          console.error("Failed to fetch active tools in sidebar:", e);
        }

        // Fetch custom registered MCP servers
        let customServers: any[] = [];
        try {
          const customRes = await axios.get(`${API_URL}/mcp/custom`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (customRes.data && customRes.data.success) {
            customServers = customRes.data.data || [];
          }
        } catch (e) {
          console.error("Failed to fetch custom servers in sidebar:", e);
        }

        const res = await axios.get(`${API_URL}/mcp/composio/connections`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const connectedIds = new Set(
            res.data.data.map((c: any) =>
              (c.appId || c.toolkit || c.appName || "").toLowerCase(),
            ),
          );

          // Custom MCP Apps
          const customAppsMapped = customServers.map((s: any) => ({
            id: `app-${s.name}`,
            name: s.title,
            description: s.description,
            icon: "solar:server-square-bold",
            color: "bg-white border border-gray-200",
            status: activeTools.some((t: any) => t.server === s.name) ? ("connected" as const) : ("disconnected" as const),
            type: "custom" as const
          }));

          // Standard SaaS & Presets
          const standardAppsMapped = FALLBACK_APPS.map((app) => {
            const slug = app.id.replace("app-", "").toLowerCase();

            if (slug.startsWith("mcp_") || slug.startsWith("mcp_toolbox_")) {
              const active = activeTools.some((t: any) => t.server === slug);
              return { ...app, status: active ? ("connected" as const) : ("disconnected" as const) };
            }

            if (connectedIds.has(slug)) {
              return { ...app, status: "connected" as const };
            }
            if (app.status === "connecting") return app;

            return { ...app, status: "disconnected" as const };
          });

          // Sort all custom + standard apps alphabetically by name
          const otherAppsSorted = [...customAppsMapped, ...standardAppsMapped].sort((a, b) =>
            a.name.localeCompare(b.name)
          );

          setApps(otherAppsSorted);
        }
      } catch (err) {
        console.error("Failed to fetch connections in sidebar:", err);
      } finally {
        setLoadingApps(false);
      }
    };

    // Initialize list
    setApps(FALLBACK_APPS);
    fetchConnections();

    // Listen for sync event to re-fetch connection statuses
    const handleSync = () => {
      fetchConnections();
    };
    window.addEventListener("sync-connect-apps", handleSync);

    return () => {
      window.removeEventListener("sync-connect-apps", handleSync);
    };
  }, [pathname, token]);

  const { data: rulesData } = useQuery({
    queryKey: ["codebase-rules", token, selectedRepo],
    queryFn: async () => {
      if (!token) return { instructions: [], guardrails: [] };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rules`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      return data.success ? data.data : { instructions: [], guardrails: [] };
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // Cache rules for 5 minutes to prevent blocking fetches on page transition
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (rulesData) {
      setInstructions(rulesData.instructions || []);
      setGuardrails(rulesData.guardrails || []);
      setIsInitialLoad(false);
    }
  }, [rulesData]);

  useEffect(() => {
    if (isInitialLoad || !token) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await axios.post(
          `${API_URL}/rules`,
          {
            instructions,
            guardrails
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (err) {
        console.error("Failed to save codebase rules:", err);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [instructions, guardrails, token, isInitialLoad]);

  const documents = useSelector(
    (state: RootState) => state.system.documents || [],
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "instruction" | "guardrail";
  } | null>(null);

  const confirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === "instruction") {
      setInstructions((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    } else if (itemToDelete.type === "guardrail") {
      setGuardrails((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    }
    closeDeleteModal();
    setItemToDelete(null);
  };

  useEffect(() => {
    const handleAddInstruction = (e: any) =>
      setInstructions((prev) => [
        ...prev,
        { id: "inst-" + Date.now(), name: e.detail },
      ]);
    const handleUpdateInstruction = (e: any) =>
      setInstructions((prev) =>
        prev.map((i) =>
          i.id === e.detail.id ? { ...i, name: e.detail.name } : i,
        ),
      );
    const handleDeleteInstruction = (e: any) => {
      setItemToDelete({ id: e.detail, type: "instruction" });
      openDeleteModal();
    };

    const handleAddGuardrail = (e: any) =>
      setGuardrails((prev) => [
        ...prev,
        { id: "gr-" + Date.now(), name: e.detail },
      ]);
    const handleUpdateGuardrail = (e: any) =>
      setGuardrails((prev) =>
        prev.map((i) =>
          i.id === e.detail.id ? { ...i, name: e.detail.name } : i,
        ),
      );
    const handleDeleteGuardrail = (e: any) => {
      setItemToDelete({ id: e.detail, type: "guardrail" });
      openDeleteModal();
    };

    window.addEventListener("add-instruction", handleAddInstruction);
    window.addEventListener("update-instruction", handleUpdateInstruction);
    window.addEventListener("delete-instruction", handleDeleteInstruction);
    window.addEventListener("add-guardrail", handleAddGuardrail);
    window.addEventListener("update-guardrail", handleUpdateGuardrail);
    window.addEventListener("delete-guardrail", handleDeleteGuardrail);


    return () => {
      window.removeEventListener("add-instruction", handleAddInstruction);
      window.removeEventListener("update-instruction", handleUpdateInstruction);
      window.removeEventListener("delete-instruction", handleDeleteInstruction);
      window.removeEventListener("add-guardrail", handleAddGuardrail);
      window.removeEventListener("update-guardrail", handleUpdateGuardrail);
      window.removeEventListener("delete-guardrail", handleDeleteGuardrail);
    };
  }, []);

  const {
    data: aiSessions,
    isLoading,
    error,
    refetch,
  } = useFetchChatHistory(token);

  const sortedChats = aiSessions
    ? [...aiSessions].sort(
        (a, b) =>
          new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime(),
      )
    : [];

  const submitForm = useCallback(
    (sessionId: string) => {
      router.push(`/chat/${sessionId}`);
    },
    [router],
  );

  const getCurrentHistory = () => {
    return currentMode === "code" ? codeHistory : chatHistory;
  };

  const [logoHovered, setLogoHovered] = useState(false);

  const handleLogoMouseEnter = () => {
    if (!isSidebarOpen) {
      setLogoHovered(true);
    }
  };

  const toggleLeftSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const { data: repos = [], isFetching: isRepoLoading } = useQuery({
    queryKey: ["repos", token, repoSearch],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/git/repositories?q=${repoSearch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();

      return data.success ? data.data : [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleRepoSearch = (val: string) => {
    setRepoSearch(val);
  };

  const content = (
    <div className="flex h-full z-20 bg-white dark:bg-[#0A0A0A]">
      {/* Primary Column (Left Side Menu) */}
      <div
        className={cn(
          "flex h-full flex-col transition-all duration-300 bg-[#F4F4F6] dark:bg-[#161616] border-r border-default-200",
          isSidebarOpen ? "w-64" : "w-10",
        )}
      >
        <div
          className={cn(
            "h-[56px] flex items-center justify-between border-b border-default-200",
            isSidebarOpen ? "pr-4" : "px-0 justify-center",
          )}
        >
          <div
            className={cn("flex-1 min-w-0 mr-1", !isSidebarOpen && "hidden")}
          >
            <Dropdown
              className="w-[240px] min-w-[240px] bg-white dark:bg-default-50 border border-default-200 shadow-lg rounded-2xl p-1"
              placement="bottom-start"
            >
              <DropdownTrigger>
                <div className="relative">
                  <div className="flex w-full items-center gap-2 pl-4 pr-3 py-2 rounded-xl hover:bg-default-200 dark:hover:bg-default-300 transition-all border-none group cursor-pointer bg-transparent">
                    <Icon
                      className="size-4 text-default-500 shrink-0"
                      icon="solar:folder-2-linear"
                    />
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <div className="flex items-center w-full">
                        <span className="text-[14px] font-semibold tracking-tight text-default-900 truncate">
                          {selectedRepo}
                        </span>
                        <ChevronDown className="size-3 text-default-400 ml-auto shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Select Workspace"
                className="p-2"
                disabledKeys={isRepoLoading ? ["searching"] : []}
              >
                <DropdownItem
                  key="search-section"
                  isReadOnly
                  className="cursor-default hover:bg-transparent p-0 mb-2"
                >
                  <div className="px-2 py-1 relative">
                    <input
                      autoFocus
                      className="w-full bg-default-100 border border-default-200 rounded-lg px-8 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      placeholder="Search repositories..."
                      value={repoSearch}
                      onChange={(e) => handleRepoSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-default-400" />
                    {isRepoLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </DropdownItem>

                <DropdownItem
                  key="current-header"
                  isReadOnly
                  className="text-[10px] font-bold text-default-400 uppercase tracking-widest px-2 mb-1"
                >
                  Available Repositories
                </DropdownItem>

                {repos.map((repo: any) => (
                  <DropdownItem
                    key={repo.fullName}
                    className="rounded-lg h-10 px-2 hover:bg-primary/5 transition-colors"
                    description={repo.private ? "Private" : "Public"}
                    startContent={
                      <div className="p-1.5 rounded-md bg-default-100 text-default-500">
                        <Icon
                          className="size-3.5"
                          icon="solar:folder-2-linear"
                        />
                      </div>
                    }
                    onClick={() => setSelectedRepo(repo.name)}
                  >
                    <span className="text-xs font-medium text-default-700">
                      {repo.name}
                    </span>
                  </DropdownItem>
                ))}

                {repos.length === 0 && !isRepoLoading && (
                  <DropdownItem
                    key="no-repos"
                    isReadOnly
                    className="text-center py-4 text-xs text-default-400 italic"
                  >
                    No repositories found
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          </div>
          <Button
            isIconOnly
            className="-mr-2 text-default-400 hover:text-default-600"
            size="sm"
            variant="light"
            onClick={toggleLeftSidebar}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>
        </div>

        {/* Search bar and + icon on the same line below the line */}
        <div
          className={cn(
            "px-3 py-3 flex items-center gap-2 border-b border-default-200",
            !isSidebarOpen && "hidden",
          )}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-default-400" />
            <input
              className="w-full bg-white dark:bg-default-100 border border-default-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground"
              placeholder="Search..."
              value={leftSidebarSearch}
              onChange={(e) => setLeftSidebarSearch(e.target.value)}
            />
          </div>
          <Tooltip
            content="App Connections"
            placement="top"
            showArrow
            delay={0}
            closeDelay={0}
            classNames={{
              content: "bg-black text-white px-2 py-1 text-xs rounded-md shadow-lg",
            }}
          >
            <Button
              isIconOnly
              className={cn(
                "border rounded-lg flex-shrink-0",
                pathname === "/connect-apps"
                  ? "bg-primary/10 border-primary text-primary-500 shadow-sm"
                  : "bg-white dark:bg-default-100 border-default-200 text-default-600 hover:text-default-800"
              )}
              size="sm"
              variant="flat"
              onMouseEnter={() => {
                router.prefetch("/connect-apps");
              }}
              onClick={() => {
                router.push("/connect-apps");
              }}
            >
              <LayoutGrid className="size-3.5" />
            </Button>
          </Tooltip>
          <Tooltip
            content="Cloud Connections"
            placement="top"
            showArrow
            delay={0}
            closeDelay={0}
            classNames={{
              content: "bg-black text-white px-2 py-1 text-xs rounded-md shadow-lg",
            }}
          >
            <Button
              isIconOnly
              className={cn(
                "border rounded-lg flex-shrink-0",
                pathname === "/cloud"
                  ? "bg-primary/10 border-primary text-primary-500 shadow-sm"
                  : "bg-white dark:bg-default-100 border-default-200 text-default-600 hover:text-default-800"
              )}
              size="sm"
              variant="flat"
              onMouseEnter={() => {
                router.prefetch("/cloud");
              }}
              onClick={() => {
                router.push("/cloud");
              }}
            >
              <Cloud className="size-3.5" />
            </Button>
          </Tooltip>
          <Tooltip
            content={getPlusTooltipContent()}
            placement="top"
            showArrow
            delay={0}
            closeDelay={0}
            classNames={{
              content: "bg-black text-white px-2 py-1 text-xs rounded-md shadow-lg",
            }}
          >
            <Button
              isIconOnly
              className="bg-white dark:bg-default-100 border border-default-200 rounded-lg text-default-600 flex-shrink-0"
              size="sm"
              variant="flat"
              onMouseEnter={() => {
                if (pathname === "/vault") {
                  router.prefetch("/vault");
                } else if (pathname === "/repositories") {
                  router.prefetch("/repositories");
                } else if (pathname === "/documents") {
                  router.prefetch("/documents");
                } else {
                  router.prefetch("/");
                }
              }}
              onClick={() => {
                if (pathname === "/vault") {
                  window.dispatchEvent(new CustomEvent("open-vault-modal"));
                } else if (pathname === "/repositories") {
                  window.dispatchEvent(
                    new CustomEvent("open-repository-modal"),
                  );
                } else if (pathname === "/documents") {
                  window.dispatchEvent(
                    new CustomEvent("open-document-modal"),
                  );
                } else {
                  dispatch(startNewChat());
                  router.push("/");
                }
              }}
            >
              <Plus className="size-3.5" />
            </Button>
          </Tooltip>
        </div>

        {/* 7 navigation icons toggle container */}
        <div
          className={cn(
            isSidebarOpen
              ? "grid grid-cols-7 gap-0.5 px-2 py-2.5 border-b border-default-200"
              : "flex flex-col items-center gap-2 px-1 pt-2"
          )}
        >
          {filteredNavigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Tooltip
                key={item.label}
                content={item.label}
                placement={isSidebarOpen ? "top" : "right"}
                showArrow
                delay={0}
                closeDelay={0}
                classNames={{
                  content: "bg-black text-white px-2 py-1 text-xs rounded-md shadow-lg",
                }}
              >
                <Button
                  isIconOnly
                  className={cn(
                    "flex items-center justify-center transition-all duration-200 relative group min-w-0 min-h-0",
                    isSidebarOpen ? "h-[30px] w-full rounded-md" : "h-[30px] w-[30px] rounded-md",
                    item.isActive
                      ? "bg-white dark:bg-default-100 border border-default-200 text-default-900 dark:text-white shadow-sm"
                      : "bg-transparent border-none text-default-400 hover:text-default-700 dark:hover:text-default-200",
                  )}
                  onMouseEnter={() => {
                    router.prefetch(item.path);
                  }}
                  onClick={item.onClick}
                >
                  <IconComponent className="size-3.5" />
                  <span className="sr-only">{item.label}</span>
                </Button>
              </Tooltip>
            );
          })}
          {isSidebarOpen && filteredNavigationItems.length === 0 && (
            <div className="col-span-7 text-center py-2 text-xs text-default-400 italic">
              No results found
            </div>
          )}
        </div>

        {!isSidebarOpen && <div className="flex-1" />}

        {isSidebarOpen && (
          <ScrollShadow
            hideScrollBar
            className="flex-1 px-2 mt-1 min-h-0 w-full scrollbar-hide overflow-y-auto"
          >
            {pathname === "/connect-apps" ? (
              <div className="flex flex-1 overflow-y-auto p-1.5 flex-col gap-1 w-full">
                {loadingApps ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Icon className="text-2xl text-primary animate-spin" icon="line-md:loading-twotone-loop" />
                    <span className="text-xs text-default-400">Loading catalog...</span>
                  </div>
                ) : (() => {
                  const filtered = apps.filter((app) =>
                    app.name.toLowerCase().includes(leftSidebarSearch.toLowerCase()) ||
                    app.description.toLowerCase().includes(leftSidebarSearch.toLowerCase())
                  );
                  
                  if (filtered.length === 0) {
                    return <span className="text-xs text-default-400 text-center py-12">No apps found</span>;
                  }

                  return filtered.map((app) => {
                    const isActive = selectedAppId === app.id;
                    return (
                      <button
                        key={app.id}
                        onClick={() => {
                          setSelectedAppId(app.id);
                          window.dispatchEvent(
                            new CustomEvent("select-connect-app", { detail: app })
                          );
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-primary/10 text-primary dark:text-primary-400 font-semibold"
                            : "hover:bg-default-100 dark:hover:bg-default-200/20 text-default-700 dark:text-default-300"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Dynamic Mini App Logo/Icon */}
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-default-200/50 overflow-hidden",
                              isActive ? "bg-white dark:bg-black" : "bg-[#f4f4f5] dark:bg-[#27272a]"
                            )}
                          >
                            <AppIcon app={app} className="w-full h-full object-contain" />
                          </div>
                          <span className="text-xs text-left truncate pr-2">
                            {app.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          {app.status === "connected" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-success" />
                          )}
                          <Icon
                            icon="solar:alt-arrow-right-linear"
                            className={cn(
                              "text-xs text-default-400 transition-transform",
                              isActive ? "translate-x-0.5 text-primary" : ""
                            )}
                          />
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            ) : pathname === "/vault" ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const items = [
                    { id: "sec-1", name: "Primary Build Agent" },
                    { id: "sec-2", name: "Synapse Production Analytics" },
                    { id: "sec-3", name: "Telepathy Inference" },
                  ];
                  const filtered = items.filter((stream) =>
                    stream.name.toLowerCase().includes(leftSidebarSearch.toLowerCase())
                  );
                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon icon="solar:lock-keyhole-minimalistic-linear" className="text-2xl text-default-400 mb-2" />
                        <span className="text-xs text-default-400">
                          {leftSidebarSearch ? "No results found" : "No secrets added yet"}
                        </span>
                      </div>
                    );
                  }
                  return filtered.map((stream) => (
                    <button
                      key={stream.id}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate flex items-center justify-between group"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("select-secret", { detail: stream.id }),
                        )
                      }
                    >
                      <span>{stream.name}</span>
                      <Lock
                        className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        size={14}
                      />
                    </button>
                  ));
                })()}
              </div>
            ) : pathname === "/instructions" ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const filtered = instructions.filter((inst) =>
                    inst.name.toLowerCase().includes(leftSidebarSearch.toLowerCase())
                  );
                  if (instructions.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon icon="solar:document-text-linear" className="text-2xl text-default-400 mb-2" />
                        <span className="text-xs text-default-400">No instructions added yet</span>
                      </div>
                    );
                  }
                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon icon="solar:document-text-linear" className="text-2xl text-default-400 mb-2" />
                        <span className="text-xs text-default-400">No results found</span>
                      </div>
                    );
                  }
                  return filtered.map((inst) => (
                    <div
                      key={inst.id}
                      className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="truncate">{inst.name}</span>
                      <Dropdown
                        className="min-w-[120px] bg-white dark:bg-default-50 border border-default-200 shadow-lg rounded-xl p-1"
                        placement="bottom-end"
                      >
                        <DropdownTrigger>
                          <button className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Instruction options"
                          className="p-0"
                          variant="flat"
                        >
                          <DropdownItem
                            key="edit"
                            className="text-default-700 data-[hover=true]:bg-default-100 data-[hover=true]:text-foreground rounded-lg transition-colors py-2"
                            startContent={
                              <Edit2 className="text-default-500" size={14} />
                            }
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent("edit-instruction", {
                                  detail: inst,
                                }),
                              )
                            }
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger data-[hover=true]:bg-danger/10 data-[hover=true]:text-danger rounded-lg transition-colors py-2"
                            color="danger"
                            startContent={<Trash2 size={14} />}
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent("delete-instruction", {
                                  detail: inst.id,
                                }),
                              )
                            }
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  ));
                })()}
              </div>
            ) : pathname === "/guardrails" ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const filtered = guardrails.filter((gr) =>
                    gr.name.toLowerCase().includes(leftSidebarSearch.toLowerCase())
                  );
                  if (guardrails.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon icon="solar:shield-warning-linear" className="text-2xl text-default-400 mb-2" />
                        <span className="text-xs text-default-400">No guardrails added yet</span>
                      </div>
                    );
                  }
                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon icon="solar:shield-warning-linear" className="text-2xl text-default-400 mb-2" />
                        <span className="text-xs text-default-400">No results found</span>
                      </div>
                    );
                  }
                  return filtered.map((gr) => (
                    <div
                      key={gr.id}
                      className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="truncate">{gr.name}</span>
                      <Dropdown
                        className="min-w-[120px] bg-white dark:bg-default-50 border border-default-200 shadow-lg rounded-xl p-1"
                        placement="bottom-end"
                      >
                        <DropdownTrigger>
                          <button className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Guardrail options"
                          className="p-0"
                          variant="flat"
                        >
                          <DropdownItem
                            key="edit"
                            className="text-default-700 data-[hover=true]:bg-default-100 data-[hover=true]:text-foreground rounded-lg transition-colors py-2"
                            startContent={
                              <Edit2 className="text-default-500" size={14} />
                            }
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent("edit-guardrail", { detail: gr }),
                              )
                            }
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger data-[hover=true]:bg-danger/10 data-[hover=true]:text-danger rounded-lg transition-colors py-2"
                            color="danger"
                            startContent={<Trash2 size={14} />}
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent("delete-guardrail", {
                                  detail: gr.id,
                                }),
                              )
                            }
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  ));
                })()}
              </div>
            ) : pathname === "/repositories" ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const filtered = repositories.filter((repo) =>
                    repo.name.toLowerCase().includes(leftSidebarSearch.toLowerCase())
                  );
                  if (repositories.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon icon="solar:folder-2-linear" className="text-2xl text-default-400 mb-2" />
                        <span className="text-xs text-default-400">No repositories added yet</span>
                      </div>
                    );
                  }
                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon icon="solar:folder-2-linear" className="text-2xl text-default-400 mb-2" />
                        <span className="text-xs text-default-400">No results found</span>
                      </div>
                    );
                  }
                  return filtered.map((repo) => (
                    <div
                      key={repo.id}
                      className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("edit-repository", { detail: repo }),
                        )
                      }
                    >
                      <span className="truncate">{repo.name}</span>
                      <Dropdown
                        className="min-w-[120px] bg-white dark:bg-default-50 border border-default-200 shadow-lg rounded-xl p-1"
                        placement="bottom-end"
                      >
                        <DropdownTrigger>
                          <button className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Repository options"
                          className="p-0"
                          variant="flat"
                        >
                          <DropdownItem
                            key="delete"
                            className="text-danger data-[hover=true]:bg-danger/10 data-[hover=true]:text-danger rounded-lg transition-colors py-2"
                            color="danger"
                            startContent={<Trash2 size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(removeRepository(repo.id));
                            }}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  ));
                })()}
              </div>
            ) : pathname === "/documents" ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const filtered = documents.filter((doc) =>
                    doc.name.toLowerCase().includes(leftSidebarSearch.toLowerCase())
                  );
                  if (documents.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon icon="solar:book-open-linear" className="text-2xl text-default-400 mb-2" />
                        <span className="text-xs text-default-400">No documents added yet</span>
                      </div>
                    );
                  }
                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon icon="solar:book-open-linear" className="text-2xl text-default-400 mb-2" />
                        <span className="text-xs text-default-400">No results found</span>
                      </div>
                    );
                  }
                  return filtered.map((doc) => (
                    <div
                      key={doc.id}
                      className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("edit-document", { detail: doc }),
                        )
                      }
                    >
                      <span className="truncate">{doc.name}</span>
                      <Dropdown
                        className="min-w-[120px] bg-white dark:bg-default-50 border border-default-200 shadow-lg rounded-xl p-1"
                        placement="bottom-end"
                      >
                        <DropdownTrigger>
                          <button className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Document options"
                          className="p-0"
                          variant="flat"
                        >
                          <DropdownItem
                            key="delete"
                            className="text-danger data-[hover=true]:bg-danger/10 data-[hover=true]:text-danger rounded-lg transition-colors py-2"
                            color="danger"
                            startContent={<Trash2 size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(removeDocument(doc.id));
                            }}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  ));
                })()}
              </div>
            ) : pathname === "/cloud" ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 pb-6 w-full">
                {(() => {
                  const groups = [
                    {
                      category: "Hyperscalers",
                      providers: [
                        "Amazon Web Services",
                        "Google Cloud Platform",
                        "Microsoft Azure",
                        "Oracle Cloud",
                        "IBM Cloud",
                      ],
                    },
                    {
                      category: "AI & GPU Compute",
                      providers: [
                        "CoreWeave",
                        "Lambda Labs",
                        "Paperspace",
                        "RunPod",
                        "Together AI",
                      ],
                    },
                    {
                      category: "Developer & PaaS",
                      providers: [
                        "DigitalOcean",
                        "Fly.io",
                        "Heroku",
                        "Railway",
                        "Render",
                        "Supabase",
                        "Vercel",
                        "Kinsta",
                      ],
                    },
                    {
                      category: "Global & Regional",
                      providers: [
                        "Alibaba Cloud",
                        "Baidu AI Cloud",
                        "Huawei Cloud",
                        "OVHcloud",
                        "Scaleway",
                        "Tencent Cloud",
                        "Yandex Cloud",
                        "Sinopec Cloud",
                        "Exoscale",
                      ],
                    },
                    {
                      category: "Bare Metal & Edge",
                      providers: [
                        "Cherry Servers",
                        "Equinix Metal",
                        "Fastly",
                        "Lumen",
                        "MacStadium",
                        "Maxihost",
                        "Rackspace",
                        "Packet",
                        "Cloudflare",
                      ],
                    },
                    {
                      category: "VPS Infrastructure",
                      providers: [
                        "1&1 IONOS",
                        "Atlantic.Net",
                        "Hetzner",
                        "Kamatera",
                        "Linode",
                        "UpCloud",
                        "Vultr",
                        "Hostwinds",
                        "Liquid Web",
                      ],
                    },
                    {
                      category: "Enterprise Clouds",
                      providers: [
                        "Aiven",
                        "Aruba Cloud",
                        "ClearDATA",
                        "Cloudera",
                        "Databricks",
                        "Navisite",
                        "Nutanix",
                        "Red Hat",
                        "Salesforce",
                        "SAP",
                        "Snowflake",
                        "VMware",
                      ],
                    },
                    {
                      category: "Telco & Networking",
                      providers: [
                        "Biznet Networks",
                        "BT Cloud",
                        "Cato Networks",
                        "CenturyLink",
                        "GTS Central Europe",
                        "Megaport",
                        "NTT Communications",
                        "T-Systems",
                        "Zayo",
                      ],
                    },
                  ];

                  const groupRenderData = groups.map((group) => {
                    const filteredProviders = group.providers.filter((provider) =>
                      provider.toLowerCase().includes(leftSidebarSearch.toLowerCase())
                    );
                    return { ...group, providers: filteredProviders };
                  }).filter(group => group.providers.length > 0);

                  if (groupRenderData.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon icon="solar:cloud-linear" className="text-2xl text-default-400 mb-2" />
                        <span className="text-xs text-default-400">
                          {leftSidebarSearch ? "No results found" : "No cloud nodes added yet"}
                        </span>
                      </div>
                    );
                  }

                  return groupRenderData.map((group) => (
                    <div key={group.category} className="mb-4 last:mb-0">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {group.category}
                      </div>
                      {group.providers.map((provider) => (
                        <button
                          key={provider}
                          className="w-full text-left px-3 py-2 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2 truncate"
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent("select-cloud-provider", {
                                detail: provider,
                              }),
                            )
                          }
                        >
                          <Cloud
                            className="text-gray-400 flex-shrink-0"
                            size={14}
                          />
                          <span className="truncate">{provider}</span>
                        </button>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            ) : isLoading ? (
              <div className="space-y-4 px-4 mt-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-4 w-full bg-default-100 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const filtered = sortedChats.filter((item) =>
                    (item?.responses[0]?.prompt || "Untitled Chat").toLowerCase().includes(leftSidebarSearch.toLowerCase())
                  );

                  if (sortedChats.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon
                          icon={pathname === "/" || pathname === "/code" ? "solar:code-square-linear" : "solar:chat-square-linear"}
                          className="text-2xl text-default-400 mb-2"
                        />
                        <span className="text-xs text-default-400">
                          {pathname === "/" || pathname === "/code"
                            ? "No code history yet"
                            : "No chat history yet"}
                        </span>
                      </div>
                    );
                  }

                  if (filtered.length === 0) {
                    return (
                      <div className="px-3 py-8 text-center text-xs text-default-400">
                        No results found
                      </div>
                    );
                  }

                  return filtered.map((item) => (
                    <button
                      key={item?._id}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate"
                      onClick={() => item?.sessionId && submitForm(item?.sessionId)}
                    >
                      {item?.responses[0]?.prompt || "Untitled Chat"}
                    </button>
                  ));
                })()}
              </div>
            )}
          </ScrollShadow>
        )}

        <div
          className={cn(
            "mt-auto",
            isSidebarOpen ? "px-5 pb-5 pt-4" : "px-1 pb-4 pt-4",
          )}
        >
          {status === "unauthenticated" ? (
            <div className={cn("flex gap-2", !isSidebarOpen && "hidden")}>
              <Button
                className="flex-1 h-9 bg-black text-white text-[11px] font-bold tracking-wider uppercase rounded-xl"
                onClick={() => onOpen({ type: "login" })}
              >
                Login
              </Button>
              <Button
                className="flex-1 h-9 bg-black text-white text-[11px] font-bold tracking-wider uppercase rounded-xl"
                onClick={() => onOpen({ type: "register" })}
              >
                Register
              </Button>
            </div>
          ) : (
            <div className={cn("flex w-full", !isSidebarOpen && "hidden")}>
              <MyAccountDropdown />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    return (
      <div className="flex h-full border-r border-default-200 bg-white dark:bg-[#0A0A0A] w-[56px] transition-all" />
    );
  }

  return (
    <div className="flex h-full border-r border-default-200">
      {content}
      <Modal
        backdrop="opaque"
        classNames={{ backdrop: "bg-black/20 backdrop-blur-sm" }}
        isOpen={isDeleteModalOpen}
        size="sm"
        onClose={closeDeleteModal}
      >
        <ModalContent className="bg-white dark:bg-default-50 border border-default-200 shadow-2xl rounded-2xl p-2">
          <ModalHeader className="flex flex-col gap-1 text-black dark:text-white">
            Confirm Deletion
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this item?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-xl transition-colors"
              onPress={closeDeleteModal}
            >
              Cancel
            </Button>
            <Button
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors"
              onPress={confirmDelete}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>



    </div>
  );
}
