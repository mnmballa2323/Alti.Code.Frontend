"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Listbox,
  ListboxItem,
  ListboxSection,
  ScrollShadow,
  Spacer,
  cn,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useState } from "react";

import useFetchChatHistory from "@/hooks/useFetchChatHistory";
import { useModalStore } from "@/store/useModalStore";
import {
  Code2,
  MessageSquare,
  PanelLeftClose,
  Search,
  SquarePen
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import MyAccountDropdown from "./MyAccountDropdown";
import SidebarDrawer from "./sidebar-drawer";

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
  // const dispatch = useDispatch();
  const [currentMode, setCurrentMode] = useState<"chat" | "code">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { data: session, status } = useSession();
  const token = session?.user.accessToken ?? null;

  const {
    data: aiSessions,
    isLoading,
    error,
    refetch,
  } = useFetchChatHistory(token);

  const sortedChats = aiSessions
    ? [...aiSessions].sort(
        (a, b) =>
          new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime()
      )
    : [];

  useEffect(() => {
    refetch();
  }, [refetch]);

  const submitForm = useCallback(
    (sessionId: string) => {
      router.push(`/chat/${sessionId}`);
    },
    [router]
  );

  // Get current history based on mode
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

  const content = (
    <div
      className={cn(
        "flex h-full z-20 flex-1 transition-all duration-300 flex-col py-4 ",
        isSidebarOpen ? "w-72" : "w-10"
      )}
    >
      <div
        className={cn(
          "sticky top-0 z-30 flex items-center justify-between px-4 pt-2",
          !isSidebarOpen && "justify-center"
        )}
      >
        <div
          className={cn(
            "flex flex-none items-center justify-center transition-all duration-300"
          )}
          onMouseEnter={handleLogoMouseEnter}
          onMouseLeave={() => setLogoHovered(false)}
        >
          {logoHovered && !isSidebarOpen ? (
            <PanelLeftClose
              className={cn(
                "size-[21px] cursor-pointer text-black transition-transform duration-300"
              )}
              onClick={toggleLeftSidebar}
            />
          ) : (
            <Link href="/" className="size-[21px]">
              <Image
                src="/assets/logo-icon.png"
                alt="logo"
                height={20}
                width={20}
              />
            </Link>
          )}
        </div>

        <PanelLeftClose
          className={cn(
            "size-5 cursor-pointer text-gray-500 transition-transform duration-300",
            !isSidebarOpen && "hidden"
          )}
          onClick={toggleLeftSidebar}
        />
      </div>
      <Spacer y={6} />
      <div>
        <Button
          className={cn(
            "flex w-full items-center justify-start bg-transparent text-sm text-black dark:text-white shadow-none hover:bg-black/5",
            !isSidebarOpen && "px-0 justify-center min-w-auto"
          )}
          // onClick={() => {
          //   handleNewChat();
          //   if (onAccountOptionSelect) onAccountOptionSelect("chat");
          // }}
        >
          <SquarePen className="size-4" />
          <span
            className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
          >
            <Link href="/">
              <span className="absolute inset-0"></span>
              New chat
            </Link>
          </span>
        </Button>
        <Button
          className={cn(
            "flex w-full items-center justify-start bg-transparent text-sm text-black dark:text-white shadow-none hover:bg-black/5",
            !isSidebarOpen && "px-0 justify-center min-w-auto",
            status === "unauthenticated" && "hidden"
          )}
          onClick={() => {
            onOpen({
              type: "search-chats",
            });
          }}
        >
          <Search className="size-4" />
          <span
            className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
          >
            Search chats
          </span>
        </Button>
        <Button
          className={cn(
            "flex w-full items-center relative justify-start bg-transparent dark:text-white text-sm text-black shadow-none hover:bg-black/5",
            !isSidebarOpen && "px-0 justify-center min-w-auto",
            status === "unauthenticated" && "hidden"
          )}
        >
          <MessageSquare className="size-4" />
          <span
            className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
          >
            <Link href="/saved-chats">
              <span className="absolute inset-0"></span>
              Saved chats
            </Link>
          </span>
        </Button>

        <Button
          className={cn(
            "flex w-full items-center justify-start bg-transparent text-sm text-black dark:text-white shadow-none hover:bg-black/5",
            !isSidebarOpen && "px-0 justify-center min-w-auto",
            status === "unauthenticated" && "hidden"
          )}
        >
          <Code2 className="size-4" />
          <span
            className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
          >
            <Link href="/code">
              <span className="absolute inset-0"></span>
              Code Editor
            </Link>
          </span>
        </Button>
        {/* <Button
          className={cn(
            "flex w-full items-center justify-start bg-transparent text-sm text-black dark:text-white shadow-none hover:bg-black/5",
            !isSidebarOpen && "px-0 justify-center min-w-auto"
          )}
        >
          <Network className="size-4" />
          <span
            className={cn("text-sm font-normal", !isSidebarOpen && "hidden")}
          >
            <Link href="/workflows">
              <span className="absolute inset-0"></span>
              Workflows
            </Link>
          </span>
        </Button> */}
        <div
          className={cn(
            "mt-6 pl-4 text-sm text-gray-500",
            !isSidebarOpen && "hidden",
            status === "unauthenticated" && "hidden"
          )}
        >
          Chat history
        </div>
      </div>
      <ScrollShadow
        className={cn(
          "-mr-6 h-full pr-6",
          !isSidebarOpen && "hidden",
          status === "unauthenticated" && "hidden"
        )}
      >
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((e) => (
            <div
              key={e}
              className="my-3 flex animate-pulse cursor-pointer flex-col rounded-xl bg-gray-300 dark:bg-gray-700 px-4 py-2 shadow dark:bg-n-6 hover:dark:bg-n-5 mx-3 gap-3"
            >
              <div className="flex-1 overflow-hidden">
                <div className="flex h-3 w-[30%] justify-center rounded-xl bg-[#F4F4F5] dark:bg-slate-50" />
              </div>
            </div>
          ))
        ) : (
          <Listbox aria-label="Recent chats" variant="flat">
            <ListboxSection
              classNames={{
                base: "py-0",
                heading:
                  "py-0 pl-[10px] text-small dark:text-default-400 text-black",
              }}
            >
              {sortedChats.map((item, index) => (
                <ListboxItem
                  key={item?._id}
                  className="group h-[44px] px-[12px] py-[10px] dark:text-white text-black"
                  onClick={() => item?.sessionId && submitForm(item?.sessionId)}
                  // endContent={<RecentPromptDropdown />}
                >
                  {item?.responses[0]?.prompt}
                </ListboxItem>
              ))}
            </ListboxSection>
          </Listbox>
        )}
      </ScrollShadow>

      <Spacer y={8} />
      {status === "unauthenticated" && (
        <div className="flex flex-col flex-1"></div>
      )}

      {status === "unauthenticated" ? (
        <div
          className={cn(
            "flex items-center w-full space-x-4 px-4",
            !isSidebarOpen && "hidden"
          )}
        >
          <Button
            onClick={() =>
              // signOut({ callbackUrl: "/" })
              onOpen({
                type: "login",
              })
            }
            className="relative w-full bg-black text-white"
          >
            Login
          </Button>
          <Button
            onClick={() =>
              // signOut({ callbackUrl: "/" })
              onOpen({
                type: "register",
              })
            }
            className="relative w-full bg-black text-white"
          >
            Register
          </Button>
        </div>
      ) : (
        <div className={cn(!isSidebarOpen && "hidden")}>
          <MyAccountDropdown />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex sticky h-screen">
      <SidebarDrawer
        className="flex-none dark:bg-default-50 bg-default-100"
        isOpen={isOpen}
        // onOpenChange={onOpenChange}
      >
        {content}
      </SidebarDrawer>
    </div>
  );
}
