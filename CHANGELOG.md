# Changelog

All notable changes to **Alti.Code.Studio** will be documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [7.1.0] - 2026-02-23 — Third-Party Autonomy Integrations
### Added
- **Phase 3: PentAGI Integration**: Deep integration with `vxcontrol/pentagi` for autonomous penetration testing and container security scanning. Added `pentagi.service.js` and `pentagi.agent.js`, alongside the new frontend `PentagiSessionPanel` and backend container routing.
- **Phase 5: FossFLOW Integration**: Integration with `stan-smith/fossflow` for autonomous isometric architectural diagramming graphic canvas. Added `fossflow.service.js` and `fossflow.agent.js`, with the new frontend `FossflowSessionPanel` iframe PWA.

## [7.0.0] - 2026-02-22 — The Transcendence Era (Phases 29, 30, 31, 32)
### Added
- **Phase 29: The Autonomous Board of Directors**: AI C-Suite simulation (CEO, CTO, CFO) via `board.service.js` which synthesizes macro market trends and infrastructure stats into Autonomous Epics injected straight into the Sprint Scheduler.
- **Phase 30: The Biomimetic Neural Net**: The static capability router was replaced by `neural.router.js`, utilizing Reinforced Learning weights based on the historical Sprint performance scores of individual agents.
- **Phase 31: The Legal Oracle**: Added `legal.agent.js` to block open-source copyleft contamination (GPLv3) during the Deploy Gate and to draft Provisional Software Patents/EULAs for novel generated logic before deployment.
- **Phase 32: The Metamorphic Core**: The ultimate evolutionary leap; `metamorphicCore.service.js` grants the Swarm root access to profile and submit refactoring Pull Requests against its own Orchestration logic, achieving a closed-loop continuous evolution.

---

## [6.9.0] - 2026-02-22 — The Singularity Era (Phases 25, 26, 27, 28)

### Added
- **Phase 25: The Omniscient FinOps**: Autonomous cloud-cost arbitrage and carbon intensity workload routing via `finops.agent.js`.
- **Phase 26: The Synthetic Demographics**: Phantom user generation using vision-capable Playwright sessions for heuristic UX debugging via `syntheticUser.agent.js`.
- **Phase 27: The Cryptographic Vanguard**: Codebase scanning and automatic refactoring of weak encryption to Modern/PQC standards via `quantumSec.agent.js`.
- **Phase 28: The Physical Bridge**: Real-World IoT integration via C/C++ FreeRTOS payload generation and MQTT OTA flashing via `hardware.agent.js`.

---

## [6.8.0] - 2026-02-22 — The Final Odyssey (Phases 22, 23, 24)

### Added
- **Phase 22: Autonomous SRE & Production Self-Healing (The Sentinel Swarm)**
  - Remote Axiom cloud telemetry ingestion via `telemetry.service.js` polling.
  - SRE Agent triage for Sev-1 anomalies with priority 0 hotfix sprint injection.
  - Sub-second Vercel auto-rollback integration in `deployment.agent.js`.
- **Phase 23: The Visual Cortex (Figma-to-Code Autonomy)**
  - `DesignerAgent` integration with Figma REST API for node and style tree extraction.
  - Autonomous translation of Figma UI layouts to React/Tailwind code via Gemini.
  - Native Figma ingestion inside `genesis.service.js` prior to architecture planning.
- **Phase 24: Enterprise Knowledge Graph (The Corporate Brain)**
  - `KnowledgeAgent` integration with Atlassian Jira APIs for sprint constraint context.
  - Automatic Jira transition state management upon Sprint deployment.
  - Slack CI/CD post-deployment broadcast executive summaries.

---

## [6.7.0] - 2026-02-22 — The Panopticon & Cortex Memory

### Added
- **Phase 5: Cortex Long-Term Memory & Enterprise RAG**: 
  - Integrated Google Cloud Vertex AI text embeddings with native PostgreSQL \`pgvector\`.
  - Added Organization Wiki (\`wiki.service.js\`) to auto-embed Architecture Decision Records (ADRs).
  - Tacked RAG queries into \`autonomousSprint.service.js\` so the Swarm fetches past constraints before sprinting.
  - Finalized syntax fixes across all 245+ agents for unescaped GitHub Actions variables.
- **Phase 6: Global Verification & Release**:
  - Validated all 419 vitest cases covering hardening, routing, and language agents.
  - Validated TypeScript compiling and strict linting for the Electron Next.js frontend UI.

---

## [4.0.0] - 2026-02-21 — The Industry Armada

### Added — Industry Vertical Agents (Phases 7–10)

#### Phase 7: Real Estate & PropTech (5 new agents)
- `zillow.agent.js` — Bridge Interactive MLS API, Zestimate AVM, Walk Score, GreatSchools ratings, mortgage formula with PMI
- `buildium.agent.js` — Property/unit/lease/tenant CRUD, rent charges + GL accounting, maintenance request lifecycle
- `procore.agent.js` — Construction RFIs, Submittals, Daily Logs (crew/weather), Budget + change orders, Punch List QA
- `guesty.agent.js` — STR/Airbnb channel manager, calendar blocking, dynamic pricing, automated guest messages, cleaning tasks
- `attom.agent.js` — Property AVM with FSD confidence, sale comps (CMA), neighborhood demographics, hazard risk (FEMA/wildfire/EQ)

#### Phase 8: EdTech & Education (4 new agents) + Alpha Vantage FinTech depth
- `canvas_lms.agent.js` — PKCE OAuth2, courses/assignments + grade passback, Module sequencing, Quiz engine, LTI 1.3 AGS
- `google_classroom.agent.js` — Scoped OAuth2, Coursework ASSIGNMENT/MCQ, submission grading + return, Pub/Sub push notifications
- `zoom_sdk.agent.js` — Server-to-Server OAuth, Meeting + Video SDK custom UI, webinars, cloud recordings, HMAC webhook
- `brightspace.agent.js` — LE/LP API versioning, GradeBook PointsNumerator grade passback, SCORM upload + tracking, BDP analytics
- `alpha_vantage.agent.js` — 50+ technical indicators (RSI/MACD/BBANDS/ATR), fundamental income/earnings, forex/crypto, news sentiment

#### Phase 9: Cybersecurity & Threat Intel (5 new agents) + Klaviyo Marketing
- `virustotal.agent.js` — File/URL/IP scan, YARA Livehunt rules, behavioral sandbox MITRE ATT&CK, IOC pivot graph
- `shodan.agent.js` — Host lookup (ports/banners/CVEs/SSL), advanced search, continuous monitoring alerts, exploit DB cross-reference
- `crowdstrike.agent.js` — OAuth2 Detections API, RTR remote command execution, host containment, custom IOC prevent/detect
- `splunk.agent.js` — SPL queries (failed logins/Sysmon/geo), HEC log ingestion, saved search cron alerts, KV Store, SOAR trigger
- `hibp.agent.js` — Email breach lookup, k-anonymity Pwned Passwords SHA-1 prefix, domain monitoring
- `klaviyo.agent.js` — Revision-header API, profile upsert, ecommerce Flows (abandoned cart/winback), campaign send-job, SMS

#### Phase 10: Gaming + FinTech Depth (2 new agents)
- `agora.agent.js` — AccessToken2, in-game voice chat, Spatial Audio 3D, Cloud Recording S3 composite, RTMP push to Twitch
- `stripe_treasury.agent.js` — Financial accounts, InboundTransfer ACH, OutboundPayment to unverified bank, Issuing virtual card

#### Phase 11: Orchestrator Wiring — capability.router.js
- **141 keyword routes** (up from 114) — 22 new entries for all Phase 7-10 industry agents
- Auto-routing examples: `"Guesty calendar block"` → GuestyAgent; `"YARA rule CobaltStrike"` → VirusTotalAgent; `"Canvas LMS grade passback LTI"` → CanvasLmsAgent

### Added — Documentation
- `INDUSTRY_AGENTS.md` — New comprehensive deep-dive reference for all 16 industry vertical agents with auth patterns, API endpoints, SDK usage, capabilities, and environment variable consolidation
- `AGENTS.md` — Updated to reflect 245+ agents and 16 industry verticals with full table coverage
- Monorepo `README.md` — Updated to v4.0 "The Industry Armada" with 141 capability router routes

### Changed
- Platform version bumped to **v4.0** — "The Industry Armada"
- Total agent count: **245+** (up from 120+)
- Capability Router: **141 routes** (up from 114)
- Frontend agents-showcase: **16 sections** (up from 14)

---

## [3.1.0] - 2026-02-21 — Agent Store & Plugin System

### Added
- **Marketplace Service v2**: File-based JSON registry (`plugins/registry.json`) replacing hardcoded stub. Supports full CRUD: install, uninstall, list catalog, list installed, and search by keyword/category.
- **YAML DSL Agent Loader** (`agents/yaml_agent_loader.js`): Define new specialist agents via `.agent.yaml` files without writing JavaScript. Hot-reloads via `fs.watch` — no server restart required.
- **Example YAML Definitions**: `python.datascience.agent.yaml` and `solidity.auditor.agent.yaml` shipped as reference implementations in `agents/definitions/`.
- **Marketplace Mongoose Model** (`marketplace.model.js`): Persistent DB-backed tracking of installed agents with semver validation, category indexing, and full-text search.
- **New API Routes**:
  - `GET  /api/v1/marketplace/agents?search=&category=` — filtered catalog
  - `GET  /api/v1/marketplace/agents/:agentId` — single agent detail
  - `GET  /api/v1/marketplace/installed` — installed agents list
  - `DELETE /api/v1/marketplace/uninstall/:agentId` — remove agent + registry entry
- **Frontend `/marketplace` Page**: Browse catalog with search (debounced), category filter pills, animated cards, optimistic install/uninstall, and toast notifications.
- **AgentCard Component** (`components/marketplace/AgentCard.tsx`): Reusable animated card with install/uninstall CTA and animated state transitions.
- **Borg Unit Tests**: `Director.test.js` (7 test cases), `GrandUnification.test.js` (4 integration tests) using Vitest.

### Fixed
- Sidebar Marketplace link corrected from `/enterprise/marketplace` → `/marketplace`
- Sidebar version display updated to `v3.1.0`

---

## [3.0.0] - 2026-02-20 — The Grand Swarm

### Added — Agent Expansion

#### Cloud Agents Wave 2 (8 new providers — total: 21)
- `render.agent.js` — Render.com PaaS (web services, workers, Blueprints IaC)
- `linode.agent.js` — Linode/Akamai Cloud (LKE, Object Storage, StackScripts)
- `vultr.agent.js` — Vultr (VKE Kubernetes, Bare Metal, Object Storage)
- `scaleway.agent.js` — Scaleway (Kapsule K8s, Serverless, GDPR-compliant EU)
- `ovhcloud.agent.js` — OVHcloud (Public Cloud, Dedicated Servers, OpenStack)
- `neon.agent.js` — Neon (serverless Postgres, database branching, zero-scale)
- `fastly.agent.js` — Fastly (VCL, Compute@Edge WASM, origin shielding, NGWAF)
- `backblaze.agent.js` — Backblaze B2 (S3-compatible, Bandwidth Alliance, lifecycle)

#### Language Agents — Tier 17: Systems (8 agents)
C · C++ · C# · Java · Kotlin · Swift · Zig · Nim

#### Language Agents — Tier 18: Dynamic/Scripting (8 agents)
Ruby · PHP · Perl · R · Julia · MATLAB · PowerShell · Groovy

#### Language Agents — Tier 19: Functional (8 agents)
Haskell · Elixir · Erlang · Scala · F# · OCaml · Clojure · Racket

#### Language Agents — Tier 20: Legacy & Specialized (15 agents)
COBOL · Fortran · Ada · Assembly (x86-64/ARM64) · Objective-C · Crystal · Lua · APL/J/K/Q · VHDL/SystemVerilog · Apex (Salesforce) · ABAP (SAP) · Prolog · Dart · Wolfram Language · PL/SQL

### Added — System Infrastructure
- `base_specialist.agent.js` — Fully hardened base class with retry, timeout, circuit breaker, input validation, context truncation, typed `AgentError`, and per-agent metrics
- `capability.router.js` — Completely rewritten with 114 routing entries covering all tiers (Tier 6/7 through Tier 20)
- `test_hardening.js` — Integration test suite: 54/55 assertions covering hardening + all new agents
- `test_phase15.js` — Language agent validation: 39/39 passing
- **All documentation** updated to reflect v3.0 platform state

### Changed
- All language agents migrated to use `_invoke()` pattern for hardening compatibility
- `capability.router.js` imports now use aligned column spacing for readability
- Backend `README.md` completely rewritten (was stale AONS CODE content)
- Backend `ARCHITECTURE.md` completely rewritten (was mock Gemini stub)

---

## [2.1.0] - 2026-02-20 — System Architecture (Phase 14)

### Added
- `capability.router.js` — Semantic routing engine (keyword scoring, fan-out)
- `swarm.health.js` — Live health monitoring with periodic sweeps
- `agent.index.js` — Searchable agent catalog
- `swarm.controller.js` — REST API surface at `/api/swarm`
- Swarm routes mounted at `/api/swarm` in `routes/index.js`
- `specialist: capabilityRouter` integration in `executeNode`
- `swarmHealthMonitor.start()` on orchestrator initialization
- `test_system_improvements.js` — 20/20 passing integration tests

### Added — Cloud Agents Wave 1 (Tier 16 — 10 providers)
Cloudflare · Vercel · Netlify · DigitalOcean · Oracle Cloud · IBM Cloud · Alibaba · Hetzner · Fly.io · Railway

---

## [2.0.0] - 2026-02-19 — The Hive Mind

### Added
- **Phase 9 — Autonomic Self-Repair**: SurferAgent (live web), SchemaAgent, DebugAgent, SurgeonAgent, GuardianAgent
- **Phase 26–32 — Grand Swarm**: 80+ domain specialist agents across 7 tiers
  - Tier 9: SEO, Accessibility, Onboarding, API Design, Incident, Migration, Cost
  - Tier 12: Docker, Kubernetes, Nginx, GraphQL, Bash, Cron, FFmpeg, JWT, Three.js, Regex
  - Tier 13: Stripe, Redis, Supabase, Prisma, WebRTC, Solidity, Svelte, Vue, Storybook, OpenTelemetry, Ansible, Terraform
  - Tier 14: LangChain, MLOps, Prompt Engineering, React Native, Flutter, PWA, Vitest, Playwright, SQL, Elasticsearch, Kafka
  - Tier 15: Pentest, GitHub Actions, Figma, WebAssembly, Deno, MongoDB, gRPC, Tailwind, i18n, WebSocket
- **Agentic UI Canvas** (`AgentCanvas.tsx`) — React Flow visualization of agent pipelines
- **Electron Split-Screen**: Developer IDE + production browser side-by-side
- **Backend Health Service**: periodic monitoring of all critical system components
- LangGraph `GraphOrchestrator` as the central planning and execution engine

### Changed
- Complete frontend redesign with premium Glassmorphism aesthetic
- Centralized logging via `AuditService`
- MongoDB integration hardened with Mongoose schemas

---

## [1.0.2] - 2026-02-19

### Changed
- Submodules synchronized to latest remote commits
- Resolved merge conflicts in `.borg` worktree directories

---

## [1.0.1] - 2026-02-15

### Added
- `SUBMODULE_DASHBOARD.md` generated by `scripts/generate_dashboard.js`
- `docs/LLM_INSTRUCTIONS.md`, `docs/VISION.md`, `docs/MEMORY.md`, `docs/DEPLOY.md`
- Version display in Frontend Sidebar (`v1.0.1`)
- `/api/version` endpoint in backend
- `ROADMAP.md` and `TODO.md`

---

## [1.0.0] - 2026-02-14 — Enterprise Release

### Added
- Unified "Universe" Architecture (Desktop + Web)
- RBAC with `admin` / `user` roles and JWT auth
- The Triumvirate personas (User, Admin, Owner)
- The Analyst (cost/velocity tracking)
- The Librarian (auto JSDoc + ARCHITECTURE.md generation)
- The Polyglot (realtime AI translation + i18n)
- The Weaver (autonomous commit/push/PR)
- The Sentinel (dependency scanning + secret detection)
- The Auditor (token usage monitoring)
- The Overseer (CI/CD via GitHub Actions)
- The Architect (multi-agent orchestrator)

---

## [0.9.0] - 2026-02-10 — Beta

- First stable Frontend + Backend integration
- File Explorer, Code Editor, Terminal Emulation

## [0.1.0] - 2026-01-01 — Alpha

- Initial prototype — basic "Hello World" proof of concept
