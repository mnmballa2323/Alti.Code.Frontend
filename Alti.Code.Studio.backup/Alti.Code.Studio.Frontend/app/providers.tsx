"use client";

import type { ThemeProviderProps } from "next-themes";

import { store } from "@/store";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Toaster } from "react-hot-toast";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import { SessionProvider, useSession } from "next-auth/react";

import { getUserData } from "@/lib/user";
import { userController } from "@/store/userSlice";

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
    <SessionProvider>
      <ReduxProvider store={store}>
        <HeroUIProvider navigate={router.push}>
          <Toaster position="top-center" reverseOrder={false} />
          <NextThemesProvider {...themeProps}>
            <UserFetcher>{children}</UserFetcher>
          </NextThemesProvider>
        </HeroUIProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
