# System Architecture — Alti.Code.Studio Backend

> Version 7.6.0 · Updated 2026-02-26

---

## Overview

Alti.Code.Studio Backend is a **production-hardened AI orchestration engine** built on Node.js/Express. It powers a self-organizing swarm of **319+ hyper-specialized AI agents** that plan, execute, monitor, and self-heal complex software engineering tasks autonomously.

---

## Orchestration Pipeline

```
User Request (natural language)
    │
    ▼
POST /api/agents/mission
    │
    ▼
┌─────────────────────────────────────┐
│         GraphOrchestrator           │  ← LangGraph StateGraph
│  (graph.orchestrator.js)            │
│                                     │
│  [1] planNode                       │  ← Gemini decomposes goal into steps
│       └─ RAG recall (ragService)    │  ← Retrieves relevant past context
│                                     │
│  [2] guardianNode                   │  ← Safety/policy enforcement
│       └─ rejects unsafe plans       │  ← CHAOS_MODE bypass for testing
│                                     │
│  [3] executeNode (loop)             │  ← Dispatches each step
│       ├─ capabilityRouter           │  ← 204-route semantic matcher
│       │    └─ specialist.consult()  │  ← Domain expert agents
│       └─ direct agents              │  ← surfer, sentinel, debug, ...
│                                     │
│  [4] recoveryNode (on error)        │  ← Exponential backoff + AI patch
│       └─ up to 3 retries            │
│                                     │
│  [5] reviewNode                     │  ← Mission complete/failed report
└─────────────────────────────────────┘
    │
    ▼
Socket.IO events → Frontend MissionControl component
```

---

## Module Map

```
src/app/modules/
├── agents/
│   ├── graph.orchestrator.js    ← LangGraph workflow engine
│   ├── capability.router.js     ← 204-keyword semantic dispatch
│   ├── swarm.health.js          ← Live health monitor (5-min sweep)
│   ├── swarm.controller.js      ← /api/swarm REST endpoints
│   ├── orchestrator.controller.js
│   ├── orchestrator.route.js    ← /api/agents/mission[/:traceId]
│   └── *.agent.js               ← 319+ specialist agents
│
├── openclaw/
│   ├── core.integration.js      ← ACP bridge (real acpx subprocess dispatch)
│   ├── skills.bridge.js         ← SKILL.md scanner + ClawhHub + MCP tool gen
│   ├── acpx.service.js          ← ACP session manager (createSession/exec/close)
│   ├── lobster.service.js       ← Typed workflow pipeline bridge (Lobster DSL)
│   ├── clawhub.service.js       ← ClawhHub skill directory REST client
│   ├── agent-skills.service.js  ← Context engineering pattern library
│   ├── deer-flow.service.js     ← deer-flow SuperAgent subprocess bridge
│   ├── pageindex.service.js     ← PageIndex vectorless RAG subprocess bridge
│   ├── nano-agent.service.js    ← read/write/bash tool loop (learn-claude-code)
│   └── index.js                 ← Re-exports all openclaw services
│
├── geminiCli/
│   ├── geminiCli.service.js     ← spawn(), streamGeminiCLI() (SSE),
│   │                              in-memory history (200 entries)
│   ├── geminiCli.controller.js  ← runCommand, streamCommand, history
│   └── geminiCli.route.js       ← POST /run, /stream · GET|DELETE /history
│
├── geminiExtensions/
│   ├── geminiExtension.service.js  ← list, install, invoke, uninstall
│   └── geminiExtension.route.js    ← GET /list · POST /install /invoke
│                                     DELETE /uninstall/:name
│
├── memory/
│   ├── vector.store.js          ← pgvector/AlloyDB (768-dim embeddings)
│   ├── rag.service.js           ← Batched indexing + Gemini synthesis
│   └── memory.js                ← VectorMemory facade
│
├── monitoring/
│   ├── observability.service.js ← Langfuse + GCP Logging traces
│   │                              getRecentTraces() → this.localTraces
│   ├── observability.controller.js
│   └── observability.route.js   ← GET /traces, POST /ingest
│
├── debugAgent/
│   ├── debugAgent.service.js    ← analyzeError() with RAG recall
│   ├── debugAgent.controller.js ← startDebug (async job), getJobStatus,
│   │                              autonomicWebhook
│   └── debugAgent.route.js      ← POST /debug · GET /debug/status/:jobId
│                                  POST /debug/webhook (GCP alert intake)
│
├── gitAgent/
│   ├── gitAgent.service.js      ← commitChanges({ skipStage }), 
│   │                              syncChanges, chokidar watcher
│   └── gitAgent.controller.js
│
├── docs/
│   ├── doc_gen.service.js       ← AI JSDoc enrichment (batch 4)
│   └── wiki.service.js          ← ARCHITECTURE.md, ADR generation
│
├── enterprise/                    ← Phase 35-50 High-level modules
│   ├── capability.router.js     ← Advanced agent orchestration routing
│   ├── data.pipeline.js         ← Enterprise Data ETL Pipelines
│   ├── workflow.engine.js       ← Programmable Workflow State Engine
│   ├── enterprise.search.js     ← Multi-entity TF-IDF Search Engine
│   └── *.service.js             ← Notification, Quota, Secret handling
│
├── auth/                        ← JWT RS256, RBAC middleware
├── mcp/                         ← MCP server (100+ tools)
├── analytics/ audit/ sentinel/  ← Observability + compliance
└── ...
```

---

## Gemini CLI Hub

The frontend at `/gemini-studio` provides a full 4-tab developer experience:

| Tab | Backend Endpoint | What It Does |
|-----|-----------------|--------------|
| Terminal | `POST /api/gemini-cli/run` | Runs `gemini <cmd>` and returns output |
| Terminal (stream) | `POST /api/gemini-cli/stream` | SSE: pipes stdout/stderr in real time |
| Installed | `GET /api/gemini-extensions/list` | `gemini extensions list --json` |
| Marketplace | `POST /api/gemini-extensions/install` | `gemini extensions install <url>` |
| Installed | `POST /api/gemini-extensions/invoke` | Sanitized invocation of named extension |
| Installed | `DELETE /api/gemini-extensions/uninstall/:name` | `gemini extensions uninstall` |

---

## Agent Dispatch Flow

```
GraphOrchestrator.executeNode(step)
    │
    ├── availableAgents[step.agent]  (30+ direct registrations)
    │       ├── surfer, sentinel, chaos, siren...
    │       ├── browser, crawl4ai, mcp, searxng...
    │       └── geminiExt → GeminiExtensionService
    │
    └── capabilityRouter.dispatch(query)  ← 204-route semantic fallback
            │        └── BaseSpecialistAgent.consult(prompt, context)
                    ├── retry (3× exponential backoff)
                    ├── timeout (30s hard limit)
                    ├── circuit breaker (opens at 5 failures)
                    └── GeminiAiService.generateContent()
```

---

## Real-Time Communication

- **Socket.IO** events emitted by `GraphOrchestrator`:
  - `agent:thought` — planning/reasoning step
  - `agent:action` — step execution with agent + action name
  - `mission:complete` — final results
  - `mission:failed` — error details

Frontend `MissionControl` component subscribes and renders a live animated mission log.

---

## Security & Observability

| Layer | Implementation |
|-------|---------------|
| Authentication | JWT RS256 + RBAC (`auth.middleware.js`) |
| Input Validation | All endpoints validated before service calls |
| Rate Limiting | Express rate-limit middleware |
| Tracing | Langfuse traces + GCP Cloud Logging (`observability.service.js`) |
| Audit | Immutable `AuditService` for all critical operations |
| Debug Webhook | `POST /api/debug-agent/debug/webhook` — GCP alert → autonomous debug |
| Guardian | Safety gate on every orchestrator plan (Asimov-style veto) |