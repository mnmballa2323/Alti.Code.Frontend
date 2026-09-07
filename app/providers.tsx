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
import { SovereignMeshProvider } from "@/components/providers/SovereignMeshProvider";

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

  const isAuthRoute =
    ![
      "/",
      "/login",
      "/register",
      "/auth/sso-iframe",
      "/pricing",
      "/demo",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
      "/cookies",
    ].includes(pathname) && !pathname.startsWith("/clouds/");

  if (isAuthRoute) {
    return <PersistentLayout>{children}</PersistentLayout>;
  }

  return <>{children}</>;
}

function ThemeSynchronizer() {
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("theme", "light");
    setTheme("light");
  }, [setTheme]);

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
    if (typeof window !== "undefined") {
      const isDesktop =
        "__TAURI__" in window ||
        "__TAURI_INTERNALS__" in window ||
        "electron" in window ||
        window.navigator.userAgent.includes("Electron");

      if (isDesktop) {
        const token =
          localStorage.getItem("accessToken") || "desktop-local-token";

        return {
          user: {
            name: "Inso Developer",
            email: "dev@inso.code",
            accessToken: token,
          },
          expires: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        };
      }
    }

    return undefined;
  });
  const [isMounted, setIsMounted] = React.useState(false);

  // Mark as mounted after hydration completes — prevents hydration mismatch
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("__TAURI__" in window ||
        "__TAURI_INTERNALS__" in window ||
        "electron" in window ||
        window.navigator.userAgent.includes("Electron"))
    ) {
      const cookies = document.cookie.split(";");
      const e2eCookie = cookies.find((c) =>
        c.trim().startsWith("e2e-session="),
      );

      if (e2eCookie) {
        try {
          const sessionData = JSON.parse(
            decodeURIComponent(e2eCookie.split("=")[1]),
          );

          setTauriSession({
            user: sessionData,
            expires: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          });
          if (pathname === "/login") {
            router.replace("/chat");
          }

          return;
        } catch (e) {}
      }

      const token =
        localStorage.getItem("accessToken") || "dev-local-access-token";

      localStorage.setItem("accessToken", token);
      localStorage.setItem("token", token);

      setTauriSession({
        user: {
          name: "Inso Developer",
          email: "dev@inso.code",
          accessToken: token,
        },
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (pathname === "/login" || pathname === "/") {
        router.replace("/chat");
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
                <SovereignMeshProvider>{children}</SovereignMeshProvider>
              </UserFetcher>
            </TRPCProvider>
          </NextThemesProvider>
        </HeroUIProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
