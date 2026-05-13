# Open Source Deep Integrations Reference

> **Version:** v7.6.0 — 2026-02-26  
> 4 MIT-licensed open-source repositories integrated as Git submodules with full service and agent bridges.

---

## Overview

| Repo | Stars | License | Submodule Path | Service | Agent |
|------|-------|---------|----------------|---------|-------|
| [Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) | 10.7k ⭐ | MIT | `submodules/agent-skills-context` | `agent-skills.service.js` | `agent-skills-context.agent.js` |
| [deer-flow](https://github.com/bytedance/deer-flow) | 20.5k ⭐ | MIT | `submodules/deer-flow` | `deer-flow.service.js` | `deer-flow.agent.js` |
| [PageIndex](https://github.com/VectifyAI/PageIndex) | 17.7k ⭐ | MIT | `submodules/pageindex` | `pageindex.service.js` | `pageindex.agent.js` |
| [learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) | 18k ⭐ | MIT | `submodules/learn-claude-code` | `nano-agent.service.js` | `learn-claude-code.agent.js` |

**Combined reach: 66.4k+ GitHub stars**

---

## 1. Agent-Skills-for-Context-Engineering

> Context engineering patterns for multi-agent systems in production.

### What It Provides

A curated library of context engineering patterns defined as `SKILL.md` files:

| Pattern | Purpose |
|---------|---------|
| `SCRATCHPAD` | Maintains an evolving scratch space during multi-step reasoning |
| `SELECTOR` | Picks the most relevant pieces of context before invoking the LLM |
| `COMPRESSOR` | Distills large context chunks into compact summaries to fit token budgets |
| `TOKEN-BUDGET` | Dynamically manages and allocates tokens across agent pipeline stages |
| `CONTEXT-DISTILLERY` | Extracts high-signal knowledge from raw documents into agent memory |

### Service API (`agent-skills.service.js`)

```js
import { agentSkillsService } from './openclaw/index.js';

// List all available patterns
const patterns = agentSkillsService.listPatterns();
// → [{ name: 'SCRATCHPAD', description: '...', useCases: [...] }, ...]

// Apply a specific pattern to augment a context block
const enhanced = await agentSkillsService.applyPattern('COMPRESSOR', {
  content: 'very long document...',
  maxTokens: 4096,
});
// → { optimizedContext: '...', reduction: '73%' }

// Get the MCP tool definition for a pattern
const tool = agentSkillsService.getMcpTool('TOKEN-BUDGET');
```

### Agent (`contextEngineering`)

- **Registry name:** `contextEngineering`
- **Queue:** `context-engineering-queue`  
- **Routes:** `context engineering`, `token budget`, `scratchpad pattern`, `compressor agent`, `selector agent`, `context distillery`, `context optimization`, `multi-agent context`

**Use case:** "Apply a token budget strategy to this 200k token codebase before running the code review"

---

## 2. deer-flow (ByteDance)

> A SuperAgent harness for deep research, coding, and multi-step tasks using LangGraph.

### Architecture

deer-flow uses a multi-agent LangGraph graph where a `Coordinator` decomposes tasks, `Researcher` agents search and synthesize sources, a `Coder` agent writes and validates code, and a `Reporter` assembles the final structured output.

```
Query → Coordinator → [Researcher × N, Coder] → Reporter → Structured Report
```

### Service API (`deer-flow.service.js`)

```js
import { deerFlowService } from './openclaw/index.js';

// Start a research task (async, returns taskId)
const { taskId } = await deerFlowService.runResearch(
  'Compare the performance characteristics of PostgreSQL vs. DynamoDB for time-series workloads',
  { depth: 'deep', maxSources: 20, outputFormat: 'report' }
);

// Poll for completion
const status = await deerFlowService.getStatus(taskId);
// → { status: 'completed', report: { summary, sections, sources }, usage: { tokens } }

// Stop a running task
await deerFlowService.cancelTask(taskId);
```

### Agent (`deepResearch`)

- **Registry name:** `deepResearch`
- **Queue:** `deer-flow-queue`
- **Routes:** `deer-flow`, `deerflow`, `deep research`, `superagent harness`, `research harness`, `research agent`, `langgraph research`, `bytedance agent`, `long-running research`, `podcast script`, `multi-step research`, `research report generation`

**Routing logic:** Tasks with > 500 token queries OR containing keywords like "comprehensive", "analyze", "compare", "research" are routed to deer-flow. Simpler queries fall back to direct Gemini.

**Use case:** "Do comprehensive research on the top 10 vector databases and produce a technical comparison report"

---

## 3. PageIndex (VectifyAI)

> Vectorless, reasoning-based document indexing and retrieval — no embeddings needed.

### How It Works

Instead of converting documents to vector embeddings, PageIndex:
1. Splits documents into pages
2. Builds a structural index of page content using heuristics + LLM summaries
3. At query time, uses chain-of-thought reasoning to identify the most relevant pages
4. Returns page-cited answers with exact source attribution

**Advantages over vector RAG:**
- No vector database infrastructure required
- Better handles structured documents (tables, code, legal text)
- Query-time reasoning means context-aware retrieval
- Low setup overhead — just point at a file

### Service API (`pageindex.service.js`)

```js
import { pageIndexService } from './openclaw/index.js';

// Index a document (one-time, idempotent)
await pageIndexService.indexDocument('/path/to/technical-spec.pdf');

// Query across indexed documents with page citations
const result = await pageIndexService.query(
  'What are the rate limits for the authentication API?'
);
// → {
//     answer: 'The auth API allows 100 requests per minute per tenant...',
//     pages: [{ file: 'technical-spec.pdf', page: 12, excerpt: '...' }],
//     confidence: 0.94
//   }

// List all indexed documents
const docs = pageIndexService.listDocuments();
```

### Agent (`pageIndexRAG`)

- **Registry name:** `pageIndexRAG`
- **Queue:** `pageindex-queue`
- **Routes:** `pageindex`, `page index`, `vectorless rag`, `vectorless retrieval`, `page-level rag`, `reasoning rag`, `no vector database`, `document index`, `rag without embeddings`, `page citation`, `document reasoning`, `reasoning based retrieval`

**Use case:** "Index our API documentation and answer: what are all the authentication methods supported?"

---

## 4. learn-claude-code (shareAI-lab)

> A minimal nano-agent pattern — the read/write/bash tool loop for autonomous code execution.

### The Pattern

The nano agent operates via a tight iterative loop:

```
Goal → [read_file | write_file | bash] × N iterations → Done/Fail
```

Each iteration:
1. Gemini decides the next tool call (read, write, or bash)
2. The tool executes in a sandboxed subprocess
3. The output is fed back as context
4. Gemini decides the next step or declares completion
5. On failure, Gemini self-corrects and retries (up to 20 iterations)

### Service API (`nano-agent.service.js`)

```js
import { nanoAgentService } from './openclaw/index.js';

// Run an autonomous coding task
const result = await nanoAgentService.runTask(
  'Add a rate limiter middleware to the Express app in src/index.js using express-rate-limit'
);
// → {
//     status: 'completed',
//     iterations: 7,
//     toolCallLog: [
//       { tool: 'read_file', args: { path: 'src/index.js' } },
//       { tool: 'bash', args: { cmd: 'npm install express-rate-limit' } },
//       { tool: 'write_file', args: { path: 'src/index.js', content: '...' } },
//       ...
//     ],
//     finalOutput: 'Rate limiter added at line 15 with 100 req/min limit'
//   }
```

### Agent (`nanoCodeAgent`)

- **Registry name:** `nanoCodeAgent`
- **Queue:** `nano-agent-queue`
- **Routes:** `nano agent`, `learn claude code`, `nano code agent`, `bash tool loop`, `tool call loop`, `bash agent`, `autonomous code execution`, `minimal agent`, `read write bash`, `iterative code agent`, `self-correcting agent`, `code agent pattern`

**Use case:** "Autonomously refactor all `var` declarations to `const`/`let` across the entire `src/` directory"

---

## Integration Architecture

```
User Query
    │
    ▼
capability.router.js (204 routes)
    │
    ├── context engineering keywords
    │       └── agent-skills-context.agent.js
    │               └── agent-skills.service.js
    │                       └── submodules/agent-skills-context/ (SKILL.md files)
    │
    ├── deep research / deer-flow keywords
    │       └── deer-flow.agent.js
    │               └── deer-flow.service.js
    │                       └── child_process → submodules/deer-flow/ (Python)
    │
    ├── vectorless rag / page index keywords
    │       └── pageindex.agent.js
    │               └── pageindex.service.js
    │                       └── child_process → submodules/pageindex/ (Python)
    │
    └── nano agent / bash tool loop keywords
            └── learn-claude-code.agent.js
                    └── nano-agent.service.js
                            └── GeminiAiService + child_process (tool loop)
```

---

## Environment Variables

| Variable | Required For | Default |
|----------|-------------|---------|
| `DEER_FLOW_TIMEOUT_MS` | deer-flow | `300000` (5 min) |
| `DEER_FLOW_MAX_SOURCES` | deer-flow | `20` |
| `NANO_AGENT_MAX_ITERATIONS` | nano-agent | `20` |
| `PAGEINDEX_PYTHON_BIN` | pageindex | `python3` |
| `AGENT_SKILLS_PATH` | agent-skills | `submodules/agent-skills-context` |

---

## Security Notes

- All Python subprocess invocations use `child_process.spawn` with argument arrays (no shell interpolation)
- `nano-agent.service.js` bash execution runs in a sandboxed directory with a file allowlist
- No submodule code has direct access to the Node.js process heap
- All service entry points validate inputs with Zod schemas
- All invocations are logged via `ComplianceEngine` with action codes `OPENCLAW_*`
