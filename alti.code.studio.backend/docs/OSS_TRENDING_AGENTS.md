# OSS Trending Agent System — v7.7.0

> A self-growing vertical of open-source specialist agents. Every trending GitHub repo gets its own agent. The swarm expands to thousands of agents over time, automatically.

---

## How It Works

```
GitHub Trending (daily at 02:00 UTC)
        │
        ▼
GitHubTrendingService.scanTrending()        ← 3-source fallback chain
        │  trending API → GitHub Search → curated popular list
        ▼
OssAgentRegistry.getNewRepos(knownSlugs)    ← diff: only NEW repos
        │
        ▼
OssAgentFactory.createBatch(newRepos, cap)  ← cap: OSS_BATCH_CAP (default 50)
        │
        ├── fetchReadme(repo)               ← real technical context
        ├── _synthesizeOssAgentCode(repo)   ← Gemini-powered synthesis
        ├── guardianAgent.interceptExecution ← safety gate
        ├── writeFile → agents/oss/{slug}.agent.js
        ├── _hotLoad → swarm:agent_hotload  ← immediate router registration
        └── ossAgentRegistry.add(record)    ← persist to data/oss_agents.json
```

On every **restart**, the scheduler rehydrates all existing agents from `data/oss_agents.json` back into the CapabilityRouter.

---

## File Structure

```
src/app/modules/
├── ossAgents/
│   ├── github.trending.service.js  ← GitHub Trending scanner (3-source)
│   ├── oss.agent.factory.js        ← LLM synthesis + Guardian + hot-load
│   ├── oss.agent.registry.js       ← JSON-backed persistent catalog
│   ├── oss.trending.scheduler.js   ← Daily cron + boot rehydration
│   └── oss.agents.route.js         ← REST API (8 endpoints + SSE)
│
└── agents/
    └── oss/                        ← Auto-generated agent files live here
        ├── README.md
        ├── facebook__react.agent.js
        ├── vercel__next.js.agent.js
        └── ...
│
data/
└── oss_agents.json                 ← Persistent registry (survives restarts)
```

---

## REST API

Base path: `/api/v1/oss-agents`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all OSS agents (`?q=react&language=javascript&limit=50`) |
| `GET` | `/stats` | Aggregate stats: total, by language, top by stars |
| `GET` | `/trending` | Today's trending repos from GitHub (with `hasAgent` flag) |
| `GET` | `/status` | Scheduler status, last scan time, scan history |
| `POST` | `/scan` | Trigger a manual GitHub Trending scan now |
| `POST` | `/create` | Force-create agent for any GitHub repo URL |
| `GET` | `/events` | SSE stream of all scan/synthesis events |
| `GET` | `/:owner/:name` | Get single OSS agent record |
| `DELETE` | `/:owner/:name` | Remove an OSS agent |

### Example: Force-create an agent

```bash
curl -X POST http://localhost:3000/api/v1/oss-agents/create \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/run-llama/llama_index"}'
```

### Example: List all React-related agents

```bash
curl "http://localhost:3000/api/v1/oss-agents?q=react&limit=20"
```

### Example: SSE stream (terminal)

```bash
curl -N http://localhost:3000/api/v1/oss-agents/events
```

---

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `GITHUB_TOKEN` | (none) | Optional GitHub PAT for higher Search API rate limits |
| `OSS_BATCH_CAP` | `50` | Max agents to create per cron run |

---

## Agent Synthesis

Each agent receives:
1. **README context** — up to 4,000 chars of the repo's README.md
2. **LLM prompt** — structured prompt requesting 50-80 lines of repo-specific preamble
3. **Preamble sections:**
   - Overview & problem solved
   - Installation (exact commands)
   - Core concepts & abstractions
   - Key APIs / CLI commands with real examples
   - Common integration patterns
   - Configuration options
   - Gotchas & best practices

### Routing Keywords (auto-generated)

Each agent gets 12-15 keywords derived from: repo name, owner, slug variants, language, topics, description words.

**Example — `facebook/react`:**
```
react, facebook, reactjs, facebook/react, javascript, hooks, components, 
virtual-dom, jsx, library, web, user interfaces
```

---

## Capability Router Integration

OSS agents register in the same `CapabilityRouter` as all other agents via the `swarm:agent_hotload` event. They participate in keyword scoring just like hand-written agents.

**Routing example:**
- "How do I use React hooks?" → dispatches to `FacebookReact_Oss_Agent`
- "Set up FastAPI authentication" → dispatches to `FastapiFastapi_Oss_Agent`
- "Ollama local model API" → dispatches to `OllamaOllama_Oss_Agent`

---

## SSE Events

Subscribe to `GET /api/v1/oss-agents/events` for real-time updates:

| Event | Payload |
|-------|---------|
| `oss:scan_started` | `{ scanId, trigger, language }` |
| `oss:scan_repos_found` | `{ scanId, total, newCount, repos[] }` |
| `oss:agent_synthesis_started` | `{ agentId, slug, stars }` |
| `oss:agent_written` | `{ agentId, slug, filePath }` |
| `oss:agent_created` | `{ agentId, slug, agentName, registered, keywords }` |
| `oss:agent_blocked` | `{ agentId, slug, reason }` |
| `oss:agent_failed` | `{ agentId, slug, error }` |
| `oss:batch_done` | `{ created, skipped, total }` |
| `oss:scan_done` | `{ agentsCreated, errors, totalAgents }` |
| `oss:rehydrated` | `{ loaded, failed, total }` |

---

## Security

- All agent files are Guardian-vetted before being written to disk
- Synthesis is rate-limited (300ms delay between agents, 50 max per run)
- Subprocess calls use argument arrays — no shell injection
- All synthesis events logged via ComplianceEngine (`OSS_AGENT_SYNTHESIS`)
- Agent files are isolated in `agents/oss/` — separate from hand-written agents
