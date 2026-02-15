# Alti.Code.Studio Memory

> *Persistent context and architectural notes for AI Agents.*

## 🏗️ Architectural Patterns
-   **Backend**: Uses a module-based architecture (`src/app/modules/`). Each module contains its own Controller, Service, Route, Model, and Interface.
-   **Frontend**: Next.js 15 App Router. State management via Redux Toolkit (`store/`). UI components are largely custom or wrapped Shadcn/HeroUI.

## ⚠️ Known Issues / Technical Debt
-   **Version Sync**: The frontend does not automatically display the version from `VERSION` file. Needs a build-time script or API endpoint.
-   **Submodule Paths**: Frontend and Backend are in `alti.code.studio.frontend` and `alti.code.studio.backend` (lowercase in filesystem, CamelCase in some docs). **Stick to filesystem casing.**

## 🔍 Submodule References
-   `alti.code.studio.backend`: The core API and agent logic.
-   `alti.code.studio.frontend`: The user interface.
