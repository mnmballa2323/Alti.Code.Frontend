/**
 * Centralized API Configuration
 * Resolves the URL dynamically, preventing UI crashes in production environments
 * where localhost is not accessible.
 */

// Core API Base Path (/api/v1)
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

// Base Root Path (for WebSockets or non-versioned endpoints)
export const SOCKET_URL = API_URL.replace("/api/v1", "");
export const BASE_URL = SOCKET_URL;

// Installer Download Links (Tauri builds)
export const DOWNLOAD_LINKS = {
  windows:
    process.env.NEXT_PUBLIC_DOWNLOAD_WINDOWS ??
    "/downloads/Inso-Code_1.0.0_x64-setup.exe",
  mac:
    process.env.NEXT_PUBLIC_DOWNLOAD_MAC ??
    "https://github.com/mnmballa2323/Alti.Code.Studio.Frontend/releases/download/v1.0.0/Inso-Code_1.0.0_x64.dmg",

};
