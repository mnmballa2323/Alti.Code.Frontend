"use client";

import type { ThemeProviderProps } from "next-themes";

import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import * as React from "react";
import { Toaster } from "react-hot-toast";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import { SessionProvider, useSession, signIn } from "next-auth/react";

import { store } from "@/store";
import { getUserData } from "@/lib/user";
import { userController } from "@/store/userSlice";
import { TRPCProvider } from "@/components/providers/TRPCProvider";
import { PersistentLayout } from "@/components/ChatbotLayout";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

const getSiblingSsoUrl = () => {
  if (typeof window === "undefined") return null;
  const host = window.location.host;

  if (host.includes("localhost:3000")) {
    return "http://localhost:3005/auth/sso-iframe";
  }
  if (host.includes("localhost:3005")) {
    return "http://localhost:3000/auth/sso-iframe";
  }
  if (host.includes("insocode.com")) {
    return "https://www.inso.ai/auth/sso-iframe";
  }
  if (host.includes("inso.ai")) {
    return "https://www.insocode.com/auth/sso-iframe";
  }

  return null;
};

// Get the user:-
function UserFetcher({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const [ssoAttempted, setSsoAttempted] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    const accessToken = session?.user?.accessToken ?? null;

    if (typeof window !== "undefined") {
      const isTauri =
        "__TAURI__" in window ||
        "__TAURI_INTERNALS__" in window ||
        "electron" in window ||
        window.navigator.userAgent.includes("Electron");

      if (accessToken) {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("accessToken", accessToken);
      } else if (!isTauri) {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
      }
    }

    if (accessToken) {
      getUserData(accessToken)
        .then((data) => {
          if (data?.success === true) {
            dispatch(userController.actions.setUserProfile(data.data));
          }
        })
        .catch((err) => console.error("Error fetching user:", err));
    }
  }, [session, dispatch]);

  // Silent SSO Verification Check
  React.useEffect(() => {
    if (status !== "unauthenticated" || ssoAttempted) return;

    const siblingSsoUrl = getSiblingSsoUrl();

    if (!siblingSsoUrl) return;

    setSsoAttempted(true);
    const siblingOrigin = new URL(siblingSsoUrl).origin;

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== siblingOrigin) return;

      if (event.data?.type === "INSO_SSO_IFRAME_READY") {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "INSO_SSO_CHECK" },
          siblingOrigin,
        );
      } else if (event.data?.type === "INSO_SSO_RESPONSE") {
        if (event.data.status === "authenticated" && event.data.token) {
          console.log(
            "🔐 [SSO] Silent sibling authentication session found, signing in...",
          );
          try {
            await signIn("credentials", {
              redirect: false,
              accessToken: event.data.token,
            });
          } catch (err) {
            console.error("❌ [SSO] Silent sign-in error:", err);
          }
        }
        cleanup();
      }
    };

    window.addEventListener("message", handleMessage);

    const iframe = document.createElement("iframe");

    iframe.src = siblingSsoUrl;
    iframe.style.display = "none";
    iframe.id = "sso-silent-iframe";
    document.body.appendChild(iframe);
    iframeRef.current = iframe;

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      if (document.getElementById("sso-silent-iframe")) {
        document.body.removeChild(iframe);
      }
    };

    const timeoutId = setTimeout(() => {
      cleanup();
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [status, ssoAttempted]);

  const isAuthRoute = ![
    "/",
    "/login",
    "/register",
    "/auth/sso-iframe",
  ].includes(pathname);

  if (isAuthRoute) {
    return <PersistentLayout>{children}</PersistentLayout>;
  }

  return <>{children}</>;
}

function ThemeSynchronizer() {
  const { theme } = useTheme();

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;

    if (theme === "midnight-navy") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    }
  }, [theme]);

  return null;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [tauriSession, setTauriSession] = React.useState<any>(() => {
    if (
      typeof window !== "undefined" &&
      ("__TAURI__" in window ||
        "__TAURI_INTERNALS__" in window ||
        "electron" in window ||
        window.navigator.userAgent.includes("Electron"))
    ) {
      const token = localStorage.getItem("accessToken");

      if (token) {
        return {
          user: {
            accessToken: token,
          },
          expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        };
      }
    }

    return undefined;
  });

  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("__TAURI__" in window ||
        "__TAURI_INTERNALS__" in window ||
        "electron" in window ||
        window.navigator.userAgent.includes("Electron"))
    ) {
      const token = localStorage.getItem("accessToken");

      if (token) {
        setTauriSession({
          user: {
            accessToken: token,
          },
          expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        });
        if (pathname === "/login" || pathname === "/") {
          router.replace("/new-chat");
        }
      } else {
        setTauriSession(null);
        if (pathname !== "/login") {
          router.replace("/login");
        }
      }
    }
  }, [pathname, router]);

  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
      session={tauriSession}
    >
      <ReduxProvider store={store}>
        <HeroUIProvider navigate={router.push}>
          <Toaster position="top-center" reverseOrder={false} />
          <NextThemesProvider {...themeProps}>
            <TRPCProvider>
              <UserFetcher>
                <ThemeSynchronizer />
                {children}
              </UserFetcher>
            </TRPCProvider>
          </NextThemesProvider>
        </HeroUIProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
