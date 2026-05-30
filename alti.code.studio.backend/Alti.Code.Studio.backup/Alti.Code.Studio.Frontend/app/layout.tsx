import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";

import { Providers } from "./providers";

import { ModalProvider } from "@/components/modals/ModalProvider";
import { fontSans, fontSecondary } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import ClientQueryProvider from "./QueryClientProvider";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/faviconIco.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
          fontSecondary.variable
        )}
      >
         <ClientQueryProvider>
         <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          {children}
          <ModalProvider />
        </Providers>
        </ClientQueryProvider>
      </body>
    </html>
  );
}
