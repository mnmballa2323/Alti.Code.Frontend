"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const TRUSTED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3005",
];

const isOriginTrusted = (origin: string) => {
  if (TRUSTED_ORIGINS.includes(origin)) return true;
  if (/^https:\/\/(.*\.)?insocode\.com$/.test(origin)) return true;
  if (/^https:\/\/(.*\.)?inso\.ai$/.test(origin)) return true;

  return false;
};

export default function SsoIframePage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security Check: Only accept messages from whitelisted domains
      if (!isOriginTrusted(event.origin)) {
        return;
      }

      if (event.data?.type === "INSO_SSO_CHECK") {
        if (status === "loading") {
          return;
        }

        const accessToken = session?.user?.accessToken;

        if (status === "authenticated" && accessToken) {
          event.source?.postMessage(
            {
              type: "INSO_SSO_RESPONSE",
              status: "authenticated",
              token: accessToken,
            },
            { targetOrigin: event.origin },
          );
        } else {
          event.source?.postMessage(
            {
              type: "INSO_SSO_RESPONSE",
              status: "unauthenticated",
            },
            { targetOrigin: event.origin },
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Notify the parent window that the iframe is ready to receive messages
    if (window.parent !== window) {
      window.parent.postMessage({ type: "INSO_SSO_IFRAME_READY" }, "*");
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [session, status]);

  return (
    <div id="sso-iframe-broker" style={{ display: "none" }}>
      Inso SSO Iframe Broker
    </div>
  );
}
