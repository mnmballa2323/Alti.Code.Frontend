# GitHub API Integrations & Sovereign Cloud Deployment Guide

This document defines the architecture, endpoints, and deployment tiers for **Alti.Code.Studio** on the **Liberty Center One** private cloud, OpenStack environment, and public cloud providers (AWS, Azure, GCP).

---

## 🏗️ Part 1: Direct GitHub API & SDK Integration

The platform integrates directly with the official GitHub REST API and GraphQL engine utilizing the **Octokit SDK** with a custom, zero-dependency service layer. This enables high-performance, real-time repository auditing, automated security remediation, and collaborative workspace workflows.

### 1. Core Architecture
* **Service Module:** [github.service.js](file:///Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend/src/app/modules/github/github.service.js)
* **Controller Layer:** [github.controller.js](file:///Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend/src/app/modules/github/github.controller.js)
* **Routing Module:** [github.route.js](file:///Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend/src/app/modules/github/github.route.js)
* **Testing Suite:** [github.service.test.js](file:///Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend/src/app/modules/github/github.service.test.js)

### 2. Supported Feature Domains (17 Ingestion Phases)
The wrapper exposes **100+ endpoints** mapping to the following GitHub capabilities:
* **GraphQL Engine:** Direct raw GraphQL queries for Modern Projects v2 and Discussions interactions.
* **Repositories & Branches:** Full CRUD operations, branch creation, renaming, merging, and granular branch protection configurations.
* **Pull Requests & Code Reviews:** Review submissions, comments, file changes, bypass restrictions, and merge gates.
* **Issues & Milestones:** Labels management, assignees, milestones, and issue comments.
* **Actions CI/CD Engine:** Workflow listings, manual runs dispatch, self-hosted runners, and run artifact downloads.
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

Our infrastructure is configured to support three customer archetypes, ranging from cost-effective shared deployments to fully isolated private-cloud VMs and custom public-cloud environments.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Deployment Archetypes                          │
├───────────────────┬─────────────────────────────┬───────────────────────┤
│    Individuals    │            Teams            │      Enterprise       │
├───────────────────┼─────────────────────────────┼───────────────────────┤
│ Shared VM Cluster │ Single-Tenant VM (Isolated) │ Bring Your Own Cloud  │
│  Logical Tenant   │      Physical VPC & Cinder  │   Customer AWS/Azure/ │
│    Isolation      │         Encryption          │      GCP VPC          │
└───────────────────┴─────────────────────────────┴───────────────────────┘
```

### 1. Individuals (Shared Private Cloud)
* **Architecture:** Multi-user shared pool running on a single large Liberty Center One instance.
* **Logical Isolation:** Data segregation is enforced at the application boundary via the `tenantDbRouter` database connection pooling middleware. Individual developer accounts are logically isolated in separate databases/schemas.
* **Resource Profile:** Shared pool.

### 2. Teams (Single-Tenant Private Cloud)
* **Architecture:** One dedicated VM compute node per customer company, deployed in an isolated OpenStack VPC network with no external sharing.
* **Physical Isolation:** Booted from a dedicated, persistent Cinder block storage volume with Barbican HSM encryption metadata enabled.
* **One-Click Configuration (`terraform/variables.tf` Defaults):**
  * **Nova Compute Flavor:** `m1.2xlarge` (16 vCPUs, 32 GB RAM) — necessary to run all 15+ concurrent service containers comfortably.
  * **Cinder Volume Size:** `250 GB` NVMe storage.
  * **Image:** `Ubuntu 22.04 LTS`.

### 3. Enterprise (Bring Your Own Cloud - BYOC)
* **Architecture:** Deployed directly inside the customer's own cloud perimeter (AWS VPC, Azure VNet, or GCP VPC) using the repository's native Kubernetes Helm charts and multi-region Terraform modules.
* **Data Privacy:** Customer maintains absolute ownership of compute, data, and access keys.
* **Inference Routing:** The platform connects directly to customer-owned public cloud AI endpoints:
  * **AWS:** AWS Bedrock (Claude)
  * **Azure:** Azure OpenAI Foundry (GPT)
  * **GCP:** Google Cloud Vertex AI (Gemini)

---

## 🛠️ Part 3: Operational Scripts & Orchestration

The platform provides a suite of custom shell scripts to bootstrap, heal, and deploy the stack autonomously.

### 1. VPC Deployer (`deploy_openstack.sh`)
Automates the provisioning of isolated customer VPC networks, routers, firewalls, and boot volumes on the Liberty Center One OpenStack private cloud:
```bash
./deploy_openstack.sh --customer <customer-name> --subnet <private-cidr> --mode vm
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
* If the API fails to respond with a `200` status within 5 seconds, it automatically restarts the active backend container to restore service and logs the incident in `/var/log/alti_self_healing.log`.
