import axios from "axios";

import { API_URL } from "@/lib/config";
/**
 * Enterprise API Service Layer
 * Centralized typed client for all 180+ backend enterprise endpoints.
 * Base URL: NEXT_PUBLIC_API_URL/enterprise
 */

const API = axios.create({
  baseURL: `${API_URL}/enterprise`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Attach auth token if available ──
API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Unwrap responses ──
const unwrap = (p: Promise<{ data: any }>): Promise<any> =>
  p.then((r) => r.data);

// ═══════════════════════════════════════════════
// System Health & Readiness
// ═══════════════════════════════════════════════
export const systemAPI = {
  health: () => unwrap(API.get("/health/status")),
  healthz: () => unwrap(API.get("/health/healthz")),
  readyz: () => unwrap(API.get("/health/readyz")),
  livez: () => unwrap(API.get("/health/livez")),
  startupz: () => unwrap(API.get("/health/startupz")),
  register: (d: any) => unwrap(API.post("/health/register", d)),
  stats: () => unwrap(API.get("/health/stats")),
  openapi: () => unwrap(API.get("/openapi/spec")),
  stressRun: (d: any) => unwrap(API.post("/stress/run", d)),
  stressSuites: () => unwrap(API.get("/stress/suites")),
  stressStats: () => unwrap(API.get("/stress/stats")),
};

// ═══════════════════════════════════════════════
// Cost Analytics
// ═══════════════════════════════════════════════
export const costAPI = {
  track: (d: any) => unwrap(API.post("/cost-analytics/track", d)),
  summary: (tenantId: string) =>
    unwrap(API.get(`/cost-analytics/summary/${tenantId}`)),
  trends: (tenantId: string, period = "daily") =>
    unwrap(API.get(`/cost-analytics/trends/${tenantId}?period=${period}`)),
  setBudget: (d: any) => unwrap(API.post("/cost-analytics/budget", d)),
  budgetStatus: (tenantId: string) =>
    unwrap(API.get(`/cost-analytics/budget/${tenantId}`)),
  roi: (tenantId: string) => unwrap(API.get(`/cost-analytics/roi/${tenantId}`)),
  department: (tenantId: string) =>
    unwrap(API.get(`/cost-analytics/department/${tenantId}`)),
  categories: () => unwrap(API.get("/cost-analytics/categories")),
  stats: () => unwrap(API.get("/cost-analytics/stats")),
};

// ═══════════════════════════════════════════════
// Performance Benchmarking
// ═══════════════════════════════════════════════
export const perfAPI = {
  record: (d: any) => unwrap(API.post("/benchmarks/record", d)),
  get: (agentId: string) => unwrap(API.get(`/benchmarks/${agentId}`)),
  compare: (ids: string) =>
    unwrap(API.get(`/benchmarks/compare?agents=${ids}`)),
  sla: (agentId: string) => unwrap(API.get(`/benchmarks/sla/${agentId}`)),
  trends: (agentId: string) => unwrap(API.get(`/benchmarks/trends/${agentId}`)),
  stats: () => unwrap(API.get("/benchmarks/stats")),
};

// ═══════════════════════════════════════════════
// Token Billing Engine
// ═══════════════════════════════════════════════
export const billingAPI = {
  createAccount: (d: any) => unwrap(API.post("/billing/account", d)),
  consume: (d: any) => unwrap(API.post("/billing/consume", d)),
  estimate: (d: any) => unwrap(API.post("/billing/estimate", d)),
  addBalance: (d: any) => unwrap(API.post("/billing/balance", d)),
  changePlan: (d: any) => unwrap(API.put("/billing/plan", d)),
  usage: (tenantId: string) => unwrap(API.get(`/billing/usage/${tenantId}`)),
  usageByAgent: (tenantId: string) =>
    unwrap(API.get(`/billing/usage/${tenantId}/agents`)),
  usageByModel: (tenantId: string) =>
    unwrap(API.get(`/billing/usage/${tenantId}/models`)),
  accounts: () => unwrap(API.get("/billing/accounts")),
  account: (tenantId: string) =>
    unwrap(API.get(`/billing/account/${tenantId}`)),
  plans: () => unwrap(API.get("/billing/plans")),
  models: () => unwrap(API.get("/billing/models")),
  invoices: (tenantId: string) =>
    unwrap(API.get(`/billing/invoices/${tenantId}`)),
  stats: () => unwrap(API.get("/billing/stats")),
};

// ═══════════════════════════════════════════════
// Webhook Management
// ═══════════════════════════════════════════════
export const webhookAPI = {
  register: (d: any) => unwrap(API.post("/webhooks/register", d)),
  update: (id: string, d: any) => unwrap(API.put(`/webhooks/${id}`, d)),
  remove: (id: string) => unwrap(API.delete(`/webhooks/${id}`)),
  dispatch: (d: any) => unwrap(API.post("/webhooks/dispatch", d)),
  list: (tenantId: string) => unwrap(API.get(`/webhooks/list/${tenantId}`)),
  deliveries: (id: string) => unwrap(API.get(`/webhooks/${id}/deliveries`)),
  resetCircuit: (id: string) =>
    unwrap(API.post(`/webhooks/${id}/reset-circuit`)),
  events: () => unwrap(API.get("/webhooks/events")),
  stats: () => unwrap(API.get("/webhooks/stats")),
};

// ═══════════════════════════════════════════════
// Data Export & Import
// ═══════════════════════════════════════════════
export const dataAPI = {
  exportData: (d: any) => unwrap(API.post("/data/export", d)),
  importData: (d: any) => unwrap(API.post("/data/import", d)),
  schedule: (d: any) => unwrap(API.post("/data/schedule-export", d)),
  schedules: (tenantId: string) =>
    unwrap(API.get(`/data/schedules/${tenantId}`)),
  jobs: (tenantId: string, type?: string) =>
    unwrap(API.get(`/data/jobs/${tenantId}${type ? `?type=${type}` : ""}`)),
  stats: () => unwrap(API.get("/data/stats")),
};

// ═══════════════════════════════════════════════
// Dashboard Builder
// ═══════════════════════════════════════════════
export const dashboardAPI = {
  create: (d: any) => unwrap(API.post("/dashboards", d)),
  update: (id: string, d: any) => unwrap(API.put(`/dashboards/${id}`, d)),
  remove: (id: string) => unwrap(API.delete(`/dashboards/${id}`)),
  addWidget: (id: string, d: any) =>
    unwrap(API.post(`/dashboards/${id}/widgets`, d)),
  removeWidget: (dashId: string, widgetId: string) =>
    unwrap(API.delete(`/dashboards/${dashId}/widgets/${widgetId}`)),
  configWidget: (id: string, d: any) =>
    unwrap(API.put(`/dashboards/widgets/${id}/config`, d)),
  share: (id: string) => unwrap(API.post(`/dashboards/${id}/share`)),
  clone: (id: string, d: any) => unwrap(API.post(`/dashboards/${id}/clone`, d)),
  list: (tenantId: string, userId?: string) =>
    unwrap(
      API.get(
        `/dashboards/list/${tenantId}${userId ? `?userId=${userId}` : ""}`,
      ),
    ),
  templates: () => unwrap(API.get("/dashboards/templates")),
  widgetTypes: () => unwrap(API.get("/dashboards/widget-types")),
  stats: () => unwrap(API.get("/dashboards/stats")),
};

// ═══════════════════════════════════════════════
// Agent Collaboration
// ═══════════════════════════════════════════════
export const collabAPI = {
  createSession: (d: any) => unwrap(API.post("/collaboration/sessions", d)),
  sendMessage: (id: string, d: any) =>
    unwrap(API.post(`/collaboration/${id}/message`, d)),
  getMessages: (id: string, agent?: string) =>
    unwrap(
      API.get(`/collaboration/${id}/messages${agent ? `?agent=${agent}` : ""}`),
    ),
  setState: (id: string, d: any) =>
    unwrap(API.post(`/collaboration/${id}/state`, d)),
  getState: (id: string, key?: string) =>
    unwrap(API.get(`/collaboration/${id}/state${key ? `?key=${key}` : ""}`)),
  execute: (id: string, d: any) =>
    unwrap(API.post(`/collaboration/${id}/execute`, d)),
  endSession: (id: string) => unwrap(API.post(`/collaboration/${id}/end`)),
  createChannel: (d: any) => unwrap(API.post("/collaboration/channels", d)),
  subscribe: (id: string, d: any) =>
    unwrap(API.post(`/collaboration/channels/${id}/subscribe`, d)),
  patterns: () => unwrap(API.get("/collaboration/patterns")),
  stats: () => unwrap(API.get("/collaboration/stats")),
};

// ═══════════════════════════════════════════════
// Tenant Migration
// ═══════════════════════════════════════════════
export const migrationAPI = {
  plan: (d: any) => unwrap(API.post("/migration/plan", d)),
  execute: (id: string) => unwrap(API.post(`/migration/${id}/execute`)),
  rollback: (id: string) => unwrap(API.post(`/migration/${id}/rollback`)),
  pause: (id: string) => unwrap(API.post(`/migration/${id}/pause`)),
  resume: (id: string) => unwrap(API.post(`/migration/${id}/resume`)),
  get: (id: string) => unwrap(API.get(`/migration/${id}`)),
  progress: (id: string) => unwrap(API.get(`/migration/${id}/progress`)),
  audit: (id: string) => unwrap(API.get(`/migration/${id}/audit`)),
  list: (tenantId: string) => unwrap(API.get(`/migration/list/${tenantId}`)),
  regions: () => unwrap(API.get("/migration/regions")),
  stats: () => unwrap(API.get("/migration/stats")),
};

// ═══════════════════════════════════════════════
// Compliance Certification
// ═══════════════════════════════════════════════
export const complianceAPI = {
  startAssessment: (d: any) => unwrap(API.post("/certifications/assess", d)),
  assessControl: (id: string, d: any) =>
    unwrap(API.post(`/certifications/${id}/control`, d)),
  autoCollect: (id: string) =>
    unwrap(API.post(`/certifications/${id}/auto-collect`)),
  complete: (id: string) => unwrap(API.post(`/certifications/${id}/complete`)),
  issue: (id: string) => unwrap(API.post(`/certifications/${id}/issue`)),
  crossWalk: (fw1: string, fw2: string) =>
    unwrap(API.get(`/certifications/cross-walk?fw1=${fw1}&fw2=${fw2}`)),
  remediations: (id: string) =>
    unwrap(API.get(`/certifications/${id}/remediations`)),
  assignRemediation: (id: string, d: any) =>
    unwrap(API.put(`/certifications/remediations/${id}/assign`, d)),
  completeRemediation: (id: string) =>
    unwrap(API.put(`/certifications/remediations/${id}/complete`)),
  list: (tenantId: string) =>
    unwrap(API.get(`/certifications/list/${tenantId}`)),
  frameworks: () => unwrap(API.get("/certifications/frameworks")),
  stats: () => unwrap(API.get("/certifications/stats")),
};

// ═══════════════════════════════════════════════
// Admin Console
// ═══════════════════════════════════════════════
export const adminAPI = {
  createTenant: (d: any) => unwrap(API.post("/admin/tenants", d)),
  listTenants: () => unwrap(API.get("/admin/tenants")),
  getTenant: (id: string) => unwrap(API.get(`/admin/tenants/${id}`)),
  updateTenant: (id: string, d: any) =>
    unwrap(API.put(`/admin/tenants/${id}`, d)),
  deleteTenant: (id: string) => unwrap(API.delete(`/admin/tenants/${id}`)),
  createUser: (id: string, d: any) =>
    unwrap(API.post(`/admin/tenants/${id}/users`, d)),
  deleteUser: (id: string, userId: string) =>
    unwrap(API.delete(`/admin/tenants/${id}/users/${userId}`)),
  createTeam: (d: any) => unwrap(API.post("/admin/teams", d)),
  addMember: (id: string, d: any) =>
    unwrap(API.post(`/admin/teams/${id}/members`, d)),
  flags: () => unwrap(API.get("/admin/flags")),
  toggleFlag: (d: any) => unwrap(API.put("/admin/flags", d)),
  announce: (d: any) => unwrap(API.post("/admin/announcements", d)),
  maintenance: (d: any) => unwrap(API.post("/admin/maintenance", d)),
  bulkInvite: (d: any) => unwrap(API.post("/admin/bulk-invite", d)),
  auditTrail: (tenantId: string) => unwrap(API.get(`/admin/audit/${tenantId}`)),
  stats: () => unwrap(API.get("/admin/stats")),
};

// ═══════════════════════════════════════════════
// Team Settings (Multi-Tenant Management)
// ═══════════════════════════════════════════════
export const teamAPI = {
  members: () => unwrap(API.get("/team/members")),
  inviteMember: (d: { email: string; role?: string }) => unwrap(API.post("/team/members", d)),
  removeMember: (userId: string) => unwrap(API.delete(`/team/members/${userId}`)),
  renameTeam: (d: { name: string }) => unwrap(API.put("/team/name", d)),
};

// ═══════════════════════════════════════════════
// Agent Marketplace
// ═══════════════════════════════════════════════
export const marketplaceAPI = {
  publish: (d: any) => unwrap(API.post("/marketplace/publish", d)),
  install: (d: any) => unwrap(API.post("/marketplace/install", d)),
  uninstall: (d: any) => unwrap(API.post("/marketplace/uninstall", d)),
  rate: (d: any) => unwrap(API.post("/marketplace/rate", d)),
  browse: (q?: any) =>
    unwrap(
      API.get(
        `/marketplace/browse${q ? `?category=${q.category || ""}&sort=${q.sort || ""}` : ""}`,
      ),
    ),
  get: (id: string) => unwrap(API.get(`/marketplace/agent/${id}`)),
  installed: (tenantId: string) =>
    unwrap(API.get(`/marketplace/installed/${tenantId}`)),
  analytics: () => unwrap(API.get("/marketplace/analytics")),
  stats: () => unwrap(API.get("/marketplace/stats")),
};

// ═══════════════════════════════════════════════
// Cron Engine
// ═══════════════════════════════════════════════
export const cronAPI = {
  schedule: (d: any) => unwrap(API.post("/cron/schedule", d)),
  pause: (id: string) => unwrap(API.post(`/cron/${id}/pause`)),
  resume: (id: string) => unwrap(API.post(`/cron/${id}/resume`)),
  cancel: (id: string) => unwrap(API.post(`/cron/${id}/cancel`)),
  get: (id: string) => unwrap(API.get(`/cron/${id}`)),
  list: (tenantId: string) => unwrap(API.get(`/cron/list/${tenantId}`)),
  history: (id: string) => unwrap(API.get(`/cron/${id}/history`)),
  presets: () => unwrap(API.get("/cron/presets")),
  stats: () => unwrap(API.get("/cron/stats")),
};

// ═══════════════════════════════════════════════
// Workflow Engine
// ═══════════════════════════════════════════════
export const workflowAPI = {
  create: (d: any) => unwrap(API.post("/workflows", d)),
  execute: (id: string, d?: any) =>
    unwrap(API.post(`/workflows/${id}/execute`, d)),
  status: (id: string) => unwrap(API.get(`/workflows/${id}/status`)),
  list: (tenantId: string) => unwrap(API.get(`/workflows/list/${tenantId}`)),
  definitions: () => unwrap(API.get("/workflows/definitions")),
  stats: () => unwrap(API.get("/workflows/stats")),
};

// ═══════════════════════════════════════════════
// Enterprise Search
// ═══════════════════════════════════════════════
export const searchAPI = {
  index: (d: any) => unwrap(API.post("/search/index", d)),
  search: (q: string, opts?: any) =>
    unwrap(
      API.get(
        `/search?q=${encodeURIComponent(q)}${opts?.type ? `&type=${opts.type}` : ""}${opts?.limit ? `&limit=${opts.limit}` : ""}`,
      ),
    ),
  suggest: (q: string) =>
    unwrap(API.get(`/search/suggest?q=${encodeURIComponent(q)}`)),
  analytics: () => unwrap(API.get("/search/analytics")),
  stats: () => unwrap(API.get("/search/stats")),
};

// ═══════════════════════════════════════════════
// Notifications
// ═══════════════════════════════════════════════
export const notificationAPI = {
  send: (d: any) => unwrap(API.post("/notifications/send", d)),
  preferences: (userId: string) =>
    unwrap(API.get(`/notifications/preferences/${userId}`)),
  updatePrefs: (userId: string, d: any) =>
    unwrap(API.put(`/notifications/preferences/${userId}`, d)),
  history: (userId: string) =>
    unwrap(API.get(`/notifications/history/${userId}`)),
  stats: () => unwrap(API.get("/notifications/stats")),
};

// ═══════════════════════════════════════════════
// Observability
// ═══════════════════════════════════════════════
export const observabilityAPI = {
  metrics: () => unwrap(API.get("/observability/metrics")),
  traces: () => unwrap(API.get("/observability/traces")),
  dashboard: () => unwrap(API.get("/observability/dashboard")),
  stats: () => unwrap(API.get("/observability/stats")),
};

// ═══════════════════════════════════════════════
// Swarm Engine & Agent Synthesis
// ═══════════════════════════════════════════════
export const swarmAPI = {
  health: () => unwrap(API.get("/swarm/health")),
  agents: (q?: string) => unwrap(API.get(`/swarm/agents${q ? `?q=${q}` : ""}`)),
  agent: (name: string) => unwrap(API.get(`/swarm/agents/${name}`)),
  stats: () => unwrap(API.get("/swarm/stats")),
  route: (d: any) => unwrap(API.post("/swarm/route", d)),
  dispatch: (d: any) => unwrap(API.post("/swarm/dispatch", d)),
  fanout: (d: any) => unwrap(API.post("/swarm/fanout", d)),
  synthesize: (d: any) => unwrap(API.post("/swarm/synthesize", d)),
  synthesisReport: () => unwrap(API.get("/swarm/synthesis-report")),
  /** SSE stream endpoint: NEXT_PUBLIC_API_URL/enterprise/swarm/stream */
  streamUrl: `${API.defaults.baseURL}/swarm/stream`,
};

// ═══════════════════════════════════════════════
// Aggregated stats (for Command Center)
// ═══════════════════════════════════════════════
export const fetchCommandCenterData = async () => {
  const results = await Promise.allSettled([
    systemAPI.stats(),
    costAPI.stats(),
    perfAPI.stats(),
    billingAPI.stats(),
    webhookAPI.stats(),
    complianceAPI.stats(),
    collabAPI.stats(),
    migrationAPI.stats(),
    marketplaceAPI.stats(),
    dashboardAPI.stats(),
    swarmAPI.stats(),
  ]);

  const extract = (r: PromiseSettledResult<any>) =>
    r.status === "fulfilled" ? r.value : null;

  return {
    system: extract(results[0]),
    cost: extract(results[1]),
    performance: extract(results[2]),
    billing: extract(results[3]),
    webhooks: extract(results[4]),
    compliance: extract(results[5]),
    collaboration: extract(results[6]),
    migration: extract(results[7]),
    marketplace: extract(results[8]),
    dashboards: extract(results[9]),
    swarm: extract(results[10]),
  };
};

export default API;
