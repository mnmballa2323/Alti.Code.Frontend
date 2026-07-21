# GCP Sovereign Deployment & GitHub Integration Guide

This document defines the architecture, endpoints, and deployment tiers for **Inso.Code** exclusively on **Google Cloud Platform (GCP)**, supporting three core options: Commercial Cloud, Assured Workloads (Government) Cloud, and Classified & Air-Gapped Cloud.

---

## 🏗️ Part 1: Direct GitHub API & SDK Integration

The platform integrates directly with the official GitHub REST API and GraphQL engine utilizing the **Octokit SDK** with a custom, zero-dependency service layer. This enables high-performance, real-time repository auditing, automated security remediation, and collaborative workspace workflows.

### 1. Core Architecture
* **Service Module:** [github.service.js](file:///Users/michaelmeram/workspace/alti.code.studio/Inso.Code.Backend/src/app/modules/github/github.service.js)
* **Controller Layer:** [github.controller.js](file:///Users/michaelmeram/workspace/alti.code.studio/Inso.Code.Backend/src/app/modules/github/github.controller.js)
* **Routing Module:** [github.route.js](file:///Users/michaelmeram/workspace/alti.code.studio/Inso.Code.Backend/src/app/modules/github/github.route.js)
* **Testing Suite:** [github.service.test.js](file:///Users/michaelmeram/workspace/alti.code.studio/Inso.Code.Backend/src/app/modules/github/github.service.test.js)

### 2. Supported Feature Domains (17 Ingestion Phases)
The wrapper exposes **100+ endpoints** mapping to the following GitHub capabilities:
* **GraphQL Engine:** Direct raw GraphQL queries for Modern Projects v2 and Discussions interactions.
* **Repositories & Branches:** Full CRUD operations, branch creation, renaming, merging, and granular branch protection configurations.
* **Pull Requests & Code Reviews:** Review submissions, comments, file changes, bypass restrictions, and merge gates.
* **Issues & Milestones:** Labels management, assignees, milestones, and issue comments.
* **Actions CI/CD Engine:** Workflow listings, manual runs dispatch, self-hosted runners, and run artifacts download.
* **Sovereign Secret Management:** Repository, organization, and environment secrets/variables management (encrypted client-side using `tweetnacl`).
* **Codespaces Lifecycle:** Creating, stopping, starting, and deleting Codespaces, plus secrets management.
* **Sovereign Security & Scanning:** Code scanning alert auditing, Dependabot configuration, secret scanning status monitoring, and SARIF static analysis report uploads.
* **SCIM provisioning:** Multi-tenant SCIM provisioning for enterprise organization membership.
* **Fine-Grained Personal Access Tokens (PATs):** Organization-level PAT grant requests listing, approval, and revoking.
* **App Webhooks & Deliveries:** Retrieving/updating App webhook configurations and triggering webhooks redelivery.

### 3. Fail-Safe and Interception Layer
To prevent system crashes on invalid configurations or unconfigured scopes, the service intercepts `404 Not Found` response statuses on check APIs and returns safe default fallbacks:
* **Required Status Checks:** Returns `{ contexts: [], strict: false }` if not configured.
* **PR Review Bypass Restrictions:** Returns default empty arrays if no restrictions exist.
* **Starring/Subscription Status:** Intercepts 404 and returns `{ starred: false }` or `{ subscribed: false }`.
* **Follower Status:** Intercepts 404 and returns `{ following: false }`.

### 4. Testing & QA
The integration includes a robust, isolated Vitest test suite with **488 unit tests** verifying request parameters, correct API payload structures, and error fallbacks. Mocks are hosted under a global `vi.mock('octokit')` wrapper to ensure fully air-gapped test execution.

---

## 🚀 Part 2: Deployment Configuration Tiers

Our infrastructure is configured exclusively on Google Cloud Platform to support three deployment archetypes:

```
┌─────────────────────────────────────────────────────────────────────────┐
┌─────────────────────────────────────────────────────────────────────────┐
│                          Deployment Archetypes                          │
├───────────────────┬─────────────────────────────┬───────────────────────┤
│    Commercial     │         Government          │      Classified       │
├───────────────────┼─────────────────────────────┼───────────────────────┤
│    GCP Public     │  GCP Assured Workloads      │  GCP Secret / AirGap  │
│  Compute Engine   │  Isolated VPCs & IAM        │ Air-Gapped local VMs  │
│  Standard Tenant  │   FedRAMP High / IL5        │   DoD IL6 / Isolated  │
└───────────────────┴─────────────────────────────┴───────────────────────┘
```

### 1. GCP Commercial Cloud
* **Architecture:** Multi-user shared or single-tenant pools running on standard Google Compute Engine and Managed Instance Groups (MIGs).
* **Logical Isolation:** Data segregation is enforced at the application boundary via the `tenantDbRouter` database connection pooling middleware. Individual developer accounts are logically isolated in separate databases/schemas.
* **Resource Profile:** GCP E2/N2-series compute and Cloud SQL PostgreSQL databases.

### 2. GCP Assured Workloads (Government) Cloud
* **Architecture:** One dedicated VM compute node per customer company, deployed in an isolated Assured Workloads folder inside a Sovereign VPC with no external sharing.
* **Physical Isolation:** Booted from dedicated Google Persistent Disks with customer-managed encryption keys (CMEK) enabled via Cloud KMS.
* **Compliance:** Built to meet FedRAMP High and DoD IL5 requirements.

### 3. GCP Sovereign & Air-Gapped Cloud
* **Architecture:** Deployed directly inside fully disconnected, air-gapped environments (GCP Secret, Top Secret, or local hardware) utilizing the repository's native Kubernetes manifests and isolated Terraform modules.
* **Data Privacy:** Customer maintains absolute ownership of compute, data, and access keys.
* **Inference Routing:** The platform connects directly to GCP Vertex AI Sovereign endpoints or local air-gapped models (e.g. Ollama):
  * **GCP Vertex AI:** Private Service Connect connections to sovereign Vertex AI Gemini deployments.
  * **Air-Gapped Local Model:** Fallback to local Ollama running `codestral` and `llama3`.

---

## 🛠️ Part 3: Operational Scripts & Orchestration

The platform provides a suite of custom shell scripts to bootstrap, heal, and deploy the stack autonomously.

### 1. GCP Sovereign Deployer (`deploy_enterprise.sh`)
Automates the provisioning of GCP infrastructure (VPCs, GKE clusters, and endpoints) using Terraform:
```bash
./deploy_enterprise.sh --deployment-option commercial
./deploy_enterprise.sh --deployment-option government
./deploy_enterprise.sh --deployment-option classified
```

### 2. Blue-Green Orchestrator (`deploy_blue_green.sh`)
Enables zero-downtime, rolling blue-green updates for the backend Express services directly on the compute node:
1. Builds the target stack (e.g. `green` on port `3002`) in the background.
2. Polls `/api/v1/healthz` on the target port until healthy.
3. Automatically rewrites the Caddy proxy configuration (`active_backend.conf`) and reloads the Caddy ingress gateway.
4. Shuts down the old stack (`blue` on port `3000`).

### 3. Self-Healing Daemon (`alti_health_check.sh`)
A cron-scheduled monitoring daemon executing every 5 minutes:
* Performs local health check requests against `/api/v1/healthz`.
* Restarts target systemd services if endpoint fails multiple consecutive checks.
