# 🏗️ Alti.Code.Studio Backend — System Architecture

> Version 8.3.0 — The Elite Architect Armada  
> Last Updated: 2026-02-27

---

## Table of Contents
1. [Overview](#overview)
2. [Request Lifecycle](#request-lifecycle)
3. [Orchestration Engine](#orchestration-engine)
4. [Agent Swarm](#agent-swarm)
5. [Capability Router](#capability-router)
6. [Hardening & Resilience](#hardening--resilience)
7. [Data Layer](#data-layer)
8. [Observability](#observability)
9. [Security](#security)
10. [API Surface](#api-surface)

---

## Overview

The backend is structured as a **layered AI orchestration platform** with a clear separation between:

```
┌──────────────────────────────────────────────────┐
│                  Express HTTP API                 │
├──────────────────────────────────────────────────┤
│         Auth Middleware (JWT RS256 + RBAC)        │
├──────────────────────────────────────────────────┤
│          GraphOrchestrator (LangGraph)            │
│  plan → guard → execute → review → recovery       │
├──────────────────────────────────────────────────┤
│   CapabilityRouter   │   DirectAgentDispatch      │
│  (270 semantic routes)│  (surfer, agent_s, ...)    │
├──────────────────────────────────────────────────┤
│        BaseSpecialistAgent (Hardened)             │
│  retry · timeout · circuit breaker · metrics     │
├──────────────────────────────────────────────────┤
│  25,000+ Specialist Agent Implementations        │
│  (Lazy-loaded via DynamicAgentLoaderService)     │
├──────────────────────────────────────────────────┤
│     GeminiAiService  │  MongoDB  │  Redis         │
│     Qdrant Vector    │  PgBouncer│  GCP Logging   │
└──────────────────────────────────────────────────┘
```

---

## Request Lifecycle

### Standard Task Flow
```
1. Client sends: POST /api/orchestrate { task, context }
2. Auth middleware validates JWT + checks RBAC role
3. GraphOrchestrator.run() is called
4. planNode: Gemini LLM decomposes task into ordered steps []
5. guardianNode: Policy check (PII, data egress, compliance)
6. executeNode (for each step):
   a. Checks step.agent type
   b. If "specialist": CapabilityRouter.dispatch(step.query, context)
      - Scores all 114 routes against the query
      - Selects highest-scoring agent
      - Calls agent.consult(prompt, contextData) via hardened base
   c. If named agent (e.g., "surfer", "agent_s"): direct dispatch
   d. Appends result to state.results[]
7. reviewNode: Quality/safety review of all results
8. Returns final aggregated response to client
```

### Recovery Flow
```
executeNode failure
    → shouldContinue() returns "recovery"
    → recoveryNode: error analysis + alternative strategy
    → retries executeNode with modified parameters
    → max 2 recovery cycles before reviewNode terminal
```

---

## Orchestration Engine

### `graph.orchestrator.js` — LangGraph StateGraph

**State shape:**
```js
{
  task: string,         // Original user task
  plan: Step[],         // Decomposed execution steps
  context: object[],    // Injected file/data context
  results: string[],    // Per-step outputs
  guardianApproved: boolean,
  iteration: number,    // Recovery cycle counter
  error: string | null
}
```

**Node functions:**
| Node | Purpose |
|------|---------|
| `planNode` | LLM creates structured `Step[]` from the task |
| `guardianNode` | Safety/compliance policy enforcement |
| `executeNode` | Dispatches each step to an agent |
| `reviewNode` | Aggregates + quality-checks all results |
| `recoveryNode` | Error analysis + retry planning |

**Registered direct agents in `executeNode`:**
`surfer`, `vector`, `siren`, `sentinel`, `chaos`, `release`, `compliance`, `economist`, `codereview`, `architecture`, `performance`, `e2e`, `database`, `analytics`, `integration`, `hivemind`, `schema`, `debug`, `surgeon`, `guardian`, `browser`, `agent_s`, `crawl4ai`, `mcp`, `openInterpreter`, `searxng`, `tabby`, `dspy`, `geminiExt`, `qdrant`, `ollama`, `observability`, `voice`, `litellm`, `temporal`, `langgraph`, `mem0`, `unstructured`, `promptfoo`, `pentagi`, `fossflow`, **`specialist`** (→ CapabilityRouter)

---

## Agent Swarm

### Agent Tier Hierarchy

```
Tier 1–8:   Core Orchestration (Strategist, Guardian, Historian, Analyst, 
             Surgeon, Surfer, Schema, Debug)
Tier 9:     Growth & Operations (SEO, A11y, API Design, Incident, Migration, Cost)
Tier 12:    Micro Specialists (Docker, K8s, Nginx, GraphQL, JWT, FFmpeg...)
Tier 13:    Enterprise SDKs (Stripe, Redis, Supabase, Prisma, Solidity, Svelte...)
Tier 14:    AI/ML/Mobile/Data (LangChain, MLOps, Flutter, Playwright, Kafka...)
Tier 15:    Security & Platform (Pentest, OWASP, GitHub Actions, Figma, Wasm...)
Tier 16:    Cloud Providers (21 agents — AWS through Backblaze B2)
Tier 17:    Systems Languages (C, C++, C#, Java, Kotlin, Swift, Zig, Nim)
Tier 18:    Dynamic Languages (Ruby, PHP, Perl, R, Julia, MATLAB, PowerShell, Groovy)
Tier 19:    Functional Languages (Haskell, Elixir, Erlang, Scala, F#, OCaml, Clojure, Racket)
Tier 20:    Legacy & Specialized (COBOL, Fortran, Ada, Assembly, APL, VHDL, Apex, ABAP...)
Tier 21:    Dynamic & Open Source (25,000+ Agents via DynamicAgentLoaderService)
```

### Agent File Convention

```js
// Every agent follows this pattern:
class XxxAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Xxx_Expert';
        this.description = 'One-line capability summary for routing/discovery';
        this.preamble = `Detailed LLM system prompt with domain expertise...`;
    }
    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n${contextBlock}\n\n${prompt}`);
    }
}
export const xxxAgent = new XxxAgent();
```

---

## Capability Router

### `capability.router.js` — 270-Route Semantic Matcher

**Algorithm:**
```
1. Normalize query to lowercase
2. For each of 270 CAPABILITY_TABLE entries:
   score = count of keywords that appear in query
3. Sort by score descending
4. Return top match (or top-N for fan-out)
```

**Routing entry format:**
```js
{ keywords: ['render', 'render.yaml', 'render deploy', ...], agent: renderAgent }
```

**API:**
| Method | Usage |
|--------|-------|
| `route(query)` | Returns best match `{agent, score, name}` or null |
| `routeTop(query, n)` | Returns top-N matches |
| `dispatch(query, ctx)` | route + consult in one call |
| `fanOut(query, ctx, n)` | Parallel top-N consultation |
| `getManifest()` | Diagnostic string of all routes |

---

## Hardening & Resilience

### Nation-State Security Architecture (Enterprise/Private Cloud)

For DoD IL5/IL6, FedRAMP High, and PCI-DSS compliance, the backend is secured with a 6-pillar Nation-State defense architecture:
1. **Identity (ABAC/SAML)**: `enterprise.strategy.js` strictly enforces SAML 2.0 / OIDC flows. Regular JWT login is blocked for Enterprise tenants via `auth.service.js`.
2. **KMS / HSM**: Environment variables no longer store plain-text secrets. `kms.service.js` fetches ciphertext and uses AWS KMS or Azure Key Vault to dynamically decrypt master keys in memory.
3. **Inline DLP**: `dlp.service.js` acts as a regex/Luhn middleware inside `guardian.service.js`, intercepting and redacting PII/PCI/Secrets *before* LLMs can ingest them.
4. **Immutable Audit Ledger**: `audit.service.js` creates a cryptographically chained WORM database log for every AI action, and streams over TLS to Splunk/Datadog SIEM.
5. **Air-Gapped LLM Inference**: `multicloud_inference.service.js` supports an `AIR_GAPPED_MODE` which short-circuits all public cloud endpoints (OpenAI, Anthropic, Gemini, Bedrock) and routes exclusively to an internal Ollama cluster over localhost/VPC.
6. **Zero-Trust (mTLS)**: The `docker-compose.prod.yml` injects an Envoy Proxy sidecar to enforce strict mTLS traffic between all microservices.

### `BaseSpecialistAgent` — Production Guard Layer

All 435+ agents inherit from this class and get the following protections automatically:

| Protection | Configuration |
|-----------|--------------|
| Input validation | Max 32k chars; truncate with marker |
| Context truncation | 4k chars/file, 20k total block |
| Retry + backoff | 3 attempts; 800ms → 1.6s → 3.2s |
| Timeout guard | 30 seconds per LLM call |
| Circuit breaker | Opens at 5 consecutive failures; resets after 60s |
| Response validation | Min 10 chars; must be string |
| Typed errors | `AgentError { code, retryable }` |
| Usage metrics | `calls`, `errors`, `avgLatencyMs`, `errorRate` |

### `swarm.health.js` — Live Health Monitor

Runs a sweep every 5 minutes after orchestrator init. Each agent's health is tracked via a lightweight ping. Reports via `GET /api/swarm/health`.

---

## Infrastructure & Data Layer

As of v8.1.0, the platform is deployed exclusively on **Google Cloud Platform (GCP)** via Terraform and declarative GitOps (ArgoCD).

### Kubernetes (Global GKE Fleet)
- **Multi-Region Fleet**: Identical GKE Autopilot clusters deployed across US, EU, and APAC for total regional failover.
- **GitOps CD**: ArgoCD automatically syncs `k8s/` manifests; Workload Identity secures GitHub Actions image builds.
- **Anthos Service Mesh**: Strict mTLS encryption between all internal pods.
- **Global Ingress**: Google Premium Anycast networking (`MultiClusterIngress`) routes traffic to the nearest healthy cluster.
- **Zero Trust**: Enforced by cluster-wide `NetworkPolicy` default-deny isolation and Kyverno Admission Webhooks.

### GCP Secret Manager
- All production secrets (Stripe, DB passwords, API keys) are stored in Secret Manager, completely eliminating `.env` file dependencies in production.

### MongoDB Atlas (Primary Store)
- Highly-available distributed cluster managed via Terraform.
- Users, sessions, audit logs, analytics events, and compliance records.
- Agent execution history and task states.

### GCP Memorystore (Redis)
- Session caching (sub-10ms agent comms).
- Rate limiting counters and pubsub for socket events.
- Central state store for distributed Autonomic jobs (mutex locks).

### Cloud SQL for PostgreSQL (PentAGI & Vector Embeddings)
- Managed PostgreSQL 15 for autonomous Pentesting agent (`vxcontrol/pentagi`).
- `pgvector` for RAG-powered memory retrieval and code snippet similarity search.

### Mem0 (Long-term Memory)
- Cross-session persistent agent memory and user preference learning.

---

## Observability & FinOps

| Tool | Integration |
|------|------------|
| Google Managed Prometheus | Auto-scapes `/metrics` from backend pods natively |
| GCP BigQuery | Tenant-level cost attribution and FinOps analytics |
| GCP Pub/Sub | Real-time SIEM log exporting (Splunk, Datadog) |
| OpenTelemetry | Distributed tracing across all services |
| Grafana | Dashboard for system performance |
| `/api/swarm/health` | Live swarm health endpoint |
| Per-agent `.getMetrics()` | Individual agent performance data |

---

## Security

### Authentication
- JWT RS256 tokens with 15-minute access + 7-day refresh
- RBAC: `admin` | `user` | `owner` roles
- `guardianMiddleware` on all protected routes

### Agent Security
- `guardianNode` in every orchestration pipeline reviews tasks before execution
- Input sanitized before LLM calls
- Context size caps prevent prompt injection via oversized files
- `AgentError` typed errors prevent internal details leaking to clients
- `SwarmValidation` and `OrchestratorValidation` enforce strict Zod schemas on core API payloads

### Data Protection
- All secrets via environment variables (never in code)
- MongoDB field-level encryption for PII
- `express-mongo-sanitize` completely mitigates NoSQL Injection attempts
- `xss-clean` escapes Cross-Site Scripting HTML payloads
- `hpp` drops HTTP Parameter Pollution arrays from incoming queries
- Redis TLS in production
- Audit logging on all admin actions via AuditService

---

## API Surface

### Core Routes
```
POST  /api/orchestrate          ← Main task entry point
GET   /api/version              ← Platform version
POST  /api/auth/login           ← JWT login
POST  /api/auth/refresh         ← Token refresh
```

### Swarm API
```
GET   /api/swarm/health         ← All agent health statuses
GET   /api/swarm/agents         ← Browse/search agents
GET   /api/swarm/stats          ← Aggregate stats
POST  /api/swarm/route          ← Find best agent
POST  /api/swarm/dispatch       ← Route + consult
POST  /api/swarm/fanout         ← Parallel multi-agent
```

### Domain APIs
```
/api/analytics    /api/compliance    /api/database
/api/memory       /api/monitoring    /api/security
/api/users        /api/projects      /api/audit
```

---

## Architecture Decision Records

See [`docs/adr/`](docs/adr/) for all ADRs:
- `001-use-node-js.md` — Why Node.js over Python for the orchestration layer
- `002-use-mongodb.md` — MongoDB as primary data store
- `2026-02-20-implement-inter-agent-delegation-protocol.md` — IADP design