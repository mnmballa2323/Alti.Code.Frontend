import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";

import { Providers } from "./providers";
import ClientQueryProvider from "./QueryClientProvider";

import { ModalProvider } from "@/components/modals/ModalProvider";
import { fontSans, fontSecondary, fontSerif } from "@/config/fonts";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

import { I18nProvider } from "@/components/providers/I18nProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link href="/.well-known/ai-catalog.json" rel="ai-catalog" />
      </head>
      <body
        className={clsx(
          "min-h-screen text-foreground bg-white dark:bg-black font-sans antialiased overflow-x-hidden",
          fontSans.variable,
          fontSecondary.variable,
          fontSerif.variable,
        )}
      >
        <ClientQueryProvider>
          <I18nProvider>
            <Providers
              themeProps={{
                attribute: "class",
                defaultTheme: "light",
                themes: ["light", "dark", "midnight-navy"],
              }}
            >
              {children}
              <ModalProvider />
            </Providers>
          </I18nProvider>
        </ClientQueryProvider>
      </body>
    </html>
  );
}
