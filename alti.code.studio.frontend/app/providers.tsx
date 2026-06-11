"use client";

import type { ThemeProviderProps } from "next-themes";

import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Toaster } from "react-hot-toast";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import { SessionProvider, useSession } from "next-auth/react";
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

// Get the user:-
function UserFetcher({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const dispatch = useDispatch();

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

  return <>{children}</>;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "mock-client-id"}
    >
      <SessionProvider>
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
