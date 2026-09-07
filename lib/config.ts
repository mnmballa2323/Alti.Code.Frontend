/**
 * Centralized API Configuration
 * Resolves the URL dynamically, preventing UI crashes in production environments
 * where localhost is not accessible.
 */

// Strict Sovereign Cloud Configuration
const CLOUD_ENV = process.env.NEXT_PUBLIC_CLOUD_PROVIDER || "local";

const getIsolatedApiUrl = () => {
  if (CLOUD_ENV === "aws")
    return (
      process.env.NEXT_PUBLIC_API_URL_AWS || "https://api.aws.inso.ai/api/v1"
    );
  if (CLOUD_ENV === "azure")
    return (
      process.env.NEXT_PUBLIC_API_URL_AZURE ||
      "https://api.azure.inso.ai/api/v1"
    );
  if (CLOUD_ENV === "gcp")
    return (
      process.env.NEXT_PUBLIC_API_URL_GCP || "https://api.gcp.inso.ai/api/v1"
    );

  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
};

// Core API Base Path (/api/v1) strictly bound to its sovereign cloud
export const API_URL = getIsolatedApiUrl();

// Base Root Path (for WebSockets or non-versioned endpoints)
export const SOCKET_URL = API_URL.replace("/api/v1", "");
export const BASE_URL = SOCKET_URL;

console.info(
  `[SovereignMesh] Frontend bound to strictly isolated infrastructure: ${CLOUD_ENV.toUpperCase()}`,
);

// Installer Download Links (Tauri builds)
export const DOWNLOAD_LINKS = {
  windows:
    process.env.NEXT_PUBLIC_DOWNLOAD_WINDOWS ??
    "/downloads/Inso-Code_1.0.0_x64-setup.exe",
  mac:
    process.env.NEXT_PUBLIC_DOWNLOAD_MAC ??
    "https://github.com/mnmballa2323/Inso.Code.Frontend/releases/download/v1.0.0/Inso-Code_1.0.0_x64.dmg",
};
