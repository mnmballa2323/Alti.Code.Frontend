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
} from "@heroui/react";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  Search,
  ChevronDown,
  Blocks,
  Workflow,
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
  Rocket,
  Terminal,
  Lock,
  Globe,
  Cloud,
  CheckCircle,
  ShieldAlert,
  Github,
  ImageIcon,
  PenTool,
  Boxes,
  Users,
  Briefcase,
  Activity,
  Cpu,
  ShieldCheck,
  Landmark,
  Megaphone,
  Server,
  Layout,
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
  removeAsset,
} from "@/store/systemSlice";
import { RootState } from "@/store";
import { useModalStore } from "@/store/useModalStore";
import useFetchChatHistory from "@/hooks/useFetchChatHistory";
import {
  sendMessage,
  setChatContext,
  startNewChat,
  addPendingRoom,
} from "@/store/messagesSlice";
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

  const getHistoryTitle = () => {
    if (pathname?.startsWith("/boardroom")) return "Board Members";
    if (pathname?.startsWith("/chat/")) return "Chat";

    switch (pathname) {
      case "/":
        return "Code";
      case "/design":
        return "Design";
      case "/search":
        return "Search";
      case "/chat":
        return "Chat";
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
      case "/workflows":
        return "Automations";
      case "/workflow-builder":
        return "Canvas";
      case "/architecture":
        return "Architecture";
      case "/deployments":
        return "Deployments";
      case "/domains":
        return "Domains";
      case "/logs":
        return "Logs";

      case "/testing":
        return "Test";
      case "/security":
        return "Security";
      case "/vault":
        return "Vault";
      case "/assets":
        return "Assets";
      case "/cloud":
        return "Cloud";
      case "/research":
        return "Research";

      default:
        return "Code";
    }
  };
  // const dispatch = useDispatch();
  const [currentMode, setCurrentMode] = useState<"chat" | "code">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSecondarySidebarOpen, setIsSecondarySidebarOpen] = useState(true);
  const toggleSecondarySidebar = () =>
    setIsSecondarySidebarOpen(!isSecondarySidebarOpen);
  const [activeBoardroomTab, setActiveBoardroomTab] = useState<"agents" | "rooms">(
    pathname?.startsWith("/boardroom/meeting") ? "rooms" : "agents"
  );
  const [isNewWorkflowModalOpen, setIsNewWorkflowModalOpen] = useState(false);
  const [isBoardroomMeetingModalOpen, setIsBoardroomMeetingModalOpen] = useState(false);
  const [selectedMeetingAgents, setSelectedMeetingAgents] = useState<string[]>([]);
  const [meetingName, setMeetingName] = useState("");
  const pendingRooms = useSelector((state: RootState) => state.messages.pendingRooms || []);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [dataFolders, setDataFolders] = useState<
    { id: string; name: string }[]
  >([]);
  const [testSessions, setTestSessions] = useState<
    { id: string; name: string }[]
  >([]);
  const [securitySessions, setSecuritySessions] = useState<
    { id: string; name: string }[]
  >([]);
  const [researchSessions, setResearchSessions] = useState<
    { id: string; name: string }[]
  >([
    { id: "RES-1002", name: "Zero-Trust Architecture Audit" },
    { id: "RES-1001", name: "AWS to GCP Migration Strategy" },
  ]);
  const [instructions, setInstructions] = useState<
    { id: string; name: string }[]
  >([]);
  const repositories = useSelector(
    (state: RootState) => state.system.repositories || [],
  );
  const [guardrails, setGuardrails] = useState<{ id: string; name: string }[]>(
    [],
  );

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
  const assets = useSelector((state: RootState) => state.system.assets || []);
  const [domains, setDomains] = useState<{ id: string; name: string }[]>([]);
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

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) return;
    setIsCreatingWorkflow(true);

    try {
      const res = await axios.post(
        `${API_URL}/workflows`,
        { name: newWorkflowName },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken || ""}`,
          },
        },
      );

      setIsNewWorkflowModalOpen(false);
      window.dispatchEvent(
        new CustomEvent("init-new-workflow", {
          detail: res.data?.data?.name || newWorkflowName,
        }),
      );
      router.push("/workflow-builder");
      setNewWorkflowName("");
    } catch (err) {
      console.error("Failed to create workflow via API:", err);
      // Fallback
      setIsNewWorkflowModalOpen(false);
      window.dispatchEvent(
        new CustomEvent("init-new-workflow", { detail: newWorkflowName }),
      );
      router.push("/workflow-builder");
      setNewWorkflowName("");
    } finally {
      setIsCreatingWorkflow(false);
    }
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

    const handleOpenMeetingModal = () => setIsBoardroomMeetingModalOpen(true);
    window.addEventListener("open-boardroom-meeting-modal", handleOpenMeetingModal);

    return () => {
      window.removeEventListener("add-instruction", handleAddInstruction);
      window.removeEventListener("update-instruction", handleUpdateInstruction);
      window.removeEventListener("delete-instruction", handleDeleteInstruction);
      window.removeEventListener("add-guardrail", handleAddGuardrail);
      window.removeEventListener("update-guardrail", handleUpdateGuardrail);
      window.removeEventListener("delete-guardrail", handleDeleteGuardrail);
      window.removeEventListener("open-boardroom-meeting-modal", handleOpenMeetingModal);
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

  const [repoSearch, setRepoSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("alti.code.studio");

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
          "flex h-full flex-col transition-all duration-300 border-r border-default-200",
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

        <div className="pt-2 flex-1 overflow-y-auto overflow-x-hidden">
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/" || pathname === "/code"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              dispatch(startNewChat());
              router.push("/");
            }}
          >
            <Code className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Code
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname.startsWith("/chat")
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/chat");
            }}
          >
            <MessageSquare className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Chat
            </span>
          </button>

          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/design"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              dispatch(startNewChat());
              router.push("/design");
            }}
          >
            <PenTool className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Design
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/workflow-builder"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/workflow-builder");
            }}
          >
            <Waypoints className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Canvas
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/search"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/search");
            }}
          >
            <Search className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Search
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/graph"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/graph");
            }}
          >
            <Network className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Graph
            </span>
          </button>

          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/testing"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/testing");
            }}
          >
            <CheckCircle className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Test
            </span>
          </button>

          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/logs"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/logs");
            }}
          >
            <Terminal className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Logs
            </span>
          </button>



          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/vault"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              if (pathname === "/vault") {
                window.dispatchEvent(
                  new CustomEvent("select-secret", { detail: null }),
                );
              }
              router.push("/vault");
            }}
          >
            <Lock className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Vault
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/cloud"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/cloud");
            }}
          >
            <Cloud className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Cloud
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/assets"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/assets");
            }}
          >
            <ImageIcon className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Assets
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/security"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/security");
            }}
          >
            <ShieldAlert className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Security
            </span>
          </button>

          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/domains"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/domains");
            }}
          >
            <Globe className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Domains
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/research"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/research");
            }}
          >
            <Search className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Research
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/instructions"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/instructions");
            }}
          >
            <BookOpen className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Instructions
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/guardrails"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/guardrails");
            }}
          >
            <Shield className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Guardrails
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/repositories"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/repositories");
            }}
          >
            <Github className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Repositories
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/documents"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/documents");
            }}
          >
            <BookOpen className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Documentation
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/connect-apps"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/connect-apps");
            }}
          >
            <Blocks className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Integrations
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/workflows"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/workflows");
            }}
          >
            <Workflow className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Automations
            </span>
          </button>

          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/architecture"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/architecture");
            }}
          >
            <Boxes className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Architecture
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname === "/deployments"
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/deployments");
            }}
          >
            <Rocket className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Deployments
            </span>
          </button>
          <button
            className={cn(
              "flex h-11 w-full items-center justify-start text-sm rounded-xl px-4 transition-colors",
              pathname.startsWith("/boardroom")
                ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium"
                : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5",
              !isSidebarOpen && "px-0 justify-center min-w-auto",
            )}
            onClick={() => {
              router.push("/boardroom");
            }}
          >
            <Users className={cn("size-4", isSidebarOpen && "mr-2")} />
            <span
              className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
            >
              Boardroom
            </span>
          </button>
        </div>

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

      {/* Secondary Column (Right Side Menu for History) */}
      <div
        className={cn(
          "flex h-full flex-col transition-all duration-300 bg-default-50/50 dark:bg-black/20 border-r border-default-200",
          isSecondarySidebarOpen ? "w-64" : "w-10",
          pathname === "/graph" && "hidden"
        )}
      >
        <div
          className={cn(
            "h-[56px] flex items-center border-b border-default-200",
            isSecondarySidebarOpen
              ? "px-4 justify-between min-w-[256px]"
              : "px-0 justify-center",
          )}
        >
          <span
            className={cn(
              "text-[14px] font-semibold tracking-tight text-default-900 truncate",
              !isSecondarySidebarOpen && "hidden",
            )}
          >
            {getHistoryTitle()}
          </span>
          <Button
            isIconOnly
            className={cn(
              isSecondarySidebarOpen
                ? "-mr-2 text-default-400 hover:text-default-600"
                : "",
            )}
            size="sm"
            variant="light"
            onClick={toggleSecondarySidebar}
          >
            {isSecondarySidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>
        </div>

        {/* Search bar and + icon on the same line below the line */}
        <div
          className={cn(
            "px-3 py-3 flex items-center gap-2 border-b border-default-200 min-w-[256px]",
            !isSecondarySidebarOpen && "hidden",
          )}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-default-400" />
            <input
              className="w-full bg-default-50 dark:bg-default-100 border border-default-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              placeholder="Search..."
            />
          </div>
          {pathname !== "/instructions" &&
            pathname !== "/guardrails" &&
            pathname !== "/cloud" && (
              <>

                <Button
                  isIconOnly
                  className="bg-default-50 dark:bg-default-100 border border-default-200 rounded-lg text-default-600 flex-shrink-0"
                  size="sm"
                  title="New"
                  variant="flat"
                  onClick={() => {
                    if (
                      pathname === "/workflows" ||
                      pathname === "/workflow-builder"
                    ) {
                      setIsNewWorkflowModalOpen(true);
                    } else if (pathname === "/vault") {
                      window.dispatchEvent(new CustomEvent("open-vault-modal"));
                    } else if (pathname === "/domains") {
                      window.dispatchEvent(new CustomEvent("open-domain-modal"));
                    } else if (pathname === "/testing") {
                      const newTest = {
                        id: "test-" + Date.now(),
                        name: "New Test Session",
                      };

                      setTestSessions((prev) => [...prev, newTest]);
                      window.dispatchEvent(
                        new CustomEvent("select-test-session", {
                          detail: newTest.name,
                        }),
                      );
                    } else if (pathname === "/security") {
                      const newAudit = {
                        id: "sec-" + Date.now(),
                        name: "New Security Audit",
                      };

                      setSecuritySessions((prev) => [...prev, newAudit]);
                      window.dispatchEvent(
                        new CustomEvent("select-security-session", {
                          detail: newAudit.name,
                        }),
                      );
                    } else if (pathname === "/research") {
                      window.dispatchEvent(
                        new CustomEvent("select-research-session", {
                          detail: null, // null means "New Mission"
                        }),
                      );
                    } else if (pathname === "/repositories") {
                      window.dispatchEvent(
                        new CustomEvent("open-repository-modal"),
                      );
                    } else if (pathname === "/documents") {
                      window.dispatchEvent(
                        new CustomEvent("open-document-modal"),
                      );
                    } else if (pathname === "/assets") {
                      window.dispatchEvent(new CustomEvent("open-asset-modal"));
                    } else if (pathname.startsWith("/boardroom")) {
                      setIsBoardroomMeetingModalOpen(true);
                    } else {
                      dispatch(startNewChat());
                      router.push("/");
                    }
                  }}
                >
                  <Plus className="size-3.5" />
                </Button>
              </>
            )}
        </div>

        <ScrollShadow
          hideScrollBar
          className="flex-1 px-2 mt-1 min-w-[256px] scrollbar-hide"
        >
          {pathname === "/testing" ? (
            <div className="flex flex-col gap-0.5 px-2 mt-2">
              {testSessions.map((session) => (
                <button
                  key={session.id}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate flex items-center justify-between group"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("select-test-session", {
                        detail: session.name,
                      }),
                    );
                  }}
                >
                  <span>{session.name}</span>
                  <CheckCircle
                    className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    size={14}
                  />
                </button>
              ))}
              {testSessions.length === 0 && (
                <div className="text-center py-4 text-xs text-default-400 italic" />
              )}
            </div>
          ) : pathname === "/security" ? (
            <div className="flex flex-col gap-0.5 px-2 mt-2">
              {securitySessions.map((session) => (
                <button
                  key={session.id}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate flex items-center justify-between group"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("select-security-session", {
                        detail: session.name,
                      }),
                    );
                  }}
                >
                  <span>{session.name}</span>
                  <ShieldAlert
                    className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    size={14}
                  />
                </button>
              ))}
              {securitySessions.length === 0 && (
                <div className="text-center py-4 text-xs text-default-400 italic" />
              )}
            </div>
          ) : pathname === "/research" ? (
            <div className="flex flex-col gap-0.5 px-2 mt-2">
              {researchSessions.map((session) => (
                <button
                  key={session.id}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate flex items-center justify-between group"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("select-research-session", {
                        detail: session,
                      }),
                    );
                  }}
                >
                  <span className="truncate pr-2">{session.name}</span>
                  <CheckCircle
                    className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    size={14}
                  />
                </button>
              ))}
            </div>
          ) : pathname === "/workflows" || pathname === "/workflow-builder" ? (
            <div className="flex flex-col gap-0.5 px-2 mt-2">
              {[
                { id: "wf-1", name: "Daily Standup Summary" },
                { id: "wf-2", name: "GitHub PR Auto-Reviewer" },
              ].map((wf) => (
                <button
                  key={wf.id}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("select-workflow", { detail: wf.id }),
                    )
                  }
                >
                  {wf.name}
                </button>
              ))}
            </div>
          ) : pathname === "/logs" ? (
            <div className="flex flex-col gap-0.5 px-2 mt-2">
              {[
                { id: "log-1", name: "System (OS-Bridge)" },
                { id: "log-2", name: "Background Swarm" },
                { id: "log-3", name: "Security & DLP" },
                { id: "log-4", name: "MCP Gateway" },
              ].map((stream) => (
                <button
                  key={stream.id}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate flex items-center justify-between group"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("select-log-session", {
                        detail: stream.name,
                      }),
                    )
                  }
                >
                  <span>{stream.name}</span>
                  <Terminal
                    className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    size={14}
                  />
                </button>
              ))}
            </div>
          ) : pathname === "/vault" ? (
            <div className="flex flex-col gap-0.5 px-2 mt-2">
              {[
                { id: "sec-1", name: "Primary Build Agent" },
                { id: "sec-2", name: "Synapse Production Analytics" },
                { id: "sec-3", name: "Telepathy Inference" },
              ].map((stream) => (
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
              ))}
            </div>
          ) : pathname === "/instructions" ? (
            <div className="flex flex-col gap-0.5 px-2 mt-2">
              {instructions.map((inst) => (
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
              ))}
              {instructions.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400">
                  No instructions added yet.
                </div>
              )}
            </div>
          ) : pathname === "/guardrails" ? (
            <div className="flex flex-col gap-0.5 px-2 mt-2">
              {guardrails.map((gr) => (
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
              ))}
              {guardrails.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400">
                  No guardrails added yet.
                </div>
              )}
            </div>
          ) : pathname === "/repositories" ? (
            <div className="flex flex-col gap-0.5 px-2 mt-2">
              {repositories.map((repo) => (
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
                      <button className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
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
              ))}
              {repositories.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400">
                  No repositories added yet.
                </div>
              )}
            </div>
          ) : pathname === "/documents" ? (
            <div className="flex flex-col gap-0.5 px-2 mt-2">
              {documents.map((doc) => (
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
                      <button className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
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
              ))}
              {documents.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400">
                  No documents added yet.
                </div>
              )}
            </div>
          ) : pathname === "/assets" ? (
            <div className="flex flex-col gap-0.5 px-2 mt-2">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("edit-asset", { detail: asset }),
                    )
                  }
                >
                  <span className="truncate">{asset.name}</span>
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
                      aria-label="Asset options"
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
                          dispatch(removeAsset(asset.id));
                        }}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              ))}
              {assets.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400">
                  No assets added yet.
                </div>
              )}
            </div>
          ) : pathname === "/cloud" ? (
            <div className="flex flex-col gap-0.5 px-2 mt-2 pb-6">
              {[
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
              ].map((group) => (
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
              ))}
            </div>
          ) : pathname === "/domains" ? (
            <div className="flex flex-col gap-0.5 px-2 mt-2">
              {domains.map((dom) => (
                <div
                  key={dom.id}
                  className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("select-domain", { detail: dom }),
                    )
                  }
                >
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="truncate">{dom.name}</span>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      className="min-w-[120px] bg-white dark:bg-default-50 border border-default-200 shadow-lg rounded-xl p-1"
                      placement="bottom-end"
                    >
                      <DropdownTrigger>
                        <button className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1">
                          <MoreHorizontal size={16} />
                        </button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Domain options"
                        className="p-0"
                        variant="flat"
                      >
                        <DropdownItem
                          key="delete"
                          className="text-danger data-[hover=true]:bg-danger/10 data-[hover=true]:text-danger rounded-lg transition-colors py-2"
                          color="danger"
                          startContent={<Trash2 size={14} />}
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("delete-domain", {
                                detail: dom.id,
                              }),
                            );
                            window.dispatchEvent(
                              new CustomEvent("domain-deleted-cleanup", {
                                detail: dom.id,
                              }),
                            );
                          }}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              ))}
              {domains.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400">
                  No domains configured yet.
                </div>
              )}
            </div>
          ) : pathname?.startsWith("/boardroom") ? (
            <div className="flex flex-col w-full h-full">
              <div className="px-3 pb-2 pt-1 border-b border-default-200 sticky top-0 bg-white dark:bg-background z-10">
                <div className="flex p-0.5 bg-default-100 dark:bg-default-50/50 rounded-lg">
                  <button
                    className={cn(
                      "flex-1 text-[11px] font-semibold py-1.5 rounded-md transition-all tracking-wide uppercase",
                      activeBoardroomTab === "agents"
                        ? "bg-zinc-700 shadow-sm text-white"
                        : "text-default-500 hover:text-default-700"
                    )}
                    onClick={() => setActiveBoardroomTab("agents")}
                  >
                    Agents
                  </button>
                  <button
                    className={cn(
                      "flex-1 text-[11px] font-semibold py-1.5 rounded-md transition-all tracking-wide uppercase",
                      activeBoardroomTab === "rooms"
                        ? "bg-zinc-700 shadow-sm text-white"
                        : "text-default-500 hover:text-default-700"
                    )}
                    onClick={() => setActiveBoardroomTab("rooms")}
                  >
                    Rooms
                  </button>
                </div>
              </div>

              <div className="flex flex-col px-2 mt-4 pb-4 space-y-4">
                {activeBoardroomTab === "agents" && [
                  {
                    name: "Governance",
                    execs: [
                      { id: "chairman", name: "Chairman", icon: Crown },
                      { id: "counsel", name: "Lawyer", icon: Scale },
                      { id: "accountant", name: "Accountant", icon: Calculator },
                    ],
                  },
                  {
                    name: "Strategy",
                    execs: [
                      { id: "ceo", name: "CEO", icon: Briefcase },
                      { id: "coo", name: "COO", icon: Activity },
                      { id: "cfo", name: "CFO", icon: Landmark },
                      { id: "cmo", name: "CMO", icon: Megaphone },
                      { id: "cro", name: "CRO", icon: TrendingUp },
                    ],
                  },
                  {
                    name: "Architecture",
                    execs: [
                      { id: "cto", name: "CTO", icon: Cpu },
                      { id: "ciso", name: "CISO", icon: ShieldCheck },
                      { id: "dba", name: "Database Admin", icon: Database },
                      { id: "ai", name: "AI Engineer", icon: Bot },
                    ],
                  },
                  {
                    name: "Execution",
                    execs: [
                      { id: "pm", name: "Product Manager", icon: Target },
                      { id: "scrum", name: "Scrum Master", icon: ListTodo },
                      { id: "designer", name: "UX/UI Designer", icon: Palette },
                    ],
                  },
                  {
                    name: "Delivery",
                    execs: [
                      { id: "frontend", name: "Frontend Developer", icon: Layout },
                      { id: "backend", name: "Backend Developer", icon: Server },
                      { id: "devops", name: "DevOps Engineer", icon: Settings2 },
                    ],
                  },
                  {
                    name: "Quality & Support",
                    execs: [
                      { id: "qa", name: "QA Engineer", icon: Bug },
                      { id: "writer", name: "Technical Writer", icon: FileText },
                      { id: "support", name: "Support Engineer", icon: LifeBuoy },
                    ],
                  },
                ].map((category) => (
                  <div key={category.name} className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest px-3 mb-1">
                      {category.name}
                    </span>
                    {category.execs.map((exec) => (
                      <button
                        key={exec.id}
                        className={cn(
                          "w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl text-[13px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate",
                          pathname === `/boardroom/${exec.id}` ? "bg-black/5 dark:bg-white/5 text-default-900 font-medium" : "text-gray-600 dark:text-gray-300"
                        )}
                        onClick={() => {
                          dispatch(startNewChat());
                          router.push(`/boardroom/${exec.id}`);
                        }}
                      >
                        <exec.icon size={14} className={cn("flex-shrink-0", pathname === `/boardroom/${exec.id}` ? "text-default-900" : "text-gray-400")} />
                        <span className="truncate">{exec.name}</span>
                      </button>
                    ))}
                  </div>
                ))}
                {activeBoardroomTab === "rooms" && (
                  <div className="flex flex-col gap-0.5 px-1">
                    {(() => {
                      const dbRoomSessions = aiSessions ? [...aiSessions].filter(chat => chat.sessionId?.startsWith("room_")) : [];
                      
                      // Merge db rooms and pending rooms, ensuring no duplicates by sessionId
                      const allRoomsMap = new Map();
                      
                      // Add pending rooms first (they might be newer)
                      pendingRooms.forEach(room => {
                        allRoomsMap.set(room.sessionId, room);
                      });
                      
                      // Add DB rooms, which will overwrite pending rooms if they have the same sessionId (meaning they are now saved)
                      dbRoomSessions.forEach(room => {
                        allRoomsMap.set(room.sessionId, room);
                      });

                      const roomSessions = Array.from(allRoomsMap.values());

                      return roomSessions.length > 0 ? (
                        roomSessions
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((room) => (
                            <button
                              key={room._id}
                              className={cn(
                                "w-full text-left px-3 py-2.5 rounded-xl text-[13px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate",
                                pathname === `/boardroom/meeting/${room.sessionId}` ? "bg-black/5 dark:bg-white/5 text-default-900 font-medium" : "text-gray-600 dark:text-gray-300"
                              )}
                              onClick={() => {
                                dispatch(startNewChat());
                                router.push(`/boardroom/meeting/${room.sessionId}?name=${encodeURIComponent(room.responses?.[0]?.prompt || "Boardroom Meeting")}`);
                              }}
                            >
                              <span className="truncate">{room.responses?.[0]?.prompt || "Untitled Board Meeting"}</span>
                            </button>
                          ))
                      ) : (
                        <div className="text-xs text-default-400 text-center py-4">No rooms created yet.</div>
                      );
                    })()}
                  </div>
                )}
              </div>
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
            <div className="flex flex-col gap-0.5 px-2 mt-2">
              {sortedChats.map((item) => (
                <button
                  key={item?._id}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate"
                  onClick={() => item?.sessionId && submitForm(item?.sessionId)}
                >
                  {item?.responses[0]?.prompt || "Untitled Chat"}
                </button>
              ))}
            </div>
          )}
        </ScrollShadow>
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

      <Modal
        backdrop="opaque"
        classNames={{ backdrop: "bg-black/20 backdrop-blur-sm" }}
        isOpen={isNewWorkflowModalOpen}
        size="sm"
        onClose={() => setIsNewWorkflowModalOpen(false)}
      >
        <ModalContent className="bg-white dark:bg-default-50 border border-default-200 shadow-2xl rounded-2xl p-2">
          <ModalHeader className="flex flex-col gap-1 text-black dark:text-white">
            New Workflow
          </ModalHeader>
          <ModalBody>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">
              Workflow Name
            </label>
            <input
              autoFocus
              className="w-full px-3 py-2 border border-default-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-black"
              placeholder="e.g. User Onboarding"
              type="text"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newWorkflowName.trim()) {
                  handleCreateWorkflow();
                }
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-xl transition-colors"
              onPress={() => setIsNewWorkflowModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              isDisabled={!newWorkflowName.trim() || isCreatingWorkflow}
              isLoading={isCreatingWorkflow}
              onPress={handleCreateWorkflow}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isBoardroomMeetingModalOpen}
        onClose={() => setIsBoardroomMeetingModalOpen(false)}
        size="2xl"
      >
        <ModalContent className="bg-white dark:bg-default-50 border border-default-200 shadow-2xl rounded-2xl p-2">
          <ModalHeader className="flex flex-col gap-1 text-black dark:text-white">
            <h2 className="text-xl font-bold tracking-tight">Call a Board Meeting</h2>
            <p className="text-sm text-default-500 font-normal">
              Select the executive experts you want to invite to this roundtable discussion.
            </p>
          </ModalHeader>
          <ModalBody className="pb-4 overflow-hidden">
            <div className="flex flex-col gap-1 mb-2">
              <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Meeting Name
              </label>
              <input
                className="w-full px-3 py-2 border border-default-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-black"
                placeholder="e.g. Q3 Strategy Planning"
                type="text"
                value={meetingName}
                onChange={(e) => setMeetingName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {[
                "Chairman", "CEO", "COO", "CFO", "CMO", "CRO", 
                "General Counsel", "Accountant", "CTO", "CISO", 
                "PM", "UX/UI Designer", "Scrum Master", "DevOps Engineer", 
                "QA Engineer", "Database Admin", "AI Engineer", 
                "Writer", "Support", "Frontend Dev", "Backend Dev"
              ].map((agent) => (
                <div 
                  key={agent}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between",
                    selectedMeetingAgents.includes(agent)
                      ? "border-black bg-black/5 dark:border-white dark:bg-white/10"
                      : "border-default-200 hover:border-default-400"
                  )}
                  onClick={() => {
                    setSelectedMeetingAgents(prev => 
                      prev.includes(agent) ? prev.filter(a => a !== agent) : [...prev, agent]
                    );
                  }}
                >
                  <span className="text-sm font-medium">{agent}</span>
                  <div className={cn(
                    "size-4 rounded-full border flex items-center justify-center",
                    selectedMeetingAgents.includes(agent)
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-default-300"
                  )}>
                    {selectedMeetingAgents.includes(agent) && <CheckCircle size={12} />}
                  </div>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-xl transition-colors"
              onPress={() => setIsBoardroomMeetingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              isDisabled={selectedMeetingAgents.length === 0 || meetingName.trim() === ""}
              onPress={() => {
                setIsBoardroomMeetingModalOpen(false);
                dispatch(startNewChat());
                const roomId = `room_${Date.now()}`;
                
                // Add to pending rooms so it persists in the UI even before the first message is sent
                dispatch(addPendingRoom({
                  _id: "temp_" + roomId,
                  sessionId: roomId,
                  createdAt: new Date().toISOString(),
                  responses: [{ prompt: meetingName }]
                }));

                // Switch the tab to rooms
                setActiveBoardroomTab("rooms");

                router.push(`/boardroom/meeting/${roomId}?agents=${encodeURIComponent(selectedMeetingAgents.join(","))}&name=${encodeURIComponent(meetingName)}`);
              }}
            >
              Start Meeting ({selectedMeetingAgents.length})
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
