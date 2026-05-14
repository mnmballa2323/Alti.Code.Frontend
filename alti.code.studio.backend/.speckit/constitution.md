# Alti.Code.Studio - Sovereign Constitution

This document defines the **inviolable laws** and **architectural principles** for the Alti.Code.Studio Sovereign Execution Engine. All AI coding agents (Spec Kit, GitHub Copilot, Gemini CLI, Claude Code) MUST strictly adhere to these directives when executing tasks, generating plans, or writing code in this repository.

## 1. "Hard Law" License Compliance
- **Absolute Purity**: All ingested, generated, or integrated code MUST be strictly **MIT** or **Apache 2.0** licensed. 
- **Zero-Mixture**: No GPL, no ISC, no proprietary licenses. If a dependency is not strictly MIT or Apache 2.0, it is **banned**.
- **Cryptographic Sealing**: All external code modules must be treated as untrusted until scrubbed by the Sovereign Guardian daemon.

## 2. Sovereign Security & Zero-Trust Architecture
- **Never Trust Input**: All external API inputs, agent communications, and user prompts must be sanitized.
- **Ephemeral DLP**: All generated tools must respect Data Loss Prevention (DLP) engines. Personal Identifiable Information (PII) and Protected Health Information (PHI) must be scrubbed before touching LLM inputs.
- **BYOK Layer**: Database storage (Postgres/Redis) for enterprise data must respect Bring Your Own Key (BYOK) Application-Layer Encryption.
- **Dependencies**: Establish the Sovereign Bootloader architecture—dynamic injection into volatile memory. Zero permanent infrastructure bloat.

## 3. Distributed Swarm Intelligence (The Armada)
- **Modularity over Monoliths**: New capabilities MUST be integrated as specialized AI agents in `src/app/modules/agents/`, not hardcoded into core orchestration files.
- **Semantic Routing**: All new agents must be registered with proper metadata (capability keywords) in `capability.router.js` for dynamic DAG traversal.
- **Fail-Safe Execution**: 
  - **Timeouts**: 30-second timeout guard per LLM call.
  - **Backoff**: Retry with exponential backoff (800ms → 3.2s) on rate limits.
  - **Circuit Breaking**: Open after 5 continuous failures, auto-reset after 60 seconds.

## 4. Omni-Cloud Infrastructure (44 Providers)
- **Agnostic & Resilient**: Hardcoded cloud assumptions are prohibited. Code must be agnostic or utilize the `Omni-Cloud Smart Router` for autonomous multi-cloud workload orchestration.
- **Container-Native**: All backend services must remain fully Dockerized with non-root, multi-stage builds.

## 5. Coding Standards & Code Quality
- **Technology Stack**: Node.js (ESM Modules `import/export`), Express, PostgreSQL (with pgvector), Redis, Next.js (Frontend), Vertex AI / Gemini 3.1 Pro (Inference).
- **ESM Strictness**: All `.js` files must use ES6 module imports. Add `.js` extensions to local imports (e.g., `import { foo } from './foo.js'`).
- **Error Handling**: No silent swallowing of errors. Use the central OpenTelemetry-enabled `logger` (`import { logger } from '../../../shared/logger.js'`) for all warnings and exceptions.
- **Asynchronous Flow**: No blocking synchronous calls in the main event loop.

## 6. Spec-Driven Workflow Rules (Spec Kit)
- **Do NOT guess implementation details.** Rely entirely on the output of `/speckit.plan`.
- **Do NOT proceed to implementation** until the `/speckit.tasks` checklist is explicitly approved by the User.
- **Do NOT introduce untested dependencies** without adding them to the Plan first.