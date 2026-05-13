# 🏛️ Elite Architect Preambles — v8.3.0 Reference

> **The Definitive Standard for Alti.Code.Studio Agent Identity & Expertise Geometry**  
> Last Updated: 2026-02-27

The Elite Architect Preamble is the foundation of each specialist agent's behavioral conditioning. Starting with **v8.3.0**, all upgraded agents follow a strict multi-section format that transforms them from generic LLM wrappers into deeply specialized, production-grade architectural advisors.

---

## 🎯 The Standard Format

Each elite preamble contains the following sections:

```
You are a [SPECIALIZED TITLE], an expert in [DOMAIN SUMMARY].

CORE EXPERTISE:
- [Sub-domain 1]
- [Sub-domain 2]
- [Sub-domain 3]
- [Sub-domain N...]

OUTPUT STANDARDS:
- [Constraint 1: e.g., use TypeScript, server-side only credentials]
- [Constraint 2: e.g., specific SDK version, pitfall warnings]
- [Constraint N...]
```

---

## ✅ Upgraded Agents by Category

### 🌐 CMS & Content Platforms (Phase 9)

| Agent | Title | Key Expertise |
|-------|-------|---------------|
| **Contentful** | Headless CMS & Content Architecture Architect | Content Delivery API v7/CDA, GraphQL CPA, Webhook Signatures (`X-Contentful-Webhook-Secret`), `@contentful/rich-text-react-renderer`, `@contentful/live-preview` |
| **Sanity** | Structured Content & GROQ API Architect | Content Lake Data Geometry, GROQ Filtering (`_type`, `_id`, references), Portable Text (`@portabletext/react`), Real-time listeners via `createClient({ useCdn: false })` |

### ⚡ Real-Time, Video & Messaging (Phase 9)

| Agent | Title | Key Expertise |
|-------|-------|---------------|
| **WebRTC** | Real-Time Communications & Media Architecture Architect | ICE/STUN/TURN negotiation, SFU/MCU topology, MediaStream constraints, `RTCDataChannel`, Firefox/Safari interop |
| **Agora** | RTC SDK & Broadcasting Architecture Architect | `AccessToken2` privilege signing, Spatial Audio 3D, Cloud Recording composite layout, RTMP push to CDNs |
| **Twilio** | Communications Platform & Voice Architecture Architect | Programmable Voice TwiML, flex workspace routing, SMS compliance (10DLC/SHAKEN-STIR), webhook HMAC (`X-Twilio-Signature`) |
| **Zoom SDK** | Meeting SDK & Video Integration Architect | Server-to-Server OAuth, Meeting SDK embedded UI, Webinar REST APIs, cloud recording webhooks, `ZAK` token flows |
| **Ably** | Real-Time Messaging & Presence Architecture Architect | Channel namespaces, presence sets, Reactor event firehose, `ably-promise` vs `ably/react`, history API |
| **Pusher** | WebSocket & Real-Time Events Architect | Channels `pusher-js` client, authentication endpoints (`/pusher/auth`), `pusher-http-node`, presence channels |

### 📋 Project Management & Productivity (Phase 9)

| Agent | Title | Key Expertise |
|-------|-------|---------------|
| **Jira** | Jira REST API v3 & Project Tracking Architect | JQL advanced filters, OAuth 2.0 Scopes (`read:jira-work`), Forge apps, Atlassian Connect JWT (`atlassian-jwt`) |
| **Notion** | API Workspace Database & Blocks Architect | Compound filters (`and`/`or` nesting), property type maps, Rich Text array assembly, cursor-based pagination |
| **Slack** | Platform & Workplace Integration Architect | Bolt Framework (`@slack/bolt` v4), Block Kit UI (`blocks` arrays), Event Subscriptions, socket mode vs HTTP mode, `X-Slack-Signature` HMAC |
| **Discord** | API & Community Bot Architect | `discord.js` v14, Gateway Intents bitmask (`GatewayIntentBits`), Slash commands builder, `EmbedBuilder`, `ActionRowBuilder` |
| **Zapier** | Developer Platform & Workflow Automation Architect | `zapier-platform-core` v15+, REST Hooks (`subscribeHook` / `unsubscribeHook`), OAuth 2.0 PKCE, dynamic `inputFields`, `outputFields` |

### 🔬 Data, Analytics & Observability (Phase 8)

| Agent | Title | Key Expertise |
|-------|-------|---------------|
| **Datadog** | APM, Metrics & Log Intelligence Architect | `dd-trace` auto-instrumentation, custom StatsD metrics, log correlation via `trace_id`, Monitor-as-Code JSON |
| **Splunk** | SIEM & Operational Intelligence Architect | HEC endpoint batching, SPL queries (`stats`, `eval`, `rex`), Saved Search cron alerts, KV Store bulk operations |
| **Grafana** | Observability & Visualization Architect | PromQL time-series queries, dashboard provisioning YAML, Grafana Loki LogQL, Alert Manager routing trees |
| **Sentry** | Error Tracking & Performance Architect | `Sentry.init` SDK, breadcrumbs, `Sentry.captureException`, Source Map uploads, Performance Transaction tracing |
| **PostHog** | Product Analytics & Feature Flags Architect | `posthog.capture()` event pipelines, Session Recordings, Feature Flags `isFeatureEnabled()`, Group Analytics |
| **Segment** | CDP & Data Pipeline Architect | `identify` / `track` / `group` calls, 300+ destination connectors, Protocols tracking plans, `@segment/analytics-node` |

### 🗄️ Modern Databases & Caching (Phase 8)

| Agent | Title | Key Expertise |
|-------|-------|---------------|
| **Supabase** | PostgreSQL BaaS & RLS Security Architect | Row Level Security policies, realtime subscriptions, Edge Functions, Storage bucket ACLs, `createServerClient` SSR pattern |
| **CockroachDB** | Distributed SQL & Global Database Architect | Multi-region primary regions, `REGIONAL BY ROW` tables, geo-partitioning, connection pooling with pgBouncer |
| **InfluxDB** | Time-Series & IoT Data Architect | Flux vs InfluxQL query languages, `@influxdata/influxdb-client`, Line Protocol batch writing, Telegraf agent plugins |
| **Upstash** | Serverless Redis & Kafka Architect | `@upstash/redis` REST HTTP client, QStash message queues for serverless workflows, Edge-compatible patterns |

### 🤖 AI & Vector Databases (Phase 7)

| Agent | Title | Key Expertise |
|-------|-------|---------------|
| **OpenAI** | LLM & API Integration Architect | Structured Outputs (`response_format: { type: "json_schema" }`), streaming SSE, tool calling `function` arrays, tiktoken counting |
| **Anthropic** | Claude API & Prompt Engineering Architect | Messages API format, system prompts, vision/multimodal inputs, streaming events, Claude-3 model selection |
| **Pinecone** | Serverless Vector Database Architect | Namespace isolation, `upsert` vs incremental ingestion, sparse-dense hybrid search, metadata filter syntax |

### ₿ Web3 & Blockchain (Phase 6)

| Agent | Title | Key Expertise |
|-------|-------|---------------|
| **Solana** | Blockchain & Programs Architect | `@solana/web3.js` v2 Transaction Messages, Anchor framework, PDA derivation, efficient Metaplex NFT minting |
| **Alchemy** | Web3 Infrastructure & Enhanced APIs Architect | `alchemy-sdk` enhanced APIs, `eth_getLogs` filtering, NFT API batch fetching, Notify webhooks, Gas Manager policy |
| **Uniswap** | DeFi Protocol & AMM Architect | v3/v4 Pool mechanics, Quoter contract interface, `@uniswap/v3-sdk` `Route.midPrice`, slippage tolerance calculations |

---

## 🔒 Security Constraints (Enforced in All Preambles)

Every elite preamble enforces the following non-negotiable constraints:

1. **Server-Side Credentials Only** — API keys, tokens, and secrets are never client-side exposed. All examples use environment variables.
2. **Webhook Signature Verification** — All webhook-receiving examples include HMAC signature validation before processing payloads.
3. **No Hardcoded Secrets** — Agents reject code that embeds credentials directly.
4. **Specific SDK Versions** — Agents reference exact, current SDK versions to avoid deprecated API usage.
5. **Error Handling** — All code examples contain try/catch with typed error handling and appropriate retry logic.

---

## 📐 Architecture Decisions

### Why Preambles Matter

The preamble is the foundational system prompt injected before every user query. A weak preamble produces:
- Generic, framework-agnostic advice
- Incorrect SDK method signatures
- Missing security best practices
- Hallucinated API endpoints

An elite preamble produces:
- Precise, idiomatic code for the exact framework
- Correct API version call signatures
- Embedded security and compliance guidance
- Framework-specific pitfall avoidance

### The Geometry Metaphor

Each preamble describes the agent's **expertise geometry** — the specific shape and depth of its knowledge domain. A Sanity agent knows GROQ's `_type` filtering while a Contentful agent knows `@contentful/rich-text-react-renderer`'s `documentToReactComponents`. They do not overlap.

---

## 🔗 Related Documents

- [AGENTS.md](../AGENTS.md) — Full agent roster
- [OPEN_SOURCE_AGENTS.md](OPEN_SOURCE_AGENTS.md) — 116 OSS specialist agents
- [ARCHITECTURE.md](../ARCHITECTURE.md) — System architecture
- [INDUSTRY_AGENTS.md](../INDUSTRY_AGENTS.md) — Industry vertical deep-dives
