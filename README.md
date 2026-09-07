# 🖥 Alti Code Studio — Frontend

> Next.js 14 · HeroUI v2 · TypeScript · Framer Motion · Socket.IO · OpenClaw Visualizer
> Powered by **435+** hyper-specialized backend AI agents. **v8.3.0 — The Elite Architect Armada.**

---

## Overview

The Alti Code Studio frontend is a **full-stack AI developer platform UI** built on Next.js 14 (App Router). It provides real-time visualization of the AI agent swarm, mission orchestration, the Gemini CLI Hub, and a comprehensive security dashboard.

---

## Key Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `app/page.tsx` | Landing / Dashboard |
| `/mission-control` | `app/mission-control/page.tsx` | Autonomous swarm command center |
| `/gemini-studio` | `app/gemini-studio/page.tsx` | **Gemini CLI Hub** (4 tabs) |
| `/chat` | `app/chat/page.tsx` | Conversational AI interface |
| `/security` | `app/security/page.tsx` | Security monitoring dashboard |
| `/agents` | `app/agents/page.tsx` | Agent roster & health status |

---

## Gemini CLI Hub (`/gemini-studio`)

A Google Cloud-native 4-tab developer experience for the `gemini` CLI:

| Tab | Description |
|-----|-------------|
| **Terminal** | Live REPL — `gemini›` prompt, ↑/↓ history, SSE-streamed real-time output |
| **Extensions Marketplace** | 200+ real extensions from geminicli.com — searchable, filterable, official GCP extensions flagged ✦ |
| **Installed** | Lists installed extensions, invoke with args, view output, one-click uninstall |
| **Builder** | Web form to scaffold a new extension (`GEMINI.md` + `index.js` + `package.json`) |

**Key files:**
- `app/gemini-studio/page.tsx` — main 4-tab Hub component
- `lib/gemini-extensions.ts` — typed catalog: `GeminiExtension[]`, `CATEGORIES`, `installCmd()`

---

## Key Components

| Component | Path | Purpose |
|-----------|------|---------|
| `MissionControl` | `components/agents/MissionControl.tsx` | Real-time socket-connected mission log |
| `AuditLogViewer` | `components/governance/AuditLogViewer.tsx` | Governance audit trail |
| `Sidebar` | `components/sidebar.tsx` | App navigation (includes Gemini CLI Hub link) |
| `Terminal` | `components/code/Terminal.tsx` | Embedded code terminal |
| `ChatBotLayout` | `components/ChatbotLayout.tsx` | Standard authenticated page layout |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI Library | HeroUI v2 |
| Styling | Tailwind CSS + Framer Motion |
| Language | TypeScript (strict) |
| Auth | NextAuth.js |
| Real-time | Socket.IO client |
| Icons | `@iconify/react` + `lucide-react` |
| i18n | `react-intl` |
| Notifications | `sonner` |

---

## Environment

```bash
cp .env.local.example .env.local
# Required:
# NEXTAUTH_SECRET=
# NEXTAUTH_URL=http://localhost:3000
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
# NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npx tsc --noEmit --skipLibCheck  # type check
```

---

## License

MIT © 2024–2026 Alti Code Studio
