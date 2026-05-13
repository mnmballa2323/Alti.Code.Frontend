# Sovereign Cloud Architecture 

## Overview

The **Alti Code Studio Sovereign Cloud Architecture** is a deeply integrated, highly sterile local environment that physicalizes massive amounts of cloud-native infrastructure code. By autonomously tracking, cloning, and auditing thousands of repositories from leading hyperscalers and edge providers, it equips the Swarm Brain with localized, zero-latency context.

As of the latest ingestion phase, the environment locally hosts **5,609 fully hardened, audited repositories** representing the infrastructure blueprints of **44 distinct cloud organizations**.

## Supported Cloud Organizations (44)

The Omni-Cloud Engine aggressively syncs repositories across the entire spectrum of cloud infrastructure:

*   **Hyperscalers:** AWS (`aws`), GCP (`GoogleCloudPlatform`), Azure (`azure`), Oracle (`oracle`), IBM Cloud (`IBM-Cloud`)
*   **AI & GPU Compute:** CoreWeave (`coreweave`), Lambda Labs (`lambdal`), Paperspace (`paperspace`), RunPod (`runpod`), Together AI (`togethercomputer`)
*   **Developer & PaaS:** DigitalOcean, Fly.io, Heroku, Railway, Render, Supabase, Vercel, Kinsta
*   **Global & Regional:** Alibaba Cloud, Baidu AI Cloud, Huawei Cloud, OVHcloud, Scaleway, Tencent Cloud, Yandex Cloud, Exoscale
*   **Bare Metal & Edge:** Cherry Servers, Equinix Metal (`packethost`), Fastly, Lumen, MacStadium, Rackspace, Cloudflare
*   **Enterprise Clouds:** Databricks, RedHat, Salesforce, SAP, Snowflake, Nutanix, Cloudera, Aiven
*   **VPS Infrastructure:** Linode, Vultr, Hetzner, UpCloud, Liquid Web, IONOS

## Hard Law Doctrine

The cornerstone of the Sovereign Cloud environment is the **Hard Law Guardian**. To protect the enterprise integrity of the workspace, we adhere to absolute, inviolable licensing restrictions:

**PERMITTED:**
1. Pure MIT License
2. Pure Apache 2.0 License

**STRICTLY PROHIBITED:**
- Mixed Licenses (e.g., a repository containing both MIT and Apache 2.0 components)
- GPL (GNU General Public License)
- BSD Licenses
- MPL (Mozilla Public License)
- EPL (Eclipse Public License)
- CDDL
- Creative Commons
- Proprietary / All Rights Reserved
- Unlicense / BSL / SSPL

### The Guardian Daemon (`hard_law_scrubber.cjs`)
A continuous daemon runs in the background analyzing the physical footprint of every repository. If a prohibited license is detected within the codebase—or if multiple permitted licenses are found in the same repository (mixture)—the Guardian bypasses standard OS APIs to instantly and permanently scrub the violating directory from the file system.

## The Ingestion Pipeline

### 1. Omni-Cloud Installer (`install_omni_cloud.js`)
An automated web crawler that targets the 44 organization endpoints on the GitHub API. It utilizes shallow cloning (`--depth 1`) to preserve disk space and bypasses rate limits by running on a scheduled Cron offset.

### 2. Omni-Cloud Orchestrator (`omni_cloud_orchestrator.js`)
The grand conductor. It infinitely loops in the background to sequence the system's defenses and cognitive integrations:
- **Phase 1:** Triggers the Hard Law Scrubber to purge any unapproved clones.
- **Phase 2:** Executes the `Graphify` python AST-extraction binary on all remaining, 100% compliant repositories.
- **Phase 3:** Directly embeds the structured Abstract Syntax Trees into the Neo4j Knowledge Graph.

## Neo4j Swarm Brain Integration

Once a repository passes the Hard Law constraints, its entire architecture is mapped and embedded into Neo4j via Graphify. This gives the Elite Agents (like `kubernetes_operator_builder` and `spanner_distributed_sql`) real-time, vector-searchable access to the pure codebase of platforms like Vercel and AWS, enabling them to route and deploy Sovereign Code Studio artifacts natively into the cloud.
