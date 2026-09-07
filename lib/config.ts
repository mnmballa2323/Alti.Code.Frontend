/**
 * Centralized API Configuration — Google Cloud Platform
 * Alti Code Studio — Sovereign Enterprise Architecture
 */

// Strict Sovereign Cloud Configuration: Exclusively Google Cloud Platform (GCP)
const CLOUD_ENV = process.env.NEXT_PUBLIC_CLOUD_PROVIDER || "gcp";

const getIsolatedApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL_GCP) {
    return process.env.NEXT_PUBLIC_API_URL_GCP;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "http://localhost:5000/api/v1";
};

// Core API Base Path (/api/v1) strictly bound to Google Cloud
export const API_URL = getIsolatedApiUrl();

// Base Root Path (for WebSockets or non-versioned endpoints)
export const SOCKET_URL = API_URL.replace("/api/v1", "");
export const BASE_URL = SOCKET_URL;

console.info(
  `[SovereignMesh] Frontend bound to strictly isolated infrastructure: ${CLOUD_ENV.toUpperCase()}`,
);

// Installer Download Links (Tauri / Electron builds)
export const DOWNLOAD_LINKS = {
  windows:
    process.env.NEXT_PUBLIC_DOWNLOAD_WINDOWS ??
    "/downloads/Alti-Code-Studio_1.0.0_x64-setup.exe",
  mac:
    process.env.NEXT_PUBLIC_DOWNLOAD_MAC ??
    "https://github.com/mnmballa2323/Alti.Code.Desktop/releases/download/v1.0.0/Alti-Code-Studio_1.0.0_x64.dmg",
};
