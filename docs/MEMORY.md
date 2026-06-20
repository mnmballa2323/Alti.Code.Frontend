# Alti.Code.Studio Memory

> *Persistent context and architectural notes for AI Agents.*

## 🏗️ Architectural Patterns
-   **Backend**: Uses a module-based architecture (`src/app/modules/`). Each module contains its own Controller, Service, Route, Model, and Interface.
-   **Frontend**: Next.js 15 App Router. State management via Redux Toolkit (`store/`). UI components are largely custom or wrapped Shadcn/HeroUI.
-   **YAML DSL Agents**: New specialist agents can be defined as `.agent.yaml` files in `src/app/modules/agents/definitions/`. The `yaml_agent_loader.js` dynamically creates `BaseSpecialistAgent` subclasses and supports hot-reload via `fs.watch` — no server restart required.
-   **Marketplace Registry**: Installed agents are tracked in `src/app/modules/agents/plugins/registry.json` (primary) and `MarketplacePlugin` Mongoose collection (secondary). If Mongo is unavailable, the file-based registry is used as fallback.
-   **Collaborative Developer Swarm**: A stateful 6-agent multi-agent pipeline (`SwarmEngine` inside `custom_swarm_orchestrator.js`) executing autonomous software developer sprints: `SwarmArchitect` -> `SwarmHermesDebate` (adversarial debate chamber using `hermes_debate_chamber.service.js`) -> `SwarmTddCoder` -> `SwarmQaTester` -> `SwarmSecurityAuditor` -> `SwarmDevOpsEngineer`.
-   **Knowledge Catalog & OKF Integration**: Integrates Google Cloud Dataplex (Knowledge Catalog) with Open Knowledge Format (OKF) parsing and synchronization (`src/app/modules/knowledgeCatalog/`). It validates Markdown metadata concepts, executes pushes/pulls to Dataplex, runs autonomous enrichment, and grounds conversational query results with precise citations. Additionally, it integrates bidirectionally with the Developer Swarm (`SwarmArchitect` queries catalog to reuse schemas/APIs, `SwarmDevOps` registers sprint outputs as OKF files) and powers active RAG pipelines (checking commit diffs against playbooks during code reviews, embedding incident playbooks in runbooks, and self-healing catalogs upon commit merges).

## ⚠️ Known Issues / Technical Debt
-   **Version Sync**: Frontend version display is hard-coded in `sidebar.tsx` `v3.1.0`. Needs a build-time script or `/api/version` API call to auto-sync.
-   **WS Error Handling**: Frontend WebSocket error messages are still generic (TODO.md item — deferred to v3.2.0).
-   **Submodule CI**: `git submodule update --init --recursive` is not yet wired into the CI pipeline (TODO.md item).

## 🔍 Submodule References
-   `alti.code.studio.backend`: The core API and agent logic. Currently at `src/app/modules/` with 133+ modules.
-   `alti.code.studio.frontend`: The user interface. Next.js 15, 22 app routes, 111 components.

