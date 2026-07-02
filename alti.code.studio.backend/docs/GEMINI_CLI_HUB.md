# Gemini CLI Hub — Developer Reference

> Part of Alti.Code.Studio · Route: `/gemini-studio`

---

## Overview

The Gemini CLI Hub is a **4-tab browser interface** that wraps the `gemini` CLI with a Google Cloud-native developer experience. It provides real-time terminal access, a searchable extension marketplace, installed extension management, and an extension scaffolding builder.

---

## Tabs

### 1. Terminal

A live REPL that streams `gemini` CLI output via **Server-Sent Events (SSE)**.

- Prompt: `gemini›`
- ↑/↓ arrow key command history (bounded at 50 client-side entries)
- Quick Actions: `gemini ask`, `gemini code`, `gemini chat`, `gemini run`
- Output: colour-coded `stdout` (white) / `stderr` (amber)

**Backend:** `POST /api/gemini-cli/stream` (SSE)  
**History:** `GET /api/gemini-cli/history`, `DELETE /api/gemini-cli/history`

---

### 2. Extensions Marketplace

A searchable, filterable gallery of **200+ real Gemini CLI extensions** sourced from geminicli.com.

- **Search** by name or description
- **Filter** by category (11 categories: Dev Tools, AI/ML, Cloud, Database, Productivity, etc.)
- **Spotlight presets**: Top Picks, Official Google/GCP
- **Official badge** (✦ OFFICIAL) on Firebase, Spanner, BigQuery, Cloud Run, GKE, Pub/Sub extensions
- **Install command** displayed for copy — uses real `gemini extensions install <github-url>`

**Frontend data:** `lib/gemini-extensions.ts`  
**Backend install:** `POST /api/gemini-extensions/install`

---

### 3. Installed Extensions

Manages extensions already installed on the local Gemini CLI.

- Lists all installed extensions via `gemini extensions list --json`
- **Invoke** any extension with custom arguments
- **Uninstall** with one click via `gemini extensions uninstall <name>`
- Output section shows last invocation result

**Backend:**  
- `GET /api/gemini-extensions/list`  
- `POST /api/gemini-extensions/invoke`  
- `DELETE /api/gemini-extensions/uninstall/:name`

---

### 4. Extension Builder

A web form to scaffold a new Gemini CLI extension locally.

Generates three files:

| File | Purpose |
|------|---------|
| `GEMINI.md` | Extension manifest — `name`, `description`, `tools` |
| `index.js` | Main entry point with tool registration |
| `package.json` | npm package with `gemini-cli-extension` tag |

Also generates the install command to register it:
```bash
gemini extensions install ./my-extension
```

---

## Extension Catalog

**File:** `lib/gemini-extensions.ts`

```ts
interface GeminiExtension {
  name: string;
  description: string;
  githubUrl: string;
  category: ExtensionCategory;
  spotlight?: boolean;   // featured in Top Picks
  official?: boolean;    // Google/GCP official — shown with ✦ badge
  author?: string;
  stars?: number;
  tags?: string[];
}
```

**Categories:**
`Dev Tools` · `AI/ML` · `Cloud` · `Database` · `Productivity` · `Security` · `Testing` · `DevOps` · `Data` · `Communication` · `Other`

---

## Pre-Bundled & Dockerized Extensions Engine

To deliver a sovereign-compliant, offline-capable, and hyper-performance developer workspace, the Gemini CLI Hub preloads all extensions natively inside isolated environments.

### 1. Git Submodule Pre-Bundling

All **65 Apache-2.0 licensed repositories** from the `gemini-cli-extensions` organization are cloned and integrated directly inside the workspace as git submodules under `submodules/`. This covers the full suite of developer tools, database connectors, and cloud execution environments locally.

### 2. Dynamic Backend Preloading Lifecycle

On backend startup, an automatic preloader is triggered via `GeminiExtensionService.preloadExtensions()`:
- **Dynamic Discovery**: It dynamically reads and scans the `submodules/` directory using a filesystem `readdirSync` directory filter.
- **Fast-Path Verification (0ms Startup Overhead)**: It compares directory listings against a local cache ledger file at `submodules/.preloaded_cache.json`. If they match, it skips startup shells completely.
- **Parallel Batch Installation**: If changes are detected, it performs a parallel installation cycle in concurrent batches of `5` (`Promise.all` chunks) using local filesystem paths: `gemini extensions install submodules/<repo-name>`.
- **Folder Sanitization Security**: Folder inputs are validated using a strict alphanumeric regex pattern (`/^[a-zA-Z0-9_\-]+$/`) to block path traversal vulnerabilities.

### 3. Dockerized Isolation

To guarantee runtime isolation:
- **Build Context**: The build context in [docker-compose.yml](file:///Users/michaelmeram/workspace/alti.code.studio/docker-compose.yml#L20) is set to the parent workspace root.
- **Image Bundling**: The [Dockerfile](file:///Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend/Dockerfile#L10) copies the entire `/submodules` directory into the final production runner stage.
- **Container Sandbox**: On container startup, all 65 extensions are automatically registered and isolated inside the container's private filesystem, preventing cross-tenant leakage.

---

## Backend API

### `POST /api/gemini-cli/run`
Runs a `gemini` subcommand (non-streaming).

```json
// Body
{ "command": "ask", "args": ["What is the capital of France?"] }

// Response
{ "success": true, "data": "Paris." }
```

### `POST /api/gemini-cli/stream`
SSE stream — pipes stdout/stderr in real time.

```json
// Body
{ "command": "code", "args": ["Write a Node.js hello world"] }

// SSE events
data: {"type":"stdout","text":"Here is a Node.js..."}
data: {"type":"close","code":0}
```

### `GET /api/gemini-cli/history`
Returns bounded command history for the current server session (max 200).

### `DELETE /api/gemini-cli/history`
Clears session history.

### `GET /api/gemini-extensions/list`
Runs `gemini extensions list --json` and returns parsed array.

### `POST /api/gemini-extensions/install`
```json
{ "githubUrl": "https://github.com/firebase/firebase-mcp-server" }
```

### `POST /api/gemini-extensions/invoke`
```json
{ "name": "firebase", "args": "list projects" }
```

### `DELETE /api/gemini-extensions/uninstall/:name`
Uninstalls the named extension.

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| GCP Blue | `#1a73e8` | Primary accent, buttons |
| GCP Blue Light | `#8ab4f8` | Hover states |
| Console BG | `#0d1117` | Terminal background |
| Font | Google Sans / Inter | All UI text |

---

## Security Notes

- All CLI args are **sanitized** via allowlist regex before being passed to child processes — no shell injection possible
- History is **in-memory only** — resets on server restart
- Extension install/uninstall is **admin-only** (RBAC middleware)
