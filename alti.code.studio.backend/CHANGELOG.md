# Changelog — Alti.Code.Studio Backend

All notable changes to the backend will be documented here.

## [v7.6.0] — 2026-02-26

### Deep Open Source Integration Sprint

#### New Services (`src/app/modules/openclaw/`)
- **`acpx.service.js`** — ACP session manager wrapping the `acpx` CLI via `child_process.spawn`. APIs: `createSession()`, `prompt()`, `exec()`, `listSessions()`, `closeSession()`. Replaces all mock ACP stubs.
- **`lobster.service.js`** — Typed workflow pipeline bridge to `openclaw/lobster`. `runPipeline(type, payload)` dispatches to the Lobster DSL interpreter as a subprocess.
- **`clawhub.service.js`** — REST client for the ClawhHub skill directory (`clawhub.ai`). 5-minute LRU cache; `listSkills()`, `searchSkills(q)`, `getSkillDetail(id)`.
- **`agent-skills.service.js`** — Bridges the `Agent-Skills-for-Context-Engineering` submodule. Indexes SCRATCHPAD, SELECTOR, COMPRESSOR, TOKEN-BUDGET, CONTEXT-DISTILLERY patterns from SKILL.md files. `applyPattern(name, context)` returns an optimized context.
- **`deer-flow.service.js`** — Python subprocess bridge to ByteDance's `deer-flow` SuperAgent harness. `runResearch(query, opts)` → async task with polling via `getStatus(taskId)`. Timeout 5 min, structured JSON report output.
- **`pageindex.service.js`** — Vectorless RAG service using `VectifyAI/PageIndex`. `indexDocument(path)`, `query(q)` → `{ answer, pages[] }`. No embeddings or vector database required.
- **`nano-agent.service.js`** — Iterative read/write/bash tool loop implementing the `learn-claude-code` pattern. `runTask(goal)` runs up to 20 tool-call iterations using `GeminiAiService` + `child_process`, with self-correction on failure.
- **`index.js`** — Updated to re-export all 8 new services.

#### Upgraded Services
- **`skills.bridge.js`** — Replaced 2-item hardcoded stub with real recursive SKILL.md file scanner across: `submodules/openclaw/skills/`, `submodules/agent-skills-context/`, and ClawhHub live registry (offline fallback). Added `getSkillsBySource()`, `searchSkills()`, `getMcpToolDefinitions()` with parameterized input schemas.
- **`core.integration.js`** — Replaced `setTimeout` mock with real `acpxService.exec()` / `acpxService.prompt()` ACP dispatch. Added Lobster workflow support (`executeWorkflow()`), Zod schema validation, circuit breaker with `recordSuccess()/recordFailure()`, and `complianceEngine.log()` audit for every dispatch.

#### New Agents (`src/app/modules/agents/`)
- **`agent-skills-context.agent.js`** (`contextEngineering` / `context-engineering-queue`) — Context Engineering Meta-Agent applying patterns from Agent-Skills. Selects the optimal pattern (SCRATCHPAD for exploration, COMPRESSOR for large context, TOKEN-BUDGET for constrained windows) and applies it to enhance incoming prompts.
- **`deer-flow.agent.js`** (`deepResearch` / `deer-flow-queue`) — Deep Research Agent powered by ByteDance deer-flow. Routes high-complexity research tasks to the harness; falls back to direct Gemini for simpler queries.
- **`pageindex.agent.js`** (`pageIndexRAG` / `pageindex-queue`) — Vectorless Reasoning RAG Agent. Indexes documents on demand and answers queries with page-level citations, no vector database.
- **`learn-claude-code.agent.js`** (`nanoCodeAgent` / `nano-agent-queue`) — Nano Code Agent implementing the minimal bash-loop pattern. Autonomous, iterative, self-correcting code execution up to 20 tool steps.

#### Registry & Routing
- **`agent.registry.js`** — Registered 4 new agents: `contextEngineering`, `deepResearch`, `pageIndexRAG`, `nanoCodeAgent`.
- **`capability.router.js`** — Added 4 new keyword route entries with 44 total new keywords. Router now has **204 routes** total.

#### Submodules Added (all MIT, all via `git submodule add`)
- `submodules/agent-skills-context` — `muratcankoylan/Agent-Skills-for-Context-Engineering` (10.7k ⭐)
- `submodules/deer-flow` — `bytedance/deer-flow` (20.5k ⭐)
- `submodules/pageindex` — `VectifyAI/PageIndex` (17.7k ⭐)
- `submodules/learn-claude-code` — `shareAI-lab/learn-claude-code` (18k ⭐)

#### Documentation
- `docs/OPENCLAW_INTEGRATION.md` — Fully rewritten to cover all 8 services, 4 agents, routing, security model, subprocess isolation.
- `docs/ARCHITECTURE.md` — Updated version → 7.6.0, agent count → 319+, route count → 204, added `openclaw/` module map section.
- `AGENTS.md` — Updated header count → 319+, routes → 204, added Tier 13b Deep OS Integration table, updated External Tool Agents table.
- `docs/OPEN_SOURCE_INTEGRATIONS.md` — **New** deep-dive reference for all 4 integrated repos.

## [v7.5.0] — 2026-02-23

### Phase 57 - The 200-Agent Ascendancy (Final Milestone)
- Scaffolded final 30 hyper-specialized agents (171-200): QNX/AUTOSAR, VASP Materials DFT,
  CESM Climate, EPICS Fusion, ObsPy Seismology, OpenFOAM CFD, Intel Loihi Neuromorphic SNN,
  Gaussian Computational Chemistry, CERN ROOT HEP, MONAI Medical Imaging AI, QIIME2 Metagenomics,
  EpiModel Epidemiology, OpenBCI BCI, LoRaWAN AgTech, Acoustic ROV, OpenROAD EDA, DWDM Optical,
  ARINC 429 Avionics, Stratum V2 Mining, IEC 61850 Power Grid, Slic3r 3D Print, Gurobi MILP,
  Volatility DFIR, Prophet Actuarial, Essentia Audio DSP, SUMO Traffic Sim, NLTK Linguistics,
  Hawk-Eye Sports, Orekit Astrodynamics, BB84 Quantum Key Distribution (QKD).
- `capability.router.js` now has 200 total semantic routing paths.
- `INDUSTRY_AGENTS.md` documents all 30 new agents (171-200).

### Step 2 - Enterprise Agent Hub Seeding
- Executed `market.seeder.js` successfully publishing 315 native agents to the Enterprise Agent Hub.
- Fixed template literal escape bugs in `solana_rust.agent.js` and `gaussian_chemistry.agent.js`.
- Removed duplicate import of `stripeTreasuryAgent` from `capability.router.js`.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [7.3.0] - 2026-02-23 — VIP Enterprise Deep Integration

### Added
- **Phase 48: Core Infrastructure Mastery**: Generated 21 deep-expert agents covering complex operational areas (Governance, Procurement, Quality Assurance, Audit/Forensics, Site Reliability Engineering, etc.). Upgraded `phases48_50.test.js` covering data pipelines, ML indexing, and cross-integration execution.
- **Phase 49: Strategic VIP Integrations**: Generated another set of 21 deep-expert agents (totaling 42 for the session) integrating specific enterprise tools (Stripe, Splunk, Twilio, Snowflake, AWS, Azure, Google Cloud, Okta, Jira, GitHub Enterprise, PagerDuty, Datadog, ServiceNow, Salesforce, Zendesk, Marketo, Workday, SAP, Oracle). Total swarm size hits 316 distinct agents.
- **Phase 50: Enterprise Search Engine**: Established the global Enterprise Search capability. Includes the `/search` REST API built upon Node TF-IDF TF/IDF multi-entity scoring (Agents, Tenants, Dispatches, Logs, Workflows), fuzzy matching, and live analytics. Coupled with a globally-available `OmniSearch` frontend UI component bounded to `Cmd+K` inputs.

## [7.2.0] - 2026-02-23 — OpenClaw Deep Integrations & Autonomic Reliability
### Added
- **Phases 43 & 44: OpenClaw Deep Integration**: Cloned and integrated 19 core submodules from the OpenClaw ecosystem (Flawd-bot, Barnacle, Lobster, Trust, Voice, etc.) into the architecture, enabling native chat bridging.
- **Phase 45: Autonomic Distribution & Reliability Upgrade**: Refactored `OrchestratorAgent` volatile memory Map to persistent Redis hashes. Refactored `AutonomicService` to generate Redis atomic SETNX locks to prevent AST surgery duplication during parallel scaling.

## [5.0.0] - 2026-02-22 — Multimodal Freedom & Zero-Trust Hardening

### Added — Web Intelligence & GUI Automation (Phases 15–16)
- **Phase 15: `browser_use.service.js`** — Deep integration of `browser-use/browser-use`, allowing `surferAgent` to autonomously spin up ephemeral Google Chrome / Playwright contexts to navigate, click, and scrape authenticated web portals via LangChain + Gemini.
- **Phase 16: `agent_s.service.js`** — Natively integrated `simular-ai/Agent-S`. The new "GUI Operator" (`agent_s.agent.js`) agent can process desktop screenshots via multimodal inference (UI-TARS/Gemini) and map absolute `(x, y)` coordinate clicks and keystrokes using `pyautogui`, essentially giving the Swarm physical hands.
- **Docker Vision Overhaul** — Added heavy machine-vision dependencies (`tesseract-ocr`, `libtesseract-dev`, `python3-tk`, `opencv-python`, `pillow`) into the production container image for zero-config GUI execution.

### Added — Enterprise Security Hardening (Phase 17)
- **Zero-Trust Middleware Suite** — Globally injected `express-mongo-sanitize` (against NoSQL injections), `xss-clean` (against cross-site scripting), and `hpp` (against HTTP Parameter Pollution) into `index.js`.
- **Global Volumetric DDoS Guard** — Re-enabled and hardened `express-rate-limit` (100req/min) on all `/api` routes.
- **Graceful Fault Tolerance** — Refactored Node.js `process.on('uncaughtException')` and `unhandledRejection` handlers in `server.js` to trigger a controlled `server.close()` instead of swallowing corrupt memory states.
- **Strict Payload Zod Contracts** — Designed and enforced `SwarmValidation` and `OrchestratorValidation` strict Zod schemas on `/route`, `/dispatch`, `/fanout`, and `/mission` endpoints to guarantee clean, unpolluted data pipelines.

---

## [4.1.0] - 2026-02-22 — Gemini CLI Hub + Bug Fixes

### Added — Gemini CLI Hub (Frontend)
- `/gemini-studio` page completely rewritten as a **4-tab developer hub** with Google Cloud-native design (`#1a73e8` palette, dark console aesthetic, Google Sans)
  - **Terminal tab** — live REPL with `gemini›` prompt, ↑/↓ command history, quick-action buttons, colour-coded output
  - **Extensions Marketplace** — searchable, filterable gallery of **200+ real extensions** sourced from geminicli.com; Spotlight/Official presets; official GCP extensions (`firebase`, `spanner`, `bigquery`, `gcloud`) flagged ✦ OFFICIAL
  - **Installed tab** — live `gemini extensions list` query, invoke with args, output display
  - **Builder tab** — scaffold `GEMINI.md` + `index.js` + `package.json` for a new extension via a web form
- `lib/gemini-extensions.ts` — full typed catalog of 200+ Gemini CLI extensions with `GeminiExtension` interface, 11 categories, `spotlight`/`official` flags, and `installCmd()` helper
- **Sidebar** — "Gemini CLI Hub" entry added with Google Blue Terminal icon (`Terminal` from lucide-react)

### Added — Gemini CLI & Extensions API
- **`POST /api/gemini-cli/stream`** — SSE streaming endpoint; pipes `gemini` process stdout/stderr in real time
- **`GET  /api/gemini-cli/history`** — returns in-memory session command history (bounded at 200 entries)
- **`DELETE /api/gemini-cli/history`** — clears current session history
- **`GET  /api/gemini-extensions/list`** — executes `gemini extensions list --json`
- **`POST /api/gemini-extensions/install`** — executes `gemini extensions install <githubUrl>`
- **`POST /api/gemini-extensions/invoke`** — invokes a named extension with sanitized args
- **`DELETE /api/gemini-extensions/uninstall/:name`** — executes `gemini extensions uninstall <name>`
- New module: `src/app/modules/geminiExtensions/` (`geminiExtension.service.js` + `geminiExtension.route.js`)

### Fixed — Bug Fixes (rolling audit)
- **`observability.service.js`**: `getRecentTraces()` was referencing `this.recentTraces` (undefined) → corrected to `this.localTraces`
- **`observability.service.js`**: `ingestCloudAlert()` was calling `this.trace()` (doesn't exist) → corrected to `this.emitTrace()`
- **`doc_gen.service.js`**: `enrichFile()` crashed via `this.stats.documented++` when called standalone (before `_resetStats`) → added null guard
- **`vector.store.js`**: `list()` query had no `ORDER BY` — non-deterministic pagination → added `ORDER BY id DESC`
- **`debugAgent.controller.js`**: `getJobStatus` was referenced in the route but never implemented — added it with a bounded 200-entry in-memory job store; converted `startDebug` to async fire-and-return (returns `jobId` immediately, analysis runs in background)
- **`gitAgent.service.js`**: `commitChanges()` always called `git.add('.')` but `syncChanges()` already staged — added `{ skipStage }` option; `syncChanges` now passes `skipStage: true`
- **`geminiCli.controller.js`**: Fixed typo bug (`runCommand, se` → `sendResponse`)

### Changed
- `src/app/routes/index.js` — registered `/gemini-cli` and `/gemini-extensions` module routes
- `geminiCli.service.js` — added `streamGeminiCLI()` (SSE) and bounded in-memory session history
- `geminiExtension.service.js` — added `installExtension`, `uninstallExtension`, `invokeExtension`

---

## [4.0.0] - 2026-02-21 — The Industry Armada

### Added — Industry Vertical Agents (Phases 7–11)

#### Phase 7: Real Estate & PropTech (5 agents — `747b628`)
- `zillow.agent.js` — Bridge Interactive MLS API, Zestimate AVM, Walk Score, GreatSchools, mortgage formula
- `buildium.agent.js` — Property/unit/lease/tenant CRUD, rent + GL accounting, maintenance request lifecycle
- `procore.agent.js` — Construction RFIs, Submittals, Daily Logs (crew/weather), Budget/change orders, Punch List
- `guesty.agent.js` — STR/Airbnb channel manager: calendar blocking, dynamic pricing, guest messages, cleaning
- `attom.agent.js` — Property AVM + FSD confidence, sale comps (CMA), hazard risk (FEMA flood/wildfire/EQ)

#### Phase 8: EdTech + FinTech depth (5 agents — `c4ec5ee`)
- `canvas_lms.agent.js` — PKCE OAuth2, courses/assignments grade passback, Module sequencing, LTI 1.3 AGS
- `google_classroom.agent.js` — Scoped OAuth2, Coursework ASSIGNMENT/MCQ, submission grading, Pub/Sub
- `zoom_sdk.agent.js` — Server-to-Server OAuth, Meeting + Video SDK, webinars, cloud recordings, HMAC webhook
- `brightspace.agent.js` — LE/LP API versioning, GradeBook PointsNumerator, SCORM upload+tracking, BDP analytics
- `alpha_vantage.agent.js` — 50+ indicators (RSI/MACD/BBANDS/ATR), fundamentals, forex/crypto, news sentiment

#### Phase 9: Cybersecurity + Marketing (6 agents — `bfaa678`)
- `virustotal.agent.js` — File/URL/IP/domain scan, YARA Livehunt, sandbox MITRE ATT&CK, IOC pivot
- `shodan.agent.js` — Host lookup (ports/banners/CVEs/SSL), advanced search, monitoring alerts, exploit DB OSINT
- `crowdstrike.agent.js` — OAuth2 Detections API, RTR remote commands, host containment, custom IOC prevent
- `splunk.agent.js` — SPL queries (failed logins/Sysmon/geo), HEC ingestion, saved search cron, KV Store IOC
- `hibp.agent.js` — Email breach lookup, k-anonymity Pwned Passwords SHA-1 prefix, domain monitoring
- `klaviyo.agent.js` — Revision-header API, profile upsert, ecommerce Flows, campaign send-job, SMS

#### Phase 10: Gaming + FinTech depth (2 agents — `24073e6`)
- `agora.agent.js` — AccessToken2, in-game voice, Spatial Audio 3D, Cloud Recording S3, RTMP push to Twitch
- `stripe_treasury.agent.js` — Financial accounts, InboundTransfer ACH, Issuing virtual card, spending_limits

#### Phase 11: Orchestrator Wiring (`b2b3778`)
- `capability.router.js` — Expanded from **114 → 141 keyword routes** (+22 new industry entries + 5 imports)
- All 22 new agents now auto-routed by keyword (Guesty/Canvas/VirusTotal/HubSpot etc.)

### Added — Documentation
- `INDUSTRY_AGENTS.md` — Deep-dive reference covering auth, APIs, SDKs, env vars for all 16 industry verticals
- `AGENTS.md` — Updated to 245+ agents, 141 routes, 16 vertical tables with full agent breakdown

### Changed
- Platform version: **v4.0 — "The Industry Armada"**
- Agent count: **245+** (up from 120+)
- Capability Router routes: **141** (up from 114)

---

## [3.0.0] - 2026-02-20 — The Grand Swarm

### Added — Cloud Agents Wave 2 (8 new providers — total cloud agents: 21)
- `render.agent.js` — Render.com (web services, workers, cron, Blueprints IaC)
- `linode.agent.js` — Linode/Akamai Cloud (LKE, Object Storage, NodeBalancers, StackScripts)
- `vultr.agent.js` — Vultr (VKE Kubernetes, Bare Metal, Block/Object Storage)
- `scaleway.agent.js` — Scaleway (Kapsule K8s, Serverless, GDPR-compliant EU cloud)
- `ovhcloud.agent.js` — OVHcloud (Public Cloud, Dedicated Servers, OpenStack)
- `neon.agent.js` — Neon (serverless Postgres, database branching, autoscale to zero)
- `fastly.agent.js` — Fastly (VCL, Compute@Edge WASM, origin shielding, NGWAF)
- `backblaze.agent.js` — Backblaze B2 (S3-compatible, Bandwidth Alliance, lifecycle rules)

### Added — Language Agents Tier 17: Systems (8 agents)
- `c.agent.js` — C11/C17, POSIX, manual memory, GCC/Clang/Valgrind
- `cpp.agent.js` — C++23, RAII, STL, templates, move semantics, concurrency
- `csharp.agent.js` — C# 12/.NET 8, LINQ, EF Core, ASP.NET Core, Blazor
- `java.agent.js` — Java 21, virtual threads, records, Spring Boot 3, Hibernate
- `kotlin.agent.js` — Kotlin 2.0, coroutines, Flow, KMP, Android/Compose, Ktor
- `swift.agent.js` — Swift 6, actors, SwiftUI, SPM, Vapor
- `zig.agent.js` — Zig 0.13+, comptime, allocators, cross-compilation
- `nim.agent.js` — Nim 2.0, ARC/ORC, macros, Nimble

### Added — Language Agents Tier 18: Dynamic/Scripting (8 agents)
- `ruby.agent.js` — Ruby 3.3, Rails 7, metaprogramming, RSpec, Sidekiq
- `php.agent.js` — PHP 8.3, Fibers, Laravel 11, Eloquent, Pest
- `perl.agent.js` — Perl 5.38, Moose, CPAN, regex engine, BioPerl
- `r.agent.js` — R 4.x, tidyverse, ggplot2, Shiny, tidymodels, Quarto
- `julia.agent.js` — Julia 1.10+, multiple dispatch, Flux.jl, DataFrames.jl
- `matlab.agent.js` — MATLAB R2024a, Simulink, DSP/Control toolboxes
- `powershell.agent.js` — PowerShell 7+, DSC, Az module, Pester
- `groovy.agent.js` — Groovy 4.x, Gradle DSL, Jenkinsfile, Grails

### Added — Language Agents Tier 19: Functional (8 agents)
- `haskell.agent.js` — GHC 9.8, type classes, monads, lens, Servant
- `elixir.agent.js` — Elixir 1.17, OTP, Phoenix LiveView, Ecto, GenServer
- `erlang.agent.js` — Erlang/OTP 27, BEAM, actor model, mnesia, rebar3
- `scala.agent.js` — Scala 3, Cats Effect, ZIO, Akka/Pekko, Spark
- `fsharp.agent.js` — F# 8, DUs, computation expressions, Fable, Giraffe
- `ocaml.agent.js` — OCaml 5, effects, Dune, Eio, functors, Dream
- `clojure.agent.js` — Clojure 1.12, core.async, Datomic, ClojureScript, Re-frame
- `racket.agent.js` — Racket 8.x, macros, continuations, Typed Racket

### Added — Language Agents Tier 20: Legacy & Specialized (15 agents)
- `cobol.agent.js` — COBOL 2023, z/OS, CICS, VSAM, JCL, GnuCOBOL
- `fortran.agent.js` — Fortran 2023, OpenMP, MPI, LAPACK, BLAS
- `ada.agent.js` — Ada 2022, SPARK, DO-178C, IEC 61508, Ravenscar, GNAT
- `assembly.agent.js` — x86-64 NASM, ARM64/AArch64, SIMD/AVX, calling conventions
- `objc.agent.js` — Objective-C 2.0, ARC, Cocoa/CocoaTouch, runtime, Swift bridging
- `crystal.agent.js` — Crystal 1.x, macros, Fibers, Lucky framework, Shards
- `lua.agent.js` — Lua 5.4, LuaJIT, OpenResty, LÖVE2D, metatables
- `apl.agent.js` — Dyalog APL, J, K, kdb+/Q, array-oriented programming
- `vhdl.agent.js` — VHDL 2019, SystemVerilog, FPGA, UVM, Vivado/Quartus
- `apex.agent.js` — Salesforce Apex, SOQL, LWC, Flows, governor limits
- `abap.agent.js` — SAP ABAP 7.5+, CDS views, RAP, BAPI, S/4HANA
- `prolog.agent.js` — SWI-Prolog, CLP(FD), Datalog, backtracking, DCG
- `dart.agent.js` — Dart 3.5+, null safety, isolates, FFI, patterns
- `wolfram.agent.js` — Wolfram Language/Mathematica, symbolic math, notebooks
- `plsql.agent.js` — Oracle PL/SQL, T-SQL, packages, cursors, bulk collect

### Added — System Infrastructure
- `base_specialist.agent.js` — Fully hardened base class (retry, timeout, circuit breaker, input validation, context truncation, typed `AgentError`, per-agent metrics)
- `AGENTS.md` — Complete agent roster documentation
- `ARCHITECTURE.md` — Full system architecture documentation (rewritten)
- `scripts/test_hardening.js` — Integration test: 54/55 assertions passing

### Changed
- `capability.router.js` — Completely rewritten with 114 routing entries across all tiers
- All Wave 2 cloud agents use `_invoke()` pattern compatible with hardened base
- `README.md` — Completely rewritten (was stale AONS CODE content)
- `ARCHITECTURE.md` — Completely rewritten (was mock Gemini stub)

---

## [2.1.0] - 2026-02-20 — System Architecture

### Added
- `capability.router.js` — Semantic agent routing engine
- `swarm.health.js` — Live health monitor with periodic sweeps
- `agent.index.js` — Searchable agent capability catalog
- `swarm.controller.js` — Swarm REST API (`/api/swarm`)
- Integration of Tier 16 cloud agents (Cloudflare → Railway)
- `scripts/test_system_improvements.js` — 20/20 passing

---

## [2.0.0] - 2026-02-19 — The Hive Mind

### Added
- LangGraph `GraphOrchestrator` with full `plan → guard → execute → review → recover` pipeline
- 80+ domain specialist agents across Tiers 9–15
- RAG-powered memory: Qdrant vector store + Mem0
- OpenTelemetry + Langfuse observability integration
- Voice agent: LiveKit + ElevenLabs
- `scripts/test_final_suite.js` — end-to-end swarm verification

### Fixed
- Race conditions in agent log writing
- Circular dependency in agent registry
- Redis Synapse mock mode for offline development

---

## [1.0.0] - 2026-02-14 — Enterprise Foundation

### Added
- Modular `src/app/modules/` architecture
- JWT RS256 auth + RBAC (admin/user/owner)
- AuditService for immutable action logging
- MongoDB + Redis integration
- Socket.IO real-time communication
- Rate limiting, input validation middleware

