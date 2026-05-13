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
