# 🌌 Alti.Code.Studio — Enterprise AI Development Platform

> **Version 3.0 — The Grand Swarm**
> *120+ Specialist AI Agents. 21 Cloud Providers. 46 Programming Languages. Production-Hardened.*

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Production_Ready-green.svg)]()
[![Agents](https://img.shields.io/badge/agents-120%2B-purple.svg)]()
[![Languages](https://img.shields.io/badge/languages-46-orange.svg)]()
[![Cloud](https://img.shields.io/badge/cloud_providers-21-blue.svg)]()

---

## 📖 Overview

Alti.Code.Studio is an **Enterprise AI Development Platform** powered by a self-orchestrating swarm of 120+ hyper-specialized AI agents. It functions as a God-tier AI Engineer living inside your development environment — capable of writing, reviewing, testing, deploying, securing, and monitoring code across any language and any cloud.

**Three Operating Modes:**
- 🖥️ **Desktop App** — Electron-based AI IDE for developers
- 🌐 **Web Dashboard** — Management console for admins and team leads
- 🤖 **API** — Headless REST API for CI/CD and programmatic access

---

## 🏗️ Architecture — The Universe

### Core Orchestration Layer
| Component | Role |
|-----------|------|
| `graph.orchestrator.js` | LangGraph-powered multi-agent orchestrator with plan → guard → execute → review pipeline |
| `capability.router.js` | Semantic routing engine — 114 keyword-scored routes mapping queries to the right specialist |
| `swarm.health.js` | Live health monitoring and circuit breaker status for all 120+ agents |
| `agent.index.js` | Searchable catalog of all agents with capability metadata |
| `swarm.controller.js` | REST API surface — `/api/swarm` endpoints for health, routing, dispatch, fan-out |

### Agent Tiers

| Tier | Category | Count | Examples |
|------|----------|-------|---------|
| 1–8 | Core Orchestration | 8 | Strategist, Guardian, Historian, Analyst, Surgeon, Surfer, Schema, Debug |
| 9 | Growth & Operations | 7 | SEO, Accessibility, API Design, Cost, Migration, Incident |
| 12 | Micro Specialists | 10 | Docker, Kubernetes, Nginx, GraphQL, JWT, FFmpeg, Regex, Three.js |
| 13 | Enterprise SDKs | 12 | Stripe, Redis, Supabase, Prisma, Solidity, Svelte, Vue, Terraform, Ansible |
| 14 | AI / ML / Mobile | 11 | LangChain, MLOps, Prompt Engineering, React Native, Flutter, Kafka |
| 15 | Security & Platform | 10 | Pentest, GitHub Actions, WebAssembly, Figma, MongoDB, gRPC, Tailwind |
| 16 | **Cloud Providers** | **21** | AWS, GCP, Azure, Cloudflare, Vercel, Netlify, DigitalOcean, Render, Linode, Vultr, Scaleway, OVHcloud, Neon, Fastly, Backblaze + 6 more |
| 17 | **Systems Languages** | **8** | C, C++, C#, Java, Kotlin, Swift, Zig, Nim |
| 18 | **Dynamic Languages** | **8** | Ruby, PHP, Perl, R, Julia, MATLAB, PowerShell, Groovy |
| 19 | **Functional Languages** | **8** | Haskell, Elixir, Erlang, Scala, F#, OCaml, Clojure, Racket |
| 20 | **Legacy & Specialized** | **15** | COBOL, Fortran, Ada, Assembly, Obj-C, Crystal, Lua, APL, VHDL, Apex, ABAP, Prolog, Dart, Wolfram, PL/SQL |

---

## ✨ Key Features

### 🧠 The Grand Swarm Intelligence
- **120+ specialist agents** each with deep domain expertise and production-grade preambles
- **Semantic capability routing** — natural language queries automatically dispatched to the best agent
- **Fan-out execution** — simultaneous multi-agent consultation for complex problems
- **Circuit breaker protection** — automatic fallback when agents are overloaded

### 🔒 Production Hardening (Every Agent)
- Retry with exponential backoff (3 attempts, 800ms→3.2s)
- 30-second timeout guard per LLM call
- Input validation + prompt/context truncation to prevent token blowout
- Circuit breaker: opens after 5 failures, auto-resets after 60 seconds
- Per-agent metrics: call count, error rate, average latency
- Typed `AgentError` with error codes and retryable flags

### ☁️ Universal Cloud Coverage (21 Providers)
AWS · GCP · Azure · Cloudflare · Vercel · Netlify · DigitalOcean · Oracle Cloud · IBM Cloud · Alibaba · Hetzner · Fly.io · Railway · **Render · Linode · Vultr · Scaleway · OVHcloud · Neon · Fastly · Backblaze B2**

### 🌐 Universal Language Coverage (46 Languages)
TypeScript · Python · Rust · Go · Solidity · **C · C++ · C# · Java · Kotlin · Swift · Zig · Nim ·
Ruby · PHP · Perl · R · Julia · MATLAB · PowerShell · Groovy ·
Haskell · Elixir · Erlang · Scala · F# · OCaml · Clojure · Racket ·
COBOL · Fortran · Ada · Assembly · Obj-C · Crystal · Lua · APL/J/K/Q ·
VHDL/SystemVerilog · Apex · ABAP · Prolog · Dart · Wolfram · PL/SQL**

### 🏔️ Autonomous Engineering Capabilities
- **Live web intelligence**: The Surfer agent browses and resolves unknown errors in real time
- **Self-modification**: The Surgeon autonomously patches and refactors agent logic
- **Observability**: Full OpenTelemetry integration with distributed tracing
- **RAG-powered memory**: Vector store + Qdrant for persistent knowledge retrieval
- **Voice I/O**: Multimodal voice agent with LiveKit + ElevenLabs integration

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v20+
- MongoDB
- Redis
- Git

### Quick Start

```bash
# 1. Clone with submodules
git clone --recurse-submodules https://github.com/mnmballa2323/alti.code.studio.git
cd alti.code.studio

# 2. Setup environment
cp alti.code.studio.backend/.env.example alti.code.studio.backend/.env
# Edit .env with your GEMINI_API_KEY, MONGO_URI, REDIS_URL

# 3. Install dependencies
cd alti.code.studio.backend && npm install
cd ../alti.code.studio.frontend && npm install

# 4. Start backend (dev)
cd alti.code.studio.backend && npm run dev

# 5. Start frontend (dev)
cd alti.code.studio.frontend && npm run dev
```

---

## 📡 API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/orchestrate` | Submit a task to the multi-agent orchestrator |
| `GET /api/swarm/health` | Live health status of all 120+ agents |
| `GET /api/swarm/agents` | Browse and search all registered agents |
| `POST /api/swarm/route` | Find the best agent for a given query |
| `POST /api/swarm/dispatch` | Route + auto-consult the best agent |
| `POST /api/swarm/fanout` | Parallel consultation across top-N agents |
| `GET /api/version` | Platform version info |

---

## 📁 Repository Structure

```
alti.code.studio/               ← Monorepo root
├── alti.code.studio.backend/  ← Node.js/Express API + Agent Swarm
│   ├── src/app/modules/
│   │   ├── agents/            ← 120+ specialist agent files
│   │   ├── orchestrator/      ← LangGraph workflow engine
│   │   ├── memory/            ← RAG, vector store, Mem0
│   │   └── ...
│   ├── scripts/               ← Test harnesses, utilities
│   └── docs/                  ← Architecture, ADRs, reports
└── alti.code.studio.frontend/ ← Next.js 14 dashboard + Electron IDE
```

---

## 📜 Documentation

| Document | Description |
|----------|-------------|
| [Backend README](alti.code.studio.backend/README.md) | Backend setup, API reference |
| [ARCHITECTURE.md](alti.code.studio.backend/ARCHITECTURE.md) | Detailed system architecture |
| [AGENTS.md](alti.code.studio.backend/AGENTS.md) | Full agent roster with capabilities |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [ROADMAP.md](ROADMAP.md) | Planned features |
| [docs/LLM_INSTRUCTIONS.md](docs/LLM_INSTRUCTIONS.md) | LLM agent operating instructions |

---

## 🔒 Security

- JWT-based authentication (RS256)
- RBAC: Admin / User / Owner roles
- Rate limiting on all public endpoints
- Input sanitization and output validation on all agent calls
- SOC2-aligned audit logging

---

## 📄 License

MIT © 2024–2026 Alti.Code.Studio
