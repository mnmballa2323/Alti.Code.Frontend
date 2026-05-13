# OpenClaw & Open Source Deep Integration Architecture

> [!NOTE]
> This document covers the full integration layer: the 9 OpenClaw submodules **plus** the 4 new high-star open-source repositories added in v7.6.0. All bridges reside in `src/app/modules/openclaw/`.

---

## 1. Submodule Directory Structure

```text
submodules/
├── openclaw/
│   ├── openclaw/          # Core orchestration engine
│   ├── acpx/              # Agent Client Protocol CLI
│   ├── lobster/           # Typed workflow macro shell
│   ├── skills/            # SKILL.md skill library
│   ├── clawdinators/      # Nix routing sub-agents
│   ├── clawhub/           # Skill registry frontend
│   ├── butter.bot/        # Community bot
│   ├── clawgo/            # Go client library
│   └── openclaw-ansible/  # Ansible automation
│
├── agent-skills-context/  # Context Engineering (10.7k ⭐, MIT)
├── deer-flow/             # SuperAgent Research Harness (20.5k ⭐, MIT)
├── pageindex/             # Vectorless RAG System (17.7k ⭐, MIT)
└── learn-claude-code/     # Nano Code Agent Patterns (18k ⭐, MIT)
```

---

## 2. Service Bridge Layer (`src/app/modules/openclaw/`)

All integrations use the proxy bridge pattern — no submodule code runs in the same memory space as the core Node.js process.

### Core OpenClaw Services

| File | Description |
|------|-------------|
| `core.integration.js` | Primary ACP bridge — dispatches via `acpxService.exec()` / `acpxService.prompt()` (real subprocess, no mock). Circuit breaker, Zod validation, compliance audit, Lobster workflow support. |
| `skills.bridge.js` | Recursive SKILL.md scanner across `openclaw/skills/`, `agent-skills-context/`, and ClawhHub live registry. Auto-generates MCP tool definitions. |
| `bots.service.js` | Converts OpenClaw bots (flawd-bot, trust) into Phantom workers on `queueService`. |
| `sensory.integration.js` | IoT edge telemetry (casa) + voice buffer (voice-community) → `eventBus` traces. |
| `acpx.service.js` | **[NEW]** ACP session manager — `createSession()`, `prompt()`, `exec()`, `listSessions()`, `closeSession()` via `acpx` CLI subprocess. |
| `lobster.service.js` | **[NEW]** Typed workflow pipeline bridge — runs `lobster run <pipeline>` DSL against the `openclaw/lobster` interpreter. |
| `clawhub.service.js` | **[NEW]** REST client for `clawhub.ai` Skill Directory with 5-minute LRU cache — `listSkills()`, `searchSkills()`, `getSkillDetail()`. |

### Open Source Integration Services

| File | Upstream Repo | Description |
|------|--------------|-------------|
| `agent-skills.service.js` | `muratcankoylan/Agent-Skills-for-Context-Engineering` | Loads SCRATCHPAD, SELECTOR, COMPRESSOR, TOKEN-BUDGET, and CONTEXT-DISTILLERY patterns. Exposes `applyPattern(name, context)` and `listPatterns()`. |
| `deer-flow.service.js` | `bytedance/deer-flow` | Python subprocess bridge to the deer-flow SuperAgent harness. `runResearch(query, opts)` → structured research report; `getStatus(taskId)` for polling. |
| `pageindex.service.js` | `VectifyAI/PageIndex` | Vectorless RAG — `indexDocument(path)`, `query(q)` (returns `{ answer, pages[] }`), `listDocuments()`. No vector database needed. |
| `nano-agent.service.js` | `shareAI-lab/learn-claude-code` | Iterative read/write/bash tool loop — `runTask(goal)` orchestrates GeminiAiService + Node child_process with up to 20 iterations and self-correction. |

All services are exported via `openclaw/index.js`.

---

## 3. Agent Layer (`src/app/modules/agents/`)

Four specialist agents wrap the new services with routing, fallback, and observability:

| Agent File | Registry Name | Queue | Description |
|-----------|--------------|-------|-------------|
| `agent-skills-context.agent.js` | `contextEngineering` | `context-engineering-queue` | Selects and applies the best context engineering pattern for a given prompt |
| `deer-flow.agent.js` | `deepResearch` | `deer-flow-queue` | Routes high-complexity research tasks to deer-flow harness; falls back to Gemini |
| `pageindex.agent.js` | `pageIndexRAG` | `pageindex-queue` | Indexes documents and answers queries with page-level citations |
| `learn-claude-code.agent.js` | `nanoCodeAgent` | `nano-agent-queue` | Autonomous iterative code executor using the read/write/bash tool loop |

### Routing Keywords (capability.router.js)

| Agent | Sample Keywords |
|-------|----------------|
| Context Engineering | `context engineering`, `token budget`, `scratchpad`, `compressor`, `selector agent` |
| Deep Research | `deer-flow`, `deep research`, `research harness`, `langgraph research`, `research report` |
| PageIndex RAG | `vectorless rag`, `page index`, `reasoning rag`, `no vector database`, `page citation` |
| Nano Code Agent | `nano agent`, `bash tool loop`, `autonomous code execution`, `self-correcting agent` |

---

## 4. Security Hardening

All bridge entry points use the same hardening as the rest of the OpenClaw layer:

### Zod Validation
Every proxy entry point validates inputs with Zod schemas before crossing the submodule boundary.

### Circuit Breakers
All service calls are wrapped in `resilience.js` `CircuitBreaker` instances (5 consecutive failures → open, 10–15s reset).

### Audit Logging
Every action is recorded via `ComplianceEngine`:
- `OPENCLAW_ACP_DISPATCH` — ACP agent execution
- `OPENCLAW_WORKFLOW_RUN` — Lobster pipeline execution
- `OPENCLAW_SKILL_LOOKUP` — skill registry access
- `OPENCLAW_RESEARCH_RUN` — deer-flow task dispatch
- `OPENCLAW_RAG_QUERY` — PageIndex document query
- `OPENCLAW_NANOAGENT_TASK` — nano agent tool loop execution

### Subprocess Isolation
Services using Python (deer-flow, pageindex) or the `acpx` CLI run as isolated child processes via `child_process.spawn`. They cannot access the parent Node.js heap.

---

## 5. Initialization Lifecycle

The OpenClaw bridge initializes in `server.js` after background workers:

1. `core.integration.js` — verifies `acpx` binary available; registers ACP bridge
2. `skills.bridge.js` — scans all three skill sources; builds MCP tool definition cache
3. `agent-skills.service.js` — indexes context engineering patterns from submodule
4. All four specialist agents registered in `agentRegistry` and `capabilityRouter`

If submodules are missing, integration is bypassed and Alti.Code.Studio boots in native-only mode.
