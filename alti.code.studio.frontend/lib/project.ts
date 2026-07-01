/**
 * Active Project / Workspace Context
 *
 * Stores the currently selected project (agent) globally via localStorage
 * and a CustomEvent so all pages stay in sync without prop drilling or
 * a React context provider.
 *
 * Storage key: "activeProject" → { id: string; name: string } | null
 */

export type ActiveProject = { id: string; name: string } | null;

const STORAGE_KEY = "activeProject";
const EVENT_NAME = "project-changed";

/** Read the current active project from localStorage */
export const getActiveProject = (): ActiveProject => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
};

/** Set the active project and broadcast to all listeners on the page */
export const setActiveProject = (project: ActiveProject) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: project }));
};

/** Subscribe to project changes. Returns an unsubscribe function. */
export const onProjectChange = (
  cb: (project: ActiveProject) => void,
): (() => void) => {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => cb((e as CustomEvent<ActiveProject>).detail);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
};

// ─── Per-project localStorage helpers ─────────────────────────────────────────

/** Build a namespaced storage key for a given project + data type */
export const projectKey = (
  agentId: string | null | undefined,
  suffix: string,
) => (agentId ? `proj_${agentId}_${suffix}` : `proj_global_${suffix}`);

/** Read JSON from a namespaced key */
export const readProjectData = <T>(
  agentId: string | null | undefined,
  suffix: string,
  fallback: T,
): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(projectKey(agentId, suffix));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

/** Write JSON to a namespaced key */
export const writeProjectData = <T>(
  agentId: string | null | undefined,
  suffix: string,
  value: T,
) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(projectKey(agentId, suffix), JSON.stringify(value));
  } catch {}
};
