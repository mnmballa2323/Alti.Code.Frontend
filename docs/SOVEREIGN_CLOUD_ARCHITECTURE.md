# Sovereign Cloud Architecture 

## Overview

The **Alti Code Studio Sovereign Cloud Architecture** is a deeply integrated, highly sterile local environment that physicalizes massive amounts of cloud-native infrastructure code. By autonomously tracking, cloning, and auditing thousands of repositories from leading hyperscalers and edge providers, it equips the Swarm Brain with localized, zero-latency context.

As of the latest ingestion phase, the environment locally hosts **5,609 fully hardened, audited repositories** representing the infrastructure blueprints of **44 distinct cloud organizations**.

The entire architecture is fortified by enterprise-grade **Zero-Trust constraints**, sub-millisecond **Redis Data Caching**, and **Vectorized Semantic Caching** to achieve unprecedented execution speed, absolute security, and zero token-waste.

---

## The Zero-Trust Sovereign Citadel

The orchestration layer is driven by the **Omni-Cloud Sovereign Operator**, a master Kubernetes Helm matrix (`omni_sovereign_operator.sh`).

### 1. Zero-Trust Network Policies
The network enforces strict ingress/egress boundaries. Outbound egress to internal cloud metadata IP `169.254.169.254/32` is mathematically prohibited, utterly eliminating SSRF vectors and preventing agents from scraping native AWS/GCP credentials.

### 2. GVisor & FIPS 140-2 Isolation
All agent execution pods (both the backend Swarm and the Next.js `standalone` frontend) operate exclusively as non-root `10001` users, dropping `["ALL"]` privileges. They execute atop Google's **gVisor** container runtime, physically preventing host-kernel intrusion even if the agent is breached.

---

## High-Performance Memory & Data Layers

### 1. Vectorized Semantic Caching (pgvector)
LLM interactions and execution intents are routed through `semantic_cache.service.js`. Every prompt is dynamically vectorized via Google Cloud Vertex AI into a 768-dimensional embedding.
If an identical logic block (≥98% cosine similarity) is found within the raw PostgreSQL `pgvector` database, the Swarm bypasses the LLM execution entirely, resolving complex instructions instantly at 0 cost.

### 2. Sub-Millisecond Prisma Redis Cache
The backend utilizes an advanced Prisma Client Extension that universally intercepts *all* database read operations (`findUnique`, `findMany`). Read requests are cryptographically hashed and retrieved from Google Cloud Memorystore (Redis) in under 1ms. If there is a cache miss, the Heavy PostgreSQL query executes and asynchronously writes the result into Redis with a 60s TTL.

---

## Live Hive-Mind Telemetry (DAG Visualization)
The entire agentic ecosystem streams raw cognitive data over WebSockets directly to the Next.js frontend (`/hive-mind`).
Using `@xyflow/react` and a glassmorphic dark-mode UI, the Swarm Brain's decision trees, active agent routing, and real-time execution node status (e.g., REMEDIATING, COMPLETED) are physically mapped as a stunning 2D Directed Acyclic Graph (DAG) for total visibility.

---

## Supported Cloud Organizations (44)
The Omni-Cloud Engine aggressively syncs repositories across the entire spectrum of cloud infrastructure:
*   **Hyperscalers:** AWS, GCP, Azure, Oracle, IBM Cloud
*   **AI & GPU Compute:** CoreWeave, Lambda Labs, Paperspace, RunPod, Together AI
*   **Developer & PaaS:** DigitalOcean, Fly.io, Heroku, Railway, Render, Supabase, Vercel, Kinsta
*   **Global & Regional:** Alibaba Cloud, Baidu AI Cloud, Huawei Cloud, OVHcloud, Scaleway, Tencent Cloud, Yandex Cloud, Exoscale
*   **Bare Metal & Edge:** Cherry Servers, Equinix Metal, Fastly, Lumen, MacStadium, Rackspace, Cloudflare
*   **Enterprise Clouds:** Databricks, RedHat, Salesforce, SAP, Snowflake, Nutanix, Cloudera, Aiven
*   **VPS Infrastructure:** Linode, Vultr, Hetzner, UpCloud, Liquid Web, IONOS

---

## Hard Law Doctrine & Compliance
The cornerstone of the Sovereign Cloud environment is the **Hard Law Guardian**. We adhere to absolute, inviolable licensing restrictions:

**PERMITTED:** Pure MIT License | Pure Apache 2.0 License
**STRICTLY PROHIBITED:** Mixed Licenses, GPL, BSD, MPL, EPL, CDDL, Proprietary.

### The Guardian Daemon (`hard_law_scrubber.cjs`)
A continuous daemon runs in the background analyzing the physical footprint of every repository. If a prohibited license is detected, the Guardian instantly and permanently scrubs the violating directory from the file system.

---

## Cicero Law Enforcement Matrix (Phase 40.0.1)
The **Cicero Law Enforcement Matrix** provides fully automated compliance and SLA enforcement for sovereign smart contracts. Telemetry metrics (uptime, latency, request rates) are evaluated deterministically against SLA conditions. On breach detection, the specialized `CiceroLawEnforcementAgent` drafts an AM Law 100 compliant legal notice, which is routed and dispatched via the `AzureLegalNoticeService`.

---

## Pre-Bundled Gemini CLI Extensions Engine (Phase 9)
To deliver a fully sterile, offline-ready developer execution engine, Alti Code Studio integrates the complete public catalog of Gemini CLI extensions:
*   **Sovereign Compliance**: All **65 public repositories** from the `gemini-cli-extensions` organization that are licensed under the Apache-2.0 standard are pre-packaged as local git submodules inside `submodules/`.
*   **Docker Container Sandbox**: The backend builder copies the entire `/submodules` folder into the runner image (configured via parent context redirection in `docker-compose.yml` and COPY targets in the `Dockerfile`), providing complete runtime isolation.
*   **Startup Auto-Preloader & Caching**: The backend dynamically scans the submodules folder on startup. It runs concurrent installations (batches of 5) and creates a `.preloaded_cache.json` ledger file to bypass redundant startup shell checks on subsequent boots (0ms startup overhead).

---

## Elite Shard Specialists
Within the Swarm Brain, heavily restricted **Elite Agents** handle sovereign orchestration:
- `zero_trust_architect`: Specializes in BeyondCorp mTLS and Envoy proxy networks.
- `spanner_distributed_sql`: Designs global, strictly consistent Google Cloud Spanner schemas.
- `kubernetes_operator_builder`: Autonomously generates CRDs and Helm infrastructure code.
