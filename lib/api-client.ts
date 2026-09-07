/**
 * Unified API Client for Alti Code Studio
 * Used by Admin, Owner, and Desktop surfaces.
 */

import { API_URL } from "./config";

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL || "http://localhost:5001/api/v1";
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    // Phase 48: Strict Sovereign Cloud WAF Header
    const activeCloud = process.env.NEXT_PUBLIC_CLOUD_PROVIDER || "local";

    headers["x-sovereign-cloud"] = activeCloud;

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { ...this.getHeaders(), ...options?.headers },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));

      throw new Error(error.message || `API Error: ${res.status}`);
    }

    return res.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // ── Admin APIs ──
  admin = {
    getDashboard: () => this.get<AdminDashboard>("/analytics/admin-dashboard"),
    getUsage: () => this.get<UsageMetrics>("/analytics/usage"),
    getMembers: () => this.get<Member[]>("/admin/members"),
    getTeams: () => this.get<Team[]>("/admin/teams"),
    getAuditLogs: (page?: number) =>
      this.get<AuditLog[]>(`/audit/logs?page=${page || 1}`),
    inviteMember: (email: string, role: string) =>
      this.post("/admin/invite", { email, role }),
  };

  // ── Owner APIs ──
  owner = {
    getStats: () => this.get<OwnerStats>("/analytics/owner-metrics"),
    getRevenue: () => this.get<RevenueData>("/analytics/revenue"),
    getEnterprises: () => this.get<Enterprise[]>("/admin/enterprises"),
    getGcpHealth: () => this.get<GcpHealth>("/health/gcp"),
    getPlatformConfig: () => this.get<PlatformConfig>("/admin/platform-config"),
    updatePlatformConfig: (config: Partial<PlatformConfig>) =>
      this.put("/admin/platform-config", config),
  };

  // ── Health APIs ──
  health = {
    getLiveness: () => this.get<{ status: string }>("/healthz"),
    getReadiness: () => this.get<{ status: string }>("/ready"),
    getDeep: () => this.get<DeepHealth>("/health/deep"),
    getGcp: () => this.get<GcpHealth>("/health/gcp"),
  };

  // ── Agent APIs ──
  agents = {
    list: () => this.get<Agent[]>("/agents"),
    get: (id: string) => this.get<Agent>(`/agents/${id}`),
    execute: (id: string, input: unknown) =>
      this.post(`/agents/${id}/execute`, input),
  };
}

// ── Type Definitions ──
export interface AdminDashboard {
  activeUsers: number;
  apiCallsToday: number;
  tokenSpendMonth: number;
  agentRunsToday: number;
  recentActivity: ActivityItem[];
  systemStatus: SystemStatus;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
}

export interface SystemStatus {
  gcpServices: { total: number; healthy: number };
  uptime: string;
  avgLatency: string;
}

export interface OwnerStats {
  totalAccounts: number;
  cloudAccounts?: number;
  dedicatedAccounts?: number;
  sovereignAccounts?: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  totalUsers: number;
  errorRate: number;
}

export interface GcpHealth {
  gcp: {
    status: string;
    project: string;
    region: string;
    deploymentMode: string;
    totalServices: number;
    healthyServices: number;
    services: Record<string, string>;
  };
}

export interface RevenueData {
  mrr: number;
  arr: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  customer: string;
  date: string;
  amount: string;
  plan: string;
}

export interface Enterprise {
  id: string;
  name: string;
  plan: string;
  users: number;
  status: string;
}

export interface PlatformConfig {
  maintenanceMode: boolean;
  signupsEnabled: boolean;
  betaFeatures: boolean;
  currentVersion: string;
  announcement: string;
}

export interface Member {
  id: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
}

export interface Team {
  id: string;
  name: string;
  memberCount: number;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface DeepHealth {
  status: string;
  services: Record<string, { status: string; latency?: number }>;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
}

export interface UsageMetrics {
  billing?: {
    plan: string;
    tokensUsed: number;
    tokensRemaining: number;
    monthlyAllowance: number;
  };
  modelsUsage: {
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    invocations: number;
  }[];
}

export const api = new ApiClient();
