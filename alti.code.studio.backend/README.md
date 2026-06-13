# 🤖 Alti.Code.Studio — Backend

> The AI Agent Swarm Engine · 435+ Specialists · Multimodal GUI Automation · 19 OpenClaw Bots · 44 Cloud Providers · 46 Programming Languages · Gemini CLI Hub

[![Node](https://img.shields.io/badge/node-v20%2B-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/express-5.x-lightgrey)](https://expressjs.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2-blue)](https://www.langchain.com/langgraph)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## Overview

The Alti.Code.Studio backend is a **production-hardened AI orchestration engine** built on Node.js/Express and powered by a self-organizing swarm of 435+ hyper-specialized AI agents. Capable of planning, writing code, executing CLI commands, browsing the web autonomously (Phase 15), and physically operating the host machine's UI (Phase 16: Agent S).

---

## Enterprise Compliance & Security
Built specifically for banks, governments, defense contractors, healthcare, and legal industries.

- **FIPS 140-3 Cryptography:** Ready for DoD IL5/IL6 via native Node.js FIPS mode.
- **Data Sovereignty (Geo-Fencing):** Enforces strict geo-boundaries, blocking cross-region API access per tenant data residency requirements.
- **Bring Your Own Key (BYOK):** Seamless AWS KMS and GCP KMS integration for tenant-level symmetric encryption.
- **Attribute-Based Access Control (ABAC):** Context-aware policies driven by Clearance Levels and IP Whitelists.
- **Data Retention & Auto-Expungement (GDPR/HIPAA):** Automated cron jobs prune data beyond configured retention limits, while respecting E-Discovery Legal Holds.
- **Enterprise WAF & Rate Limiting:** Fortune 100 DDoS and cost-exhaustion protection using `express-rate-limit` and payload deep-packet inspection.
- **Adversarial Dual-Review (Maker-Checker):** Critical operations require approvals from multiple independent specialist agents.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v20+ (ESM) |
| Framework | Express 5 |
| Orchestration | LangGraph (`@langchain/langgraph`) |
| AI | Google Gemini (via `@google/generative-ai`) |
| Database | MongoDB (Mongoose) |
| Cache / PubSub | Redis (ioredis) |
| Vector Store | Qdrant |
| Memory | Mem0 |
| Observability | OpenTelemetry + GCP Logging |
| Auth | JWT (RS256) + RBAC |
| Real-time | Socket.IO |

---

## Architecture

### Orchestration Pipeline

```
User Request
    ↓
POST /api/orchestrate
    ↓
GraphOrchestrator (LangGraph)
    ├─ planNode      → LLM decomposes task into steps
    ├─ guardianNode  → Security/policy enforcement
    ├─ executeNode   → Dispatches each step to the right agent
    │       ├─ capabilityRouter → 270-route semantic matcher
    │       │       └─ specialist agent.consult(prompt, context)
    │       ├─ agent_s.agent.js (The GUI Operator) → Controls physical host OS mouse/keyboard via PyAutoGUI + Agent S
    │       └─ direct agents (surfer, sentinel, codeReview, database, ...)
    ├─ reviewNode    → Quality gate on outputs
    └─ recoveryNode  → Auto-retry on failure
```

### Swarm REST API (`/api/swarm`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/swarm/health` | Live health of all 435+ agents |
| GET | `/api/swarm/agents` | Browse/search agent registry |
| GET | `/api/swarm/stats` | Swarm statistics |
| POST | `/api/swarm/route` | Find best agent for a query |
| POST | `/api/swarm/dispatch` | Route + auto-consult |
| POST | `/api/swarm/fanout` | Parallel top-N agent consultation |

### Gemini CLI Hub API (`/api/gemini-cli`, `/api/gemini-extensions`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/gemini-cli/run` | Run a `gemini` command, return full output |
| POST | `/api/gemini-cli/stream` | SSE streaming — pipes stdout/stderr in real time |
| GET | `/api/gemini-cli/history` | Session command history (bounded 200 entries) |
| DELETE | `/api/gemini-cli/history` | Clear session history |
| GET | `/api/gemini-extensions/list` | List installed extensions |
| POST | `/api/gemini-extensions/install` | Install extension from GitHub URL |
| POST | `/api/gemini-extensions/invoke` | Invoke installed extension with args |
| DELETE | `/api/gemini-extensions/uninstall/:name` | Uninstall extension by name |

---

## Agent Swarm

### Hardening (All Agents)
Every agent inherits `BaseSpecialistAgent` which provides:
- ✅ **Retry + exponential backoff** (3 attempts: 800ms → 1.6s → 3.2s)
- ✅ **Timeout guard** (30 seconds hard limit)
- ✅ **Input validation** (rejects blank; truncates >32k chars)
- ✅ **Context truncation** (4k/file, 20k total)
- ✅ **Circuit breaker** (opens at 5 failures, auto-resets after 60s)
- ✅ **Typed `AgentError`** with `.code` + `.retryable`
- ✅ **Per-agent metrics** via `.getMetrics()`

### Cloud Agents (44 Providers)

| Provider | Agent File |
|----------|-----------|
| AWS | `aws.agent.js` |
| Google Cloud | `gcp.agent.js` |
| Microsoft Azure | `azure.agent.js` |
| Cloudflare | `cloudflare.agent.js` |
| Vercel | `vercel.agent.js` |
| Netlify | `netlify.agent.js` |
| DigitalOcean | `digitalocean.agent.js` |
| Oracle Cloud | `oracle.agent.js` |
| IBM Cloud | `ibmcloud.agent.js` |
| Alibaba Cloud | `alibaba.agent.js` |
| Hetzner | `hetzner.agent.js` |
| Fly.io | `flyio.agent.js` |
| Railway | `railway.agent.js` |
| Render | `render.agent.js` |
| Linode/Akamai | `linode.agent.js` |
| Vultr | `vultr.agent.js` |
| Scaleway | `scaleway.agent.js` |
| OVHcloud | `ovhcloud.agent.js` |
| Neon | `neon.agent.js` |
| Fastly | `fastly.agent.js` |
| Backblaze B2 | `backblaze.agent.js` |
| ... | *+ 23 more Cloud Providers* |

### Language Agents (46 Languages)

**Tier 17 — Systems:** C · C++ · C# · Java · Kotlin · Swift · Zig · Nim

**Tier 18 — Dynamic:** Ruby · PHP · Perl · R · Julia · MATLAB · PowerShell · Groovy

**Tier 19 — Functional:** Haskell · Elixir · Erlang · Scala · F# · OCaml · Clojure · Racket

**Tier 20 — Legacy/Specialized:** COBOL · Fortran · Ada · Assembly · Obj-C · Crystal · Lua · APL/J/K/Q · VHDL · Apex (Salesforce) · ABAP (SAP) · Prolog · Dart · Wolfram Language · PL/SQL

**Tier 6/7 — Core:** TypeScript · Python · Rust · Go · Solidity (smart contracts) · Bash · Dart/Flutter

---

## 🛡️ Nation-State Security (Enterprise)

Built for Single-Tenant Private Cloud and Air-Gapped deployments (FedRAMP High, DoD IL5/IL6, SOC 2, PCI-DSS):
1. **Identity & Access (ABAC)**: Strict SAML 2.0 / OIDC enforcement for Enterprise SSO with JIT provisioning.
2. **KMS / HSM**: AWS KMS and Azure Key Vault integration for hardware-backed master key derivation.
3. **Inline DLP**: Real-time regex and Luhn interception stripping PII, PCI, and Credentials from LLM Prompts.
4. **Immutable Audit Ledger**: Blockchain-backed WORM logs inside PostgreSQL, streaming out via TLS to Splunk/Datadog SIEM.
5. **Air-Gapped LLMs**: `AIR_GAPPED_MODE` strictly routes inference locally to Ollama clusters (Llama 3 / CodeLlama), never touching public internet.
6. **Zero-Trust Network (mTLS)**: Envoy Proxy sidecars injected directly into `docker-compose.prod.yml` enforcing strict mTLS.

---

## Setup

### 1. Clone & Install
```bash
cd alti.code.studio.backend
npm install
```

### 2. Environment
```bash
cp .env.example .env
# Required:
# GEMINI_API_KEY=
# MONGO_URI=
# REDIS_URL=
# JWT_SECRET=
```

### 3. Run
```bash
# Development
npm run dev

# Production
npm start

# Run integration tests
node scripts/test_hardening.js
node scripts/test_phase15.js
node scripts/test_system_improvements.js
```

---

## Directory Structure

```
src/
  app/
    modules/
      agents/           ← 435+ specialist agent files
        base_specialist.agent.js   ← Hardened base class
        capability.router.js       ← 270-route semantic router
        agent.index.js             ← Searchable agent catalog
        swarm.health.js            ← Health monitor
        swarm.controller.js        ← REST API
        graph.orchestrator.js      ← LangGraph workflow engine
        *.agent.js                 ← Individual specialists
      gemini/           ← Gemini AI service
      geminiCli/        ← CLI runner: run, stream, history endpoints
      geminiExtensions/ ← Extension manager: list, install, invoke, uninstall
      memory/           ← RAG, vector store (pgvector/AlloyDB), Mem0
      auth/             ← JWT + RBAC
      analytics/        ← Usage tracking
      compliance/       ← Policy enforcement
      ...
    routes/             ← Express route definitions
    middleware/         ← Auth, rate limiting, validation
  shared/
    logger.js           ← Centralized logging
    config/             ← Environment configuration
scripts/
  test_hardening.js     ← Hardening + cloud agent tests (54/55 pass)
  test_phase15.js       ← Language agent tests (39/39 pass)
  test_system_improvements.js  ← System architecture tests (20/20 pass)
  mission_demo.js       ← LangGraph GraphOrchestrator demo
docs/
  ARCHITECTURE.md       ← Detailed architecture docs
  adr/                  ← Architecture Decision Records
  reports/              ← SOC2 artifacts, transparency reports
```

---

## Testing

```bash
# All integration tests
node scripts/test_hardening.js       # 54/55 ✅
node scripts/test_phase15.js         # 39/39 ✅
node scripts/test_system_improvements.js  # 20/20 ✅
```

---

## License

MIT © 2024–2026 Alti.Code.Studio
