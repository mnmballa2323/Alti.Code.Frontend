import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";

import { Providers } from "./providers";
import ClientQueryProvider from "./QueryClientProvider";

import { ModalProvider } from "@/components/modals/ModalProvider";
import { fontSans, fontSecondary, fontSerif } from "@/config/fonts";
import { siteConfig } from "@/config/site";

// 🌐 Deep Google Integration: reCAPTCHA v3
import { RecaptchaProvider } from "@/components/providers/RecaptchaProvider";

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
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-white dark:bg-black font-sans antialiased",
          fontSans.variable,
          fontSecondary.variable,
          fontSerif.variable,
        )}
      >
        <RecaptchaProvider
          reCaptchaKey={
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "dummy-key"
          }
        >
          <ClientQueryProvider>
            <I18nProvider>
              <Providers
                themeProps={{ attribute: "class", defaultTheme: "light" }}
              >
                {children}
                <ModalProvider />
              </Providers>
            </I18nProvider>
          </ClientQueryProvider>
        </RecaptchaProvider>
      </body>
    </html>
  );
}
