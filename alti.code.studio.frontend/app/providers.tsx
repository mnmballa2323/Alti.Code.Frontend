"use client";

import type { ThemeProviderProps } from "next-themes";

import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Toaster } from "react-hot-toast";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import { SessionProvider, useSession, signIn } from "next-auth/react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { store } from "@/store";
import { getUserData } from "@/lib/user";
import { userController } from "@/store/userSlice";
import { TRPCProvider } from "@/components/providers/TRPCProvider";

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

  React.useEffect(() => {
    const accessToken = session?.user?.accessToken ?? null;

    if (typeof window !== "undefined") {
      if (accessToken) {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("accessToken", accessToken);
      } else {
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

  return <>{children}</>;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const [tauriSession, setTauriSession] = React.useState<any>(undefined);

  React.useEffect(() => {
    if (typeof window !== "undefined" && "__TAURI__" in window) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        setTauriSession({
          user: {
            accessToken: token,
          },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      } else {
        setTauriSession(null);
      }
    }
  }, []);

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "mock-client-id"}
    >
      <SessionProvider session={tauriSession} refetchOnWindowFocus={false} refetchInterval={0}>
        <ReduxProvider store={store}>
          <HeroUIProvider navigate={router.push}>
            <Toaster position="top-center" reverseOrder={false} />
            <NextThemesProvider {...themeProps}>
              <TRPCProvider>
                <UserFetcher>{children}</UserFetcher>
              </TRPCProvider>
            </NextThemesProvider>
          </HeroUIProvider>
        </ReduxProvider>
      </SessionProvider>
    </GoogleOAuthProvider>
  );
}
