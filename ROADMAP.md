# Alti.Code.Studio Roadmap

## 🌌 Long-Term Vision

To be the premier AI-native development platform where a self-orchestrating armada of **245+ hyper-specialized agents** spanning **16 industry verticals** autonomously handles the full software delivery lifecycle — from idea to production — while giving engineers and leaders total visibility and control across every technology stack and industry domain.

---

## ✅ Completed

### v3.0.0 — The Grand Swarm (2026-02-20)
- [x] **46 Language Agents**: Expert-level agents for every major programming language (C, C++, Java, Rust, Go, Haskell, Elixir, COBOL, Fortran, Prolog, APL, VHDL, and more)
- [x] **21 Cloud Provider Agents**: AWS · GCP · Azure · Cloudflare · Vercel · Netlify · DO · Oracle · IBM · Alibaba · Hetzner · Fly.io · Railway · Render · Linode · Vultr · Scaleway · OVHcloud · Neon · Fastly · Backblaze
- [x] **Production Hardening**: Every agent has retry, timeout, circuit breaker, input validation, and per-agent metrics via `BaseSpecialistAgent`
- [x] **114-Route Capability Router**: Semantic keyword scoring for automatic agent dispatch
- [x] **Swarm REST API**: `/api/swarm` — health, search, route, dispatch, fan-out

### v2.0.0 — The Hive Mind (2026-02-19)
- [x] **LangGraph Orchestrator**: Full `plan → guard → execute → review → recover` pipeline
- [x] **80+ Domain Specialists**: SDK, security, infra, AI/ML, mobile, data engineering
- [x] **RAG-Powered Memory**: Qdrant vector store + Mem0 for persistent agent memory
- [x] **Observability Layer**: OpenTelemetry, Langfuse, Grafana integration
- [x] **Voice Agent**: LiveKit + ElevenLabs multimodal voice I/O
- [x] **Self-Healing**: Surfer agent browses live web for unknown errors; Surgeon patches code

### v1.0.0 — Enterprise Foundation (2026-02-14)
- [x] **RBAC**: Admin / User / Owner roles with JWT RS256
- [x] **Compliance Dashboard**: Real-time license and security monitoring
- [x] **Audit Logging**: Immutable AuditService for all actions
- [x] **CI/CD Integration**: The Overseer manages GitHub Actions pipelines

---

## 🚀 Upcoming

### v3.1.0 — Agent Store & Plugin System ✅ (2026-02-21)
- [x] **Agent Marketplace**: Discover, install, and publish community specialist agents
- [x] **Custom DSL**: Define new agents via YAML config without writing JS (`yaml_agent_loader.js`)
- [x] **Agent Versioning**: Pin specific agent versions per project (`marketplace.model.js`)
- [x] **Plugin API**: Uninstall, search, detail routes + Mongoose-backed registry

### v4.0.0 — The Industry Armada ✅ (2026-02-21)
- [x] **Real Estate & PropTech (5)**: Zillow (MLS/Zestimate), Buildium (PM), Procore (construction), Guesty (STR/Airbnb), ATTOM (AVM+hazard)
- [x] **EdTech & Education (4)**: Canvas LMS, Google Classroom, Zoom SDK, D2L Brightspace
- [x] **Cybersecurity & Threat Intel (5)**: VirusTotal (YARA/sandbox), Shodan (ASM), CrowdStrike Falcon (EDR), Splunk (SIEM), HaveIBeenPwned
- [x] **Marketing & Analytics (2+)**: HubSpot CRM, Klaviyo (ecommerce flows + SMS)
- [x] **FinTech depth**: Alpha Vantage (50+ indicators), Stripe Treasury (embedded finance/Issuing)
- [x] **Gaming depth**: Agora (voice/Spatial Audio 3D/Cloud Recording)
- [x] **141-Route Capability Router**: 22 new keyword routes wired in `capability.router.js`
- [x] **16-Section Showcase**: Frontend agents-showcase page with all 16 industry verticals
- [x] **INDUSTRY_AGENTS.md**: Comprehensive auth + API reference for all 16 verticals

### v4.1.0 — DevSecOps & Supply Chain Verticals ✅ (2026-02-22)
- [x] **DevSecOps (5)**: Snyk (SCA/SAST/Container/IaC), Semgrep (SAST rules/taint), SonarQube (quality gates/Web API), OWASP ZAP (DAST/active-passive scan), Veracode (SAST/DAST/SCA/pipeline scan)
- [x] **Supply Chain & Logistics (4)**: FedEx (OAuth/rate-quotes/shipment/tracking/labels), ShipBob (3PL fulfillment/inventory/returns/webhooks), Flexport (ocean/air/truck bookings/milestones/documents/carbon), SAP Ariba (PO/invoices/supplier-onboarding/Ariba-Network)
- [x] **Capability Router**: 9 new keyword routes wired in `capability.router.js` (119 → 128 routes)
- [x] **Developer Action Methods**: All agents inherit `generateSDKSetup`, `generateWebhookHandler`, `generateApiCall`, `explainError`, `generateTests`, `debugIntegration` from `BaseSpecialistAgent`
- [x] **Frontend**: `/devsecops` dashboard (severity summary, tool cards, agent console) + `/supply-chain` dashboard (platform cards, quick guides, agent console)


### v4.2.0 — Agriculture, Energy & Heavy Industry ✅ (2026-02-22)
- [x] **AgriTech (3)**: John Deere Operations Center (OAuth/fields/boundaries/telemetry/prescriptions/as-applied), Trimble Ag (farms/operations/Rx/GNSS/RTK), Climate Corporation FieldView (imagery/NDVI/weather/GDD/yield-predictions)
- [x] **Energy & Utilities (3)**: Siemens MindSphere (asset/time-series/anomaly/MindConnect), OSDU (storage/search/workflow/WITSML/SEG-Y), EV & Grid (OCPP 1.6+2.0.1/OCPI/OpenADR/EIA API/V2G)
- [x] **Auto/Manufacturing (1)**: Automotive Digital (VW WeConnect + Mercedes + BMW APIs, OBD-II, J1939, C ATIA PLM, OPC-UA MES)
- [x] **Capability Router**: 8 new routes (128 → 136)

### v4.3.0 — Autonomous Feedback Loops ✅ (2026-02-22)
- [x] **Agent Quality Scoring**: Promptfoo agent (full eval YAML config, assertion types, red-team, CI GitHub Actions, A/B preamble testing, generateAgentEvalSuite())
- [x] **Capability Router**: 1 new route (136 → 137 total routes)

### v5.0.0 — Enterprise Governance ✅ (2026-02-22)
- [x] **Policy-as-Code**: OPA/Rego policies + YAML policy DSL (block/route/audit actions per event)
- [x] **Immutable Audit Log**: SOC2 Type II event schema, QLDB + Azure Confidential Ledger patterns
- [x] **Data Residency Controls**: Route Gemini inference to US/EU/APAC/UK endpoints by user region
- [x] **SSO / SAML + OIDC**: Passport-SAML + OIDC+PKCE integration, RBAC group→role mapping
- [x] **GDPR Article 30**: Records of processing, right-to-erasure endpoint, PII stripping middleware
- [x] **Capability Router**: 1 new route (137 → 138)

### v6.0.0 — Fully Autonomous Loops ✅ (2026-02-22)
- [x] **Zero-Human Sprint** (`autonomousSprint.service.js`): PLAN → GUARDIAN → BRANCH → EXECUTE×N → REVIEW → DEPLOY, cost budget, SSE event bus
- [x] **Multi-Repo Orchestration** (`multiRepoOrchestration.service.js`): parallel repo scanning, LLM relevance detection, cross-repo atomic execution with rollback
- [x] **Vision-to-UI** (`vision_to_ui.agent.js`): Gemini Vision → layout/color/component analysis → React/SwiftUI/Compose code + WCAG 2.1 AA audit
- [x] **Self-Expanding Swarm** (`self_expanding_swarm.service.js`): gap detection → domain classification → LLM agent synthesis → guardian vetting → hot-load via dynamic import
- [x] **REST APIs**: `POST /sprint/launch`, `GET /sprint/events` (SSE), `POST /multi-repo/run`, `GET /multi-repo/swarm-report`
- [x] **Frontend**: `/autonomous` page (overview, sprint launcher with SSE stream, all-systems console)
- [x] **Capability Router**: 140 total routes

### v6.1.0 — Real-Time Collaboration ✅ (2026-02-22)
- [x] **CollaborationService** (`collaboration.service.js`): Socket.IO rooms, session presence, Monaco cursor sharing (10s TTL), shared context buffer, agent token streaming
- [x] **QA Service v2** (`qa.service.js`): multi-file suite gen, API integration tests, vitest subprocess runner, coverage threshold enforcement
- [x] **QA REST API** (`qa.controller.js`): 5 endpoints (spec, suite, api-tests, run, coverage)
- [x] **Studio Page v6.1.0**: QA Suite + Collab tabs added to Engineering Deck
- [x] **Composer wired**: CAPABILITY_TABLE entry (scaffold feature, compose code, etc.)

### v6.2.0 — Closed-Loop Autonomous Validation ✅ (2026-02-22)
- [x] **Sandbox smoke-test**: after each EXECUTE step, run generated code in Node `vm` — catch runtime errors before commit
- [x] **Auto-test**: after all execute steps, `qaService.generateSpec()` + `runTests()` on all written files
- [x] **Self-heal loop**: test failure → `surferAgent.surfWeb()` (live web lookup) → LLM patch → re-run (≤3 retries per file)
- [x] **Test-gated deploy**: DEPLOY blocked if any file has unresolved test failures
- [x] **Auto-doc**: `docGenService` regenerates relevant docs after successful deploy
- [x] **Sprint memory**: full outcome (status, cost, test results, heal log, review score) persisted to vector store for cross-sprint learning
- [x] **6 new SSE events**: `sprint:sandbox`, `sprint:auto_test`, `sprint:heal`, `sprint:tests`, `sprint:doc_updated`, `sprint:deploy_failed`

### v6.3.0 — Autonomous Goal Synthesis & Sprint Scheduler ✅ (2026-02-22)
- [x] **CodebaseObserver**: walks repo tree scanning for `TODO/FIXME/HACK/UNSAFE/@deprecated` signals + vector memory failure signals
- [x] **GoalSynthesizer**: Gemini converts raw signals → ranked, deduplicated sprint goals (respects past sprint outcome memory to avoid re-doing completed work)
- [x] **SprintSchedulerService**: cron-based cycle (configurable interval, default 1h) + event-triggered `triggerNow()`
- [x] **Priority backlog**: deduped goal queue (cap 10), sorted by severity (critical→low), pops one goal per cycle
- [x] **Test-gated sprint launch**: delegates to `AutonomousSprintService.launchSprint()` with autoDoc=true
- [x] **Governance digest**: daily `reports/scheduler_digest_YYYY-MM-DD.md` written after every cycle
- [x] **REST API** (`/api/v1/scheduler`): start, stop, trigger, status, backlog CRUD, history, SSE events stream
- [x] **Manual override**: `POST /scheduler/backlog/add` injects human-specified goals into the autonomous queue

### v6.4.0 — Runtime Observability & Autonomous Incident Response ✅ (2026-02-22)
- [x] **TelemetryCollector**: Express middleware + ring buffer (2000 events, 60s window); tracks HTTP latency/errors, LLM call latency/failures, novel exceptions; `recordLlmCall()` + `recordException()` manual APIs
- [x] **AnomalyDetector**: sliding-window checks — HTTP error rate >5%, P95 latency >3s, LLM error rate >20%, novel exception class; 5-min per-type suppression to prevent alert storms
- [x] **IncidentResponder**: anomaly → `surferAgent.surfWeb()` (live error lookup) → Gemini fix goal synthesis → `guardianAgent` approval gate → `sprintSchedulerService.addGoalToBacklog(priority=1)` → vector store persistence
- [x] **Continuous detection loop**: `startDetection(intervalMs=10s)` — runs every 10 seconds, auto-responds to all anomalies
- [x] **REST API** (`/api/v1/telemetry`): metrics, incidents, manual recording, detect trigger, detection control, SSE live stream
- [x] **SSE events**: `telemetry:event`, `anomaly:detected`, `incident:resolved`, `incident:vetoed`, `incident:injected`

### v6.5.0 — Adaptive Agent Performance Profiling & Self-Optimization ✅ (2026-02-22)
- [x] **AgentProfiler**: per-agent metrics (success rate, avg latency, test-pass rate, composite 0-100 score); in-memory Map + 5-min vector-store flush
- [x] **Composite score formula**: `successRate×40 + testPassRate×30 + latencyScore×30`
- [x] **SurgeProtection**: circuit breaker — 3 consecutive failures → 15-min demotion; auto-reset on expiry
- [x] **RouteOptimizer**: patches `capabilityRouter.dispatch()` — `agentProfiler.selectBest()` applies profile weighting; 10% exploration budget for under-sampled agents; surged agents skipped
- [x] **Outcome recording**: every `dispatch()` call records success/fail, latency, optional `testPassed` + `costUsd` into profiler
- [x] **Self-Tuner**: agent score <40 after ≥5 samples → `selfExpandingSwarmService.synthesizeAgent()` → replacement file written → `autonomicService.commenceProactiveSweep()` quality check
- [x] **REST API** (`/api/v1/agents`): all profiles, single profile, leaderboard, surge view, manual record, flush, surge clear, SSE events stream
- [x] **5 SSE events**: `profiler:recorded`, `profiler:surge`, `profiler:self_tune:started`, `profiler:self_tune:done`, `profiler:self_tune:failed`

### v6.6.0 — Mission Control Dashboard & Autonomous Knowledge Base ✅ (2026-02-22)
- [x] **Mission Control page** (`/mission-control`): unified live dashboard subscribing to all 5 SSE buses simultaneously (sprint, telemetry, scheduler, agent profiler, wiki)
- [x] **Sprint Monitor**: live phase display, step progress bar, heal counter, cost tracker, test gate indicator
- [x] **Health Monitor**: live HTTP error rate, P95 latency, LLM error rate, active incidents panel
- [x] **Scheduler panel**: live backlog with priority badges, goal inject input, manual trigger button
- [x] **Agent Leaderboard**: live score bars, surge indicator with one-click surge-clear button
- [x] **Knowledge Base panel**: lists auto-generated sprint articles chronologically
- [x] **Human Controls**: Inject Goal, Trigger Cycle, Run Detection, Clear Surge — all fire REST commands
- [x] **`wikiService.createSprintArticle()`**: Gemini-authored knowledge article per sprint (goal, steps, test results, heals, review score, lessons) → `docs/sprint-articles/sprint-<id>.md`
- [x] **`wikiService.listArticles()`**: frontmatter-parsed article index served via `GET /api/v1/wiki/articles`
- [x] **Auto-hook**: `sprintBus.on('sprint:completed')` → auto-creates article + indexes to vector store (GoalSynthesizer dedup)
- [x] **`GET /api/v1/wiki/articles`** and **`GET /api/v1/wiki/adrs`** inline REST endpoints
- [x] **Sidebar nav**: Mission Control (🔭 violet) added under Autonomous v6 section

### v6.7.0 — Live Code Browser, Inline LLM Editor & Secure Terminal ✅ (2026-02-22)
- [x] **`/studio/files` page**: 3-pane layout — file browser | Monaco Editor | secured terminal
- [x] **Sprint File Browser**: `GET /code-browser/sprint/:id/files` — lists all files written during a sprint with CREATED/MODIFIED/HEALED/FAILED badges
- [x] **Monaco Editor integration**: view/edit any sprint-written file, language auto-detected from extension
- [x] **Git Diff view**: `GET /code-browser/diff?path=` — toggle between code and unified git diff
- [x] **AI Suggest bar**: `POST /code-browser/suggest {code, instruction}` → Gemini inline suggestion → apply overlay replaces Monaco content
- [x] **Guardian-gated Patch Submit**: `POST /code-browser/patch` → static scan + AI audit → backup → write → autonomic AST sweep → git commit
- [x] **Secure Terminal**: `POST /code-browser/exec` — command allowlist (npm test, npm run lint, git status, npx vitest, ls, pwd, cat package.json); 30s timeout; 512KB output cap
- [x] **`CodeBrowserService`**: safe path resolution (traversal prevention), sprint file registry (populated by sprint events), `readFile`, `getDiff`, `applyPatch` with full audit chain
- [x] **REST API** (`/api/v1/code-browser`): 6 endpoints — sprint files, file read, diff, patch, suggest, exec
- [x] **Sidebar nav**: Code Browser (💻 teal) added under Autonomous v6 section

### v6.8.0 — The Final Odyssey (Phases 22, 23, 24) ✅ (2026-02-22)
- [x] **Autonomous SRE & Production Healing** (`sre.agent.js`): Phase 22 remote Axiom cloud telemetry ingestion, Sev-1 root-cause triage + live Priority 0 hotfix sprint injection (`sprintSchedulerService`).
- [x] **Sub-Second Vercel Auto-Rollback**: Integrated REST API `rollbackVercelDeployment(projectId)` into DevOps Agent to re-alias deployments on Sev-1 detected spikes immediately.
- [x] **The Visual Cortex (Figma-to-Code)** (`designer.agent.js`): Phase 23 Figma REST API hook + recursive component hierarchy extraction into Tailwind/React boilerplate via Gemini. Active hook inside `genesis.service.js` ignition loop.
- [x] **Enterprise Knowledge Graph (The Corporate Brain)** (`knowledge.agent.js`): Phase 24 Jira sprint constraint ingestion (`extractTicketContext(ticketId)`), Jira auto-transitions to DONE, and Slack broadcast notification closures (`broadcastToSlack(channelId)`).

## 📅 Release Schedule

| Version | Target | Theme | Status |
|---------|--------|-------|---------|
| v4.0.0 | Feb 2026 | Industry Armada (16 verticals, 119 routes) | ✅ Done |
| v4.1.0 | Feb 2026 | DevSecOps (5) + Supply Chain (4) = 9 agents | ✅ Done |
| v4.2.0 | Feb 2026 | AgriTech (3) + Energy (3) + Auto (1) = 7 agents | ✅ Done |
| v4.3.0 | Feb 2026 | Promptfoo quality scoring agent | ✅ Done |
| v5.0.0 | Feb 2026 | Enterprise Governance (OPA, SOC2, SSO, GDPR) | ✅ Done |
| v6.0.0 | 2027 | Zero-Human Sprint | Vision |
