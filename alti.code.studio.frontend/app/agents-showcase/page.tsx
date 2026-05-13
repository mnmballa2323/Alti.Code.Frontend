"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";

// ──────────────────────────────────────────────────────────────────────────────
// Agent Data
// ──────────────────────────────────────────────────────────────────────────────

const LANGUAGE_AGENTS = [
  {
    name: "Python Expert",
    slug: "python",
    icon: "logos:python",
    description:
      "Data science, async FastAPI, type-safe Pydantic models, and ML pipelines.",
  },
  {
    name: "TypeScript Expert",
    slug: "typescript",
    icon: "logos:typescript-icon",
    description:
      "Strict-mode TS, generics, mapped types, conditional types, and Zod schemas.",
  },
  {
    name: "Rust Expert",
    slug: "rust",
    icon: "logos:rust",
    description:
      "Memory-safe systems code, lifetimes, async with Tokio, and crate design.",
  },
  {
    name: "Go Expert",
    slug: "golang",
    icon: "logos:go",
    description:
      "Idiomatic Go: goroutines, channels, context propagation, and standard library.",
  },
  {
    name: "Java Expert",
    slug: "java",
    icon: "logos:java",
    description:
      "Spring Boot, JVM tuning, generics, streams, and concurrent programming.",
  },
  {
    name: "C++ Expert",
    slug: "cpp",
    icon: "logos:c-plusplus",
    description:
      "Modern C++23, RAII, move semantics, templates, and STL algorithms.",
  },
  {
    name: "Kotlin Expert",
    slug: "kotlin",
    icon: "logos:kotlin-icon",
    description:
      "Android, coroutines, sealed classes, and multiplatform development.",
  },
  {
    name: "Swift Expert",
    slug: "swift",
    icon: "logos:swift",
    description:
      "SwiftUI, async/await, Combine, and Apple ecosystem best practices.",
  },
  {
    name: "Ruby Expert",
    slug: "ruby",
    icon: "logos:ruby",
    description:
      "Rails conventions, ActiveRecord, metaprogramming, and DSL design.",
  },
  {
    name: "PHP Expert",
    slug: "php",
    icon: "logos:php",
    description:
      "Laravel, Symfony, PSR standards, and modern PHP 8.x features.",
  },
  {
    name: "Solidity Expert",
    slug: "solidity",
    icon: "logos:solidity",
    description:
      "EVM smart contracts, gas optimisation, security auditing, and ERC standards.",
  },
  {
    name: "Haskell Expert",
    slug: "haskell",
    icon: "logos:haskell-icon",
    description:
      "Pure functional programming, monads, type classes, and lazy evaluation.",
  },
  {
    name: "Elixir Expert",
    slug: "elixir",
    icon: "logos:elixir",
    description:
      "Phoenix, OTP, GenServer, and fault-tolerant distributed systems.",
  },
  {
    name: "Scala Expert",
    slug: "scala",
    icon: "logos:scala",
    description: "Akka, Spark, Cats, and functional programming on the JVM.",
  },
  {
    name: "Dart Expert",
    slug: "dart",
    icon: "logos:dart",
    description:
      "Flutter, null-safety, isolates, and cross-platform mobile development.",
  },
  {
    name: "C Expert",
    slug: "c",
    icon: "logos:c",
    description:
      "Low-level systems programming, memory management, and POSIX APIs.",
  },
  {
    name: "Assembly Expert",
    slug: "assembly",
    icon: "simple-icons:assembly",
    description:
      "x86-64 / ARM assembly, calling conventions, SIMD, and disassembly.",
  },
  {
    name: "Lua Expert",
    slug: "lua",
    icon: "logos:lua",
    description:
      "Embedded scripting, Nginx/OpenResty, and game engine integration.",
  },
  {
    name: "R Expert",
    slug: "r",
    icon: "logos:r-lang",
    description:
      "Statistical computing, ggplot2, Tidyverse, and ML with caret/tidymodels.",
  },
  {
    name: "Julia Expert",
    slug: "julia",
    icon: "logos:julia",
    description:
      "High-performance scientific computing, multiple dispatch, and GPU code.",
  },
  {
    name: "Zig Expert",
    slug: "zig",
    icon: "simple-icons:zig",
    description: "Manual memory management, comptime, and cross-compilation.",
  },
  {
    name: "COBOL Expert",
    slug: "cobol",
    icon: "simple-icons:cobol",
    description:
      "Mainframe COBOL, VSAM, JCL, and legacy modernisation patterns.",
  },
  {
    name: "Fortran Expert",
    slug: "fortran",
    icon: "simple-icons:fortran",
    description: "Scientific Fortran 2018, array semantics, and HPC tuning.",
  },
  {
    name: "Prolog Expert",
    slug: "prolog",
    icon: "simple-icons:prolog",
    description:
      "Logic programming, constraint solving, and knowledge representation.",
  },
];

const CLOUD_AGENTS = [
  {
    name: "AWS Expert",
    slug: "aws",
    icon: "logos:aws",
    description:
      "EC2, Lambda, RDS, S3, CloudFormation, CDK, and IAM policy design.",
  },
  {
    name: "GCP Expert",
    slug: "gcp",
    icon: "logos:google-cloud",
    description:
      "Cloud Run, BigQuery, GKE, Pub/Sub, Vertex AI, and Terraform on GCP.",
  },
  {
    name: "Azure Expert",
    slug: "azure",
    icon: "logos:microsoft-azure",
    description:
      "AKS, Azure Functions, Cosmos DB, Entra ID, and DevOps pipelines.",
  },
  {
    name: "Cloudflare Expert",
    slug: "cloudflare",
    icon: "logos:cloudflare",
    description:
      "Workers, R2, D1, Pages, WAF rules, and edge-native architectures.",
  },
  {
    name: "Vercel Expert",
    slug: "vercel",
    icon: "logos:vercel-icon",
    description:
      "Next.js deployment, Edge Functions, ISR, and monorepo projects.",
  },
  {
    name: "Netlify Expert",
    slug: "netlify",
    icon: "logos:netlify",
    description: "Netlify Functions, Edge Handlers, forms, and build plugins.",
  },
  {
    name: "Supabase Expert",
    slug: "supabase",
    icon: "logos:supabase-icon",
    description: "PostgreSQL, Auth, Realtime, Storage, and Edge Functions.",
  },
  {
    name: "Digital Ocean Expert",
    slug: "digitalocean",
    icon: "logos:digital-ocean",
    description:
      "Droplets, App Platform, Managed Databases, and Spaces object storage.",
  },
  {
    name: "Fly.io Expert",
    slug: "flyio",
    icon: "simple-icons:flyio",
    description:
      "Edge app deployment, Machines API, volumes, and global anycast.",
  },
  {
    name: "Railway Expert",
    slug: "railway",
    icon: "simple-icons:railway",
    description:
      "One-click deploy, services, volumes, and environment management.",
  },
  {
    name: "Render Expert",
    slug: "render",
    icon: "simple-icons:render",
    description:
      "Web services, background workers, cron jobs, and Blueprints IaC.",
  },
  {
    name: "Neon Expert",
    slug: "neon",
    icon: "simple-icons:neon",
    description:
      "Serverless Postgres, branching, autoscaling, and connection pooling.",
  },
  {
    name: "Oracle Cloud Expert",
    slug: "oracle",
    icon: "logos:oracle",
    description: "OCI compute, autonomous databases, and networking.",
  },
  {
    name: "IBM Cloud Expert",
    slug: "ibmcloud",
    icon: "logos:ibm",
    description: "Watson AI services, OpenShift, and enterprise hybrid cloud.",
  },
  {
    name: "Hetzner Expert",
    slug: "hetzner",
    icon: "simple-icons:hetzner",
    description:
      "Dedicated servers, cloud VMs, and cost-efficient EU infrastructure.",
  },
  {
    name: "Linode/Akamai Expert",
    slug: "linode",
    icon: "simple-icons:linode",
    description: "LKE, Linode Object Storage, and StackScripts.",
  },
  {
    name: "Vultr Expert",
    slug: "vultr",
    icon: "simple-icons:vultr",
    description:
      "Bare metal, managed Kubernetes, block storage, and global edge.",
  },
  {
    name: "Scaleway Expert",
    slug: "scaleway",
    icon: "simple-icons:scaleway",
    description:
      "Serverless functions, Object Storage, and European sovereignty cloud.",
  },
  {
    name: "OVHcloud Expert",
    slug: "ovhcloud",
    icon: "simple-icons:ovh",
    description:
      "Bare metal, Kubernetes, and managed databases across EU zones.",
  },
  {
    name: "Fastly Expert",
    slug: "fastly",
    icon: "simple-icons:fastly",
    description: "CDN, edge compute, real-time logs, and image optimisation.",
  },
  {
    name: "PlanetScale Expert",
    slug: "planetscale",
    icon: "simple-icons:planetscale",
    description:
      "Database branching, Vitess sharding, zero-downtime schema changes.",
  },
  {
    name: "CockroachDB Expert",
    slug: "cockroachdb",
    icon: "simple-icons:cockroachlabs",
    description:
      "Distributed SQL, multi-region REGIONAL BY ROW, changefeeds, survivability zones.",
  },
  {
    name: "Upstash Expert",
    slug: "upstash",
    icon: "simple-icons:upstash",
    description:
      "Serverless Redis REST, QStash message queue, Kafka, and Vector — edge-compatible.",
  },
];

const INTEGRATION_AGENTS = [
  {
    name: "Stripe Expert",
    slug: "stripe",
    icon: "logos:stripe",
    description:
      "Payments, subscriptions, Radar fraud, Connect marketplaces, and webhooks.",
  },
  {
    name: "Twilio Expert",
    slug: "twilio",
    icon: "logos:twilio-icon",
    description:
      "SMS, WhatsApp, Voice, Verify OTP, A2P 10DLC, and Studio Flows.",
  },
  {
    name: "SendGrid Expert",
    slug: "sendgrid",
    icon: "logos:sendgrid-icon",
    description:
      "Transactional email, dynamic templates, suppressions, and deliverability.",
  },
  {
    name: "OpenAI SDK Expert",
    slug: "openai",
    icon: "simple-icons:openai",
    description:
      "Chat completions, Assistants v2, tool calling, vision, embeddings, and fine-tuning.",
  },
  {
    name: "Anthropic Expert",
    slug: "anthropic",
    icon: "simple-icons:anthropic",
    description:
      "Claude 3.x APIs, tool use, streaming, vision, and prompt caching.",
  },
  {
    name: "LangChain Expert",
    slug: "langchain",
    icon: "simple-icons:langchain",
    description:
      "RAG pipelines, LCEL chains, tool agents, memory, and LangSmith tracing.",
  },
  {
    name: "HuggingFace Expert",
    slug: "huggingface",
    icon: "simple-icons:huggingface",
    description:
      "Inference API, model hub, Transformers, Datasets, and Spaces.",
  },
  {
    name: "Replicate Expert",
    slug: "replicate",
    icon: "simple-icons:replicate",
    description:
      "On-demand AI model inference, Cog packaging, and webhook callbacks.",
  },
  {
    name: "Slack Expert",
    slug: "slack",
    icon: "logos:slack-icon",
    description:
      "Bolt framework, Block Kit, slash commands, modals, and Events API.",
  },
  {
    name: "Notion Expert",
    slug: "notion",
    icon: "simple-icons:notion",
    description:
      "Databases, blocks, rich text, OAuth integration, and change polling.",
  },
  {
    name: "Plaid Expert",
    slug: "plaid",
    icon: "simple-icons:plaid",
    description:
      "Bank Link flow, transactions, ACH auth, identity, investments, and KYC.",
  },
  {
    name: "Firebase Expert",
    slug: "firebase",
    icon: "logos:firebase",
    description:
      "Firestore, Auth, Realtime DB, Cloud Functions, Storage, and FCM push.",
  },
  {
    name: "Auth0 Expert",
    slug: "auth0",
    icon: "simple-icons:auth0",
    description: "OIDC/OAuth2, Rules/Actions, RBAC, MFA, and enterprise SSO.",
  },
  {
    name: "Shopify Expert",
    slug: "shopify",
    icon: "logos:shopify",
    description:
      "Storefront/Admin APIs, webhooks, checkout extensions, and theme dev.",
  },
  {
    name: "Sentry Expert",
    slug: "sentry",
    icon: "logos:sentry-icon",
    description:
      "Error tracking, performance monitoring, source maps, and alerts.",
  },
  {
    name: "Datadog Expert",
    slug: "datadog",
    icon: "logos:datadog",
    description: "APM, metrics, logs, dashboards, monitors, and SLO tracking.",
  },
  {
    name: "PostHog Expert",
    slug: "posthog",
    icon: "logos:posthog",
    description:
      "Product analytics, session replay, feature flags, and A/B testing.",
  },
  {
    name: "Cloudinary Expert",
    slug: "cloudinary",
    icon: "logos:cloudinary",
    description:
      "Media upload API, URL transformation, AI background removal, and DAM.",
  },
  {
    name: "AWS S3 Expert",
    slug: "aws_s3",
    icon: "logos:aws-s3",
    description:
      "Presigned URLs, multipart upload, lifecycle rules, and event notifications.",
  },
  {
    name: "Linear Expert",
    slug: "linear",
    icon: "simple-icons:linear",
    description:
      "Issues, projects, cycles, webhooks, and Git integration via GraphQL API.",
  },
  {
    name: "Pinecone Expert",
    slug: "pinecone",
    icon: "simple-icons:pinecone",
    description:
      "Vector index upsert/query, namespaces, metadata filtering, and hybrid RAG.",
  },
  {
    name: "Qdrant Expert",
    slug: "qdrant",
    icon: "simple-icons:qdrant",
    description:
      "Collections, payload filtering, sparse vectors, and self-hosted search.",
  },
  {
    name: "Weaviate Expert",
    slug: "weaviate",
    icon: "simple-icons:weaviate",
    description:
      "Schema, CRUD, hybrid BM25+vector, generative QA, and multi-tenancy.",
  },
  {
    name: "GitHub API Expert",
    slug: "github_api",
    icon: "logos:github-icon",
    description:
      "Octokit REST/GraphQL, webhooks, Actions, App OAuth, and code search.",
  },
  {
    name: "Jira Expert",
    slug: "jira",
    icon: "logos:jira",
    description: "Issue CRUD, sprints, transitions, webhooks, and JQL queries.",
  },
  {
    name: "Airtable Expert",
    slug: "airtable",
    icon: "simple-icons:airtable",
    description:
      "Records API, formula fields, views, webhooks, and metadata API.",
  },
  {
    name: "Resend Expert",
    slug: "resend",
    icon: "simple-icons:resend",
    description:
      "Transactional emails, domains, audiences, broadcasts, and webhooks.",
  },
  {
    name: "Segment Expert",
    slug: "segment",
    icon: "logos:segment-icon",
    description:
      "Analytics.js, server SDK, Protocols tracking plan, Profiles, and Reverse ETL.",
  },
  {
    name: "Intercom Expert",
    slug: "intercom",
    icon: "logos:intercom-icon",
    description:
      "Messenger SDK, conversation management, product tours, and webhooks.",
  },
  {
    name: "LaunchDarkly Expert",
    slug: "launchdarkly",
    icon: "simple-icons:launchdarkly",
    description:
      "Multi-context targeting, JSON flag variations, experiments, and flag lifecycle.",
  },
  {
    name: "Temporal Expert",
    slug: "temporal",
    icon: "simple-icons:temporal",
    description:
      "Durable workflows, activity retries, signals/queries, and saga compensation.",
  },
  {
    name: "Amplitude Expert",
    slug: "amplitude",
    icon: "simple-icons:amplitude",
    description:
      "Browser/Node SDKs, Identify API, Experiment variant fetching, and session replay.",
  },
  {
    name: "Mixpanel Expert",
    slug: "mixpanel",
    icon: "simple-icons:mixpanel",
    description:
      "Alias→identify pattern, People profiles, JQL, and EU data residency.",
  },
  {
    name: "Contentful Expert",
    slug: "contentful",
    icon: "logos:contentful",
    description:
      "CDA/CMA/GraphQL, rich text renderer, ISR webhook revalidation, and Live Preview.",
  },
  {
    name: "Sanity Expert",
    slug: "sanity",
    icon: "simple-icons:sanity",
    description:
      "GROQ queries, schema defineType, Portable Text, and real-time listener.",
  },
  {
    name: "Clerk Expert",
    slug: "clerk",
    icon: "simple-icons:clerk",
    description:
      "Next.js App Router auth(), middleware, Organizations, and Svix webhooks.",
  },
  {
    name: "HubSpot Expert",
    slug: "hubspot",
    icon: "logos:hubspot",
    description:
      "CRM CRUD, V4 associations, OAuth portal, webhook HMAC, and transactional email.",
  },
  {
    name: "Zapier Expert",
    slug: "zapier",
    icon: "logos:zapier-icon",
    description:
      "Developer Platform, REST Hook triggers, OAuth2 auto-refresh, and Zap design.",
  },
  {
    name: "Okta Expert",
    slug: "okta",
    icon: "simple-icons:okta",
    description:
      "OIDC/SAML SSO, Management API, Universal Directory, Event Hooks, and MFA.",
  },
  {
    name: "PagerDuty Expert",
    slug: "pagerduty",
    icon: "simple-icons:pagerduty",
    description:
      "Events API v2 (dedup_key lifecycle), REST incident management, and Event Hooks.",
  },
  {
    name: "Liveblocks Expert",
    slug: "liveblocks",
    icon: "simple-icons:liveblocks",
    description:
      "Presence cursors, CRDT Storage, Threads, Yjs integration, and Spaces SDK.",
  },
  {
    name: "Paddle Expert",
    slug: "paddle",
    icon: "simple-icons:paddle",
    description:
      "Billing v2, subscription lifecycle, customer portal, and MOR tax compliance.",
  },
  {
    name: "Lemon Squeezy Expert",
    slug: "lemonsqueezy",
    icon: "simple-icons:lemonsqueezy",
    description:
      "JSON:API checkouts, license key activate/validate, and HMAC webhooks.",
  },
  {
    name: "RevenueCat Expert",
    slug: "revenuecat",
    icon: "simple-icons:revenuecat",
    description:
      "iOS/Android/RN IAP, entitlements, Paywalls, and promotional grants.",
  },
  {
    name: "n8n Expert",
    slug: "n8n",
    icon: "simple-icons:n8n",
    description:
      "Self-hosted workflows, custom INodeType SDK, AI/LangChain nodes, and sub-workflows.",
  },
  {
    name: "Ably Expert",
    slug: "ably",
    icon: "simple-icons:ably",
    description:
      "JWT channel auth, Presence, Spaces SDK (cursor multiplayer), and channel history.",
  },
  {
    name: "Pusher Expert",
    slug: "pusher",
    icon: "simple-icons:pusher",
    description:
      "Private/presence channels, HMAC auth endpoint, and Beams push notifications.",
  },
  {
    name: "BullMQ Expert",
    slug: "bullmq",
    icon: "simple-icons:bullmq",
    description:
      "Queue/Worker with exponential backoff, FlowProducer DAGs, and cron repeatable jobs.",
  },
  {
    name: "Inngest Expert",
    slug: "inngest",
    icon: "simple-icons:inngest",
    description:
      "Durable step functions, step.waitForEvent saga pattern, and serverless triggers.",
  },
  {
    name: "Trigger.dev Expert",
    slug: "triggerdev",
    icon: "simple-icons:triggerdev",
    description:
      "v3 background tasks, subtask fan-out, idempotency keys, and useRealtimeRun hook.",
  },
  {
    name: "Convex Expert",
    slug: "convex",
    icon: "simple-icons:convex",
    description:
      "Realtime query subscriptions, ACID mutations, file storage, and scheduled functions.",
  },
  {
    name: "Grafana Expert",
    slug: "grafana",
    icon: "logos:grafana",
    description:
      "PromQL/LogQL/TraceQL dashboards, alerting, and Grafana Alloy DSL configuration.",
  },
  {
    name: "Algolia Expert",
    slug: "algolia",
    icon: "logos:algolia",
    description:
      "InstantSearch hooks, faceting, custom ranking, Query Rules, and Recommend API.",
  },
  {
    name: "Typesense Expert",
    slug: "typesense",
    icon: "simple-icons:typesense",
    description:
      "Collection schema, hybrid keyword+vector search, federated search, and scoped keys.",
  },
  {
    name: "Meilisearch Expert",
    slug: "meilisearch",
    icon: "simple-icons:meilisearch",
    description:
      "Filter syntax, geosearch, async tasks API, and self-hosted Docker deployment.",
  },
  {
    name: "Zod Expert",
    slug: "zod",
    icon: "simple-icons:zod",
    description:
      "Branded types, superRefine cross-field validation, discriminated unions, and zodResolver.",
  },
  {
    name: "Expo Expert",
    slug: "expo",
    icon: "logos:expo-icon",
    description:
      "expo-router v4, EAS Build/Submit/Update OTA, SDK modules, and push notifications.",
  },
  {
    name: "Axiom Expert",
    slug: "axiom",
    icon: "simple-icons:axiom",
    description:
      "Structured logging, APL queries (P99/error-rate), next-axiom, and OTel OTLP.",
  },
  {
    name: "Capacitor Expert",
    slug: "capacitor",
    icon: "simple-icons:capacitor",
    description:
      "Web-to-native sync, Camera/Push/Geolocation plugins, and custom native plugin bridge.",
  },
  {
    name: "OpenFeature Expert",
    slug: "openfeature",
    icon: "simple-icons:openfeature",
    description:
      "Typed flag evaluation, evaluation context targeting, flagd self-hosted, and lifecycle hooks.",
  },
  {
    name: "GraphQL Expert",
    slug: "graphql",
    icon: "logos:graphql",
    description:
      "Schema design, resolvers, DataLoader, subscriptions, and federation.",
  },
  {
    name: "Prisma Expert",
    slug: "prisma",
    icon: "simple-icons:prisma",
    description:
      "Schema-first ORM, migrations, Prisma Client API, Accelerate pooling, and Pulse CDC.",
  },
  {
    name: "Redis Expert",
    slug: "redis",
    icon: "logos:redis",
    description:
      "Caching patterns, pub/sub, Lua scripting, streams, and RedisJSON.",
  },
  {
    name: "Kafka Expert",
    slug: "kafka",
    icon: "logos:apache-kafka",
    description:
      "Producer/consumer, consumer groups, Avro schemas, and exactly-once semantics.",
  },
  {
    name: "Elasticsearch Expert",
    slug: "elasticsearch",
    icon: "logos:elasticsearch",
    description:
      "Index design, query DSL, aggregations, relevance tuning, and mappings.",
  },
  {
    name: "MongoDB Expert",
    slug: "mongodb",
    icon: "logos:mongodb-icon",
    description:
      "Aggregation pipeline, indexes, transactions, Atlas Search, and change streams.",
  },
  {
    name: "Playwright Expert",
    slug: "playwright",
    icon: "logos:playwright",
    description:
      "E2E testing, auto-waits, network interception, visual regression, and CI.",
  },
  {
    name: "OpenTelemetry Expert",
    slug: "opentelemetry",
    icon: "simple-icons:opentelemetry",
    description:
      "Traces, metrics, logs, SDK config, exporters, and distributed tracing.",
  },
  {
    name: "gRPC Expert",
    slug: "grpc",
    icon: "simple-icons:grpc",
    description:
      "Protobuf schema design, server/client streaming, and gRPC-web.",
  },
  {
    name: "GitHub Actions Expert",
    slug: "githubactions",
    icon: "logos:github-actions",
    description:
      "CI/CD workflows, reusable actions, secrets management, and matrix builds.",
  },
  {
    name: "Figma Expert",
    slug: "figma",
    icon: "logos:figma",
    description:
      "Design-to-code, tokens, components, API integration, and plugin development.",
  },
];

const WEB3_AGENTS = [
  // ── CEX Exchange APIs ──────────────────────────────────────────────────────
  {
    name: "Binance Expert",
    slug: "binance",
    icon: "logos:binance",
    description:
      "HMAC-SHA256 signed REST, spot/futures trading, user data stream, and CCXT abstraction.",
  },
  {
    name: "Kraken Expert",
    slug: "kraken",
    icon: "simple-icons:kraken",
    description:
      "SHA512 nonce auth, XBT naming, AddOrder, WS v2 private executions, and staking.",
  },
  {
    name: "Gemini Exchange Expert",
    slug: "gemini_exchange",
    icon: "simple-icons:gemini",
    description:
      "SHA384 payload-in-headers auth, maker-or-cancel/IOC/FOK orders, GUSD stablecoin, custody.",
  },
  {
    name: "Coinbase Advanced Trade",
    slug: "coinbase_advanced_trade",
    icon: "logos:coinbase-icon",
    description:
      "ES256 JWT per-request auth, all order types, WebSocket v9 JWT channels, and futures.",
  },
  {
    name: "Bybit Expert",
    slug: "bybit",
    icon: "simple-icons:bybit",
    description:
      "V5 recv_window HMAC, Unified Margin Account, hedge mode, batch orders, copy trading.",
  },
  {
    name: "OKX Expert",
    slug: "okx",
    icon: "simple-icons:okx",
    description:
      "ISO timestamp + passphrase auth, portfolio margin levels, DEX aggregator, OKX Wallet.",
  },
  // ── DeFi Protocols ─────────────────────────────────────────────────────────
  {
    name: "Uniswap Expert",
    slug: "uniswap",
    icon: "logos:uniswap",
    description:
      "v3 SDK + AlphaRouter, v4 hooks lifecycle, Permit2 signature approvals, and flash swaps.",
  },
  {
    name: "Aave Expert",
    slug: "aave",
    icon: "logos:aave",
    description:
      "Flash loans (simple+multi), health factor monitoring, e-mode, isolation mode, and liquidation.",
  },
  {
    name: "Compound Expert",
    slug: "compound",
    icon: "logos:compound",
    description:
      "Comet v3, supply/borrow, health factor checks, COMP rewards, and Bulker for ETH.",
  },
  {
    name: "Curve Finance Expert",
    slug: "curve_finance",
    icon: "logos:curve",
    description:
      "StableSwap/CryptoSwap AMM, curve-js SDK router, veCRV vote-locking, and Gauge rewards.",
  },
  {
    name: "1inch Expert",
    slug: "oneinch",
    icon: "logos:1inch",
    description:
      "Swap API v5, Fusion gasless SDK (Dutch auction), and Limit Order Protocol v3.",
  },
  {
    name: "dYdX Expert",
    slug: "dydx",
    icon: "simple-icons:dydx",
    description:
      "v4 Cosmos app-chain, CompositeClient, quantum sizing, Indexer REST/WS, and funding rates.",
  },
  {
    name: "Chainlink Expert",
    slug: "chainlink",
    icon: "simple-icons:chainlink",
    description:
      "Price Feeds (stale checks), VRF v2.5, Automation, CCIP cross-chain, and Functions.",
  },
  {
    name: "Safe Multisig Expert",
    slug: "safe_multisig",
    icon: "simple-icons:gnosis",
    description:
      "Protocol Kit deploy/sign/execute, API Kit async multi-owner flow, and Allowance Module.",
  },
  // ── Dev Toolchains ─────────────────────────────────────────────────────────
  {
    name: "ThirdWeb Expert",
    slug: "thirdweb",
    icon: "simple-icons:thirdweb",
    description:
      "SDK v5, in-app wallets (ERC-4337 gasless), NFT drops, Engine backend wallets, and Nebula AI.",
  },
  {
    name: "Hardhat Expert",
    slug: "hardhat",
    icon: "simple-icons:hardhat",
    description:
      "Ignition deployments, fuzz/invariant testing, mainnet forking, gas reporter, Etherscan verify.",
  },
  {
    name: "Foundry Expert",
    slug: "foundry",
    icon: "simple-icons:foundry",
    description:
      "Forge unit/fuzz/invariant tests, Cast CLI, Anvil fork node, and Solidity deploy scripts.",
  },
  // ── Smart Contract Libraries ───────────────────────────────────────────────
  {
    name: "OpenZeppelin Expert",
    slug: "openzeppelin",
    icon: "simple-icons:openzeppelin",
    description:
      "ERC20/721/1155, AccessControl RBAC, UUPS upgradeable proxies, Governor DAO, and Defender v2.",
  },
  {
    name: "ethers.js Expert",
    slug: "ethersjs",
    icon: "simple-icons:ethers",
    description:
      "v6 BrowserProvider, BigInt migration, EIP-712 typed data signing, ENS, and event filters.",
  },
  // ── Blockchain Infrastructure & RPC ───────────────────────────────────────
  {
    name: "Alchemy Expert",
    slug: "alchemy",
    icon: "simple-icons:alchemy",
    description:
      "NFT/Token/DeFi APIs, Notify webhooks (HMAC), Transaction Simulation, and AA bundler.",
  },
  {
    name: "Infura Expert",
    slug: "infura",
    icon: "simple-icons:infura",
    description:
      "Multi-chain HTTP/WSS RPC, archive nodes, Gas API, NFT/Token APIs, and IPFS gateway.",
  },
  {
    name: "QuickNode Expert",
    slug: "quicknode",
    icon: "simple-icons:quicknode",
    description:
      "Dedicated RPC, Streams with JS filter functions, QuickAlerts no-code webhooks, Add-ons.",
  },
  {
    name: "Coinbase CDP Expert",
    slug: "coinbase_cdp",
    icon: "logos:coinbase-icon",
    description:
      "MPC wallets, AgentKit AI+crypto for Base chain, Onramp, Commerce, and ERC-4337 Paymaster.",
  },
  {
    name: "The Graph Expert",
    slug: "thegraph",
    icon: "simple-icons:thegraph",
    description:
      "Subgraph schema/mappings/yaml, GraphQL queries + cursor pagination, and Substreams.",
  },
  {
    name: "Moralis Expert",
    slug: "moralis",
    icon: "simple-icons:moralis",
    description:
      "EVM wallet+NFT+DeFi data APIs, Streams real-time webhooks, and SIWE Auth API.",
  },
  // ── Wallet UX & Account Abstraction ───────────────────────────────────────
  {
    name: "Wagmi + Viem Expert",
    slug: "wagmi_viem",
    icon: "simple-icons:wagmi",
    description:
      "React hooks for multi-chain, batch reads, event watching, and smart account AA.",
  },
  {
    name: "RainbowKit Expert",
    slug: "rainbowkit",
    icon: "simple-icons:rainbowkit",
    description:
      "ConnectButton custom render prop, SIWE NextAuth, CSS theming, and wallet groupings.",
  },
  {
    name: "Pimlico Expert",
    slug: "pimlico",
    icon: "simple-icons:pimlico",
    description:
      "Permissionless.js Safe/Kernel, verifying+ERC-20 paymaster, session keys, and EIP-7702.",
  },
  // ── Blockchain SDKs ────────────────────────────────────────────────────────
  {
    name: "Solana Expert",
    slug: "solana",
    icon: "logos:solana",
    description:
      "Web3.js v2 functional API, SPL Token, Token-2022 extensions, PDAs, Anchor, Helius DAS.",
  },
  {
    name: "Avalanche Expert",
    slug: "avalanche",
    icon: "logos:avalanche",
    description:
      "C/X/P chain architecture, validator staking, Subnet-EVM, Teleporter cross-subnet, AWM.",
  },
  {
    name: "Polygon Expert",
    slug: "polygon",
    icon: "logos:polygon",
    description:
      "PoS vs zkEVM (type-2), PoS Bridge 2-step withdraw, CDK Validium/rollup, and AggLayer.",
  },
  {
    name: "NEAR Protocol Expert",
    slug: "near_protocol",
    icon: "simple-icons:near",
    description:
      "Named accounts, viewFunction/functionCall, BOS components, FastAuth, and Aurora EVM.",
  },
  {
    name: "Sui Expert",
    slug: "sui",
    icon: "simple-icons:sui",
    description:
      "Owned/shared objects, PTBs, Move modules, dApp Kit React hooks, and zkLogin OAuth.",
  },
  // ── Analytics & Data ───────────────────────────────────────────────────────
  {
    name: "Dune Analytics Expert",
    slug: "dune_analytics",
    icon: "simple-icons:dune",
    description:
      "TrinoSQL, decoded event tables, Spellbook (dex.trades/prices.usd), and API v1 execute/poll.",
  },
  {
    name: "DefiLlama Expert",
    slug: "defillama",
    icon: "simple-icons:defillama",
    description:
      "TVL/yield/stablecoin peg/bridge volume APIs, coin prices (chain:address format), all free.",
  },
  // ── NFT Ecosystem ──────────────────────────────────────────────────────────
  {
    name: "Metaplex Expert",
    slug: "metaplex",
    icon: "simple-icons:metaplex",
    description:
      "Umi, Candy Machine v3 with guards, Core Assets, and cNFTs via Bubblegum ZK compression.",
  },
  {
    name: "OpenSea Expert",
    slug: "opensea",
    icon: "simple-icons:opensea",
    description:
      "API v2, Seaport 1.6 order creation/fulfillment, Stream API real-time events, and floor sweep.",
  },
  {
    name: "Magic Eden Expert",
    slug: "magic_eden",
    icon: "simple-icons:magiceden",
    description:
      "Solana v2 + EVM v3 API, launchpad Candy Machine, WebSocket activity, and ME wallet provider.",
  },
  // ── Decentralized Storage ──────────────────────────────────────────────────
  {
    name: "IPFS & Filecoin Expert",
    slug: "ipfs_filecoin",
    icon: "simple-icons:ipfs",
    description:
      "Pinata, web3.storage W3UP, Lighthouse encrypted + token-gated storage, IPNS, and Helia.",
  },
];

const FINTECH_AGENTS = [
  {
    name: "Alpaca Expert",
    slug: "alpaca",
    icon: "simple-icons:alpaca",
    description:
      "Algo trading REST/WS, paper & live accounts, fractional shares (notional orders), crypto 24/7, WebSocket trade updates.",
  },
  {
    name: "Polygon.io Expert",
    slug: "polygon_io",
    icon: "simple-icons:polygon",
    description:
      "Real-time OHLCV bars, WebSocket SIP feed (trades/quotes/aggregates), options Greeks & IV, reference data, financial news.",
  },
  {
    name: "Alpha Vantage Expert",
    slug: "alpha_vantage",
    icon: "solar:graph-up-bold",
    description:
      "50+ technical indicators (RSI/MACD/BBANDS/ATR), fundamental income/earnings/overview, forex/crypto/commodities, news sentiment.",
  },
  {
    name: "Plaid Expert",
    slug: "plaid",
    icon: "simple-icons:plaid",
    description:
      "Bank Link OAuth flow, transactions/sync cursor API, ACH routing numbers, payroll income for underwriting, investments.",
  },
  {
    name: "Modern Treasury Expert",
    slug: "modern_treasury",
    icon: "solar:wallet-bold",
    description:
      "ACH/wire/RTP/SEPA payment orders, double-entry ledger with debit=credit enforcement, virtual accounts, HMAC webhooks.",
  },
  {
    name: "Stripe Treasury Expert",
    slug: "stripe_treasury",
    icon: "logos:stripe",
    description:
      "Financial accounts + InboundTransfer ACH, OutboundPayment to unverified bank, end-of-day sweep, Issuing virtual card with spending_limits.",
  },
  {
    name: "Persona KYC Expert",
    slug: "persona_kyc",
    icon: "solar:shield-user-bold",
    description:
      "KYC inquiry hosted/embedded flow, document + selfie verifications, AML watchlist (OFAC/PEP), webhook HMAC-SHA256 verify.",
  },
  {
    name: "Yodlee Expert",
    slug: "yodlee",
    icon: "solar:banknotes-bold",
    description:
      "FastLink Bank integration, account aggregation parsing, and Personal Financial Management (PFM) metrics.",
  },
  {
    name: "Brex Expert",
    slug: "brex",
    icon: "solar:card-bold",
    description:
      "Corporate cards, expense management workflows, vendor AP transfers, and idempotency clearing.",
  },
];

const HEALTHCARE_AGENTS = [
  {
    name: "FHIR R4 Expert",
    slug: "fhir",
    icon: "solar:health-bold",
    description:
      "SMART on FHIR OAuth2 discovery, Patient/Observation/Condition/MedicationRequest, bulk async export, US Core IG compliance.",
  },
  {
    name: "HL7 v2 Expert",
    slug: "hl7",
    icon: "solar:hospital-bold",
    description:
      "Pipe-delimited ADT/ORU/ORM/MDM message anatomy, MLLP 0x0B transport, ACK/AE/AN responses, HL7→FHIR transformation.",
  },
  {
    name: "Medplum Expert",
    slug: "medplum",
    icon: "solar:dna-bold",
    description:
      "FHIR BaaS TypeScript SDK, Bots serverless automation with BotEvent, Subscriptions, Task workflows, Questionnaire React forms.",
  },
  {
    name: "Epic Interconnect",
    slug: "epic_mychart",
    icon: "solar:health-bold",
    description:
      "MyChart patient integration, SMART on FHIR OAuth 2.0, condition extraction, and scheduling workflows.",
  },
  {
    name: "Cerner Ignite Expert",
    slug: "cerner",
    icon: "solar:hospital-bold",
    description:
      "Cerner Millennium Ignite API, SMART on FHIR, strict EHR routing, and Patient Roster traversing.",
  },
];

const GAMING_AGENTS = [
  {
    name: "Unity SDK Expert",
    slug: "unity_sdk",
    icon: "logos:unity",
    description:
      "UGS Auth/CloudSave/Economy/Matchmaker/Relay, Netcode for GameObjects NetworkVariable + ServerRpc/ClientRpc.",
  },
  {
    name: "Azure PlayFab Expert",
    slug: "playfab",
    icon: "logos:microsoft-azure",
    description:
      "CloudScript V8 serverless, Economy virtual currencies + catalog, Leaderboards, Matchmaking, A/B Experiments, LiveOps.",
  },
  {
    name: "Photon Fusion 2 Expert",
    slug: "photon_fusion",
    icon: "simple-icons:photon",
    description:
      "NetworkRunner host/shared mode, NetworkObject spawning, [Networked] props, INetworkInput pipeline, lag compensation.",
  },
  {
    name: "Nakama Expert",
    slug: "nakama",
    icon: "simple-icons:heroiclabs",
    description:
      "Device/social auth, real-time match state opcodes, matchmaker ticket queries, server storage permissions, TypeScript RPC.",
  },
  {
    name: "Steam API Expert",
    slug: "steam_api",
    icon: "logos:steam",
    description:
      "Web API player/games/achievements, auth ticket + OpenID validation, C++ Steamworks SDK achievements/leaderboards, IAP.",
  },
  {
    name: "Immutable zkEVM Expert",
    slug: "immutable_zkevm",
    icon: "simple-icons:immutable",
    description:
      "Passport embedded wallet OAuth2, gas-free NFT minting, orderbook prepareListing/fulfillOrder, Unity SDK deep-link.",
  },
  {
    name: "Agora Expert",
    slug: "agora",
    icon: "solar:microphone-2-bold",
    description:
      "AccessToken2 server-side, in-game voice chat, Spatial Audio 3D positioning, Cloud Recording S3 composite, RTMP push to Twitch.",
  },
  {
    name: "Epic Online Services",
    slug: "epic_online_services",
    icon: "simple-icons:epicgames",
    description:
      "EOS Connect Auth, peer-to-peer WebRTC matchmaking lobbies, cross-platform stats, and achievement syncing.",
  },
  {
    name: "Roblox Open Cloud",
    slug: "roblox",
    icon: "simple-icons:roblox",
    description:
      "External DataStores mutator, MessagingService server push, MemoryStore handling, and Places CI/CD.",
  },
];

const ECOMMERCE_AGENTS = [
  {
    name: "WooCommerce Expert",
    slug: "woocommerce",
    icon: "logos:woocommerce-icon",
    description:
      "REST API v3 Basic Auth, variable products + variations, webhook HMAC verification, PHP action/filter plugin hooks.",
  },
  {
    name: "Amazon SP-API Expert",
    slug: "amazon_sp_api",
    icon: "logos:aws",
    description:
      "LWA OAuth2 + AWS SigV4 dual auth, Inventory 3-step publish, Orders with shipment confirm, FBA, async Reports ndjson.",
  },
  {
    name: "EasyPost Expert",
    slug: "easypost",
    icon: "solar:box-bold",
    description:
      "Address verification, rate shopping lowestRate, SmartRate delivery percentiles, return labels, carrier tracker webhooks.",
  },
  {
    name: "Klarna Expert",
    slug: "klarna",
    icon: "simple-icons:klarna",
    description:
      "Checkout v3 hosted html_snippet, Payments JS SDK session→authorize→capture, On-Site Messaging BNPL widget.",
  },
  {
    name: "BigCommerce Expert",
    slug: "bigcommerce",
    icon: "simple-icons:bigcommerce",
    description:
      "V3 REST API, GraphQL Storefront with storefront token, Catalyst Next.js 14 headless starter, webhook HMAC verify.",
  },
  {
    name: "eBay Expert",
    slug: "ebay",
    icon: "logos:ebay",
    description:
      "User + app OAuth2 tokens, Inventory API 3-step item→offer→publish, Promoted Listings CPS campaign, Notification subscriptions.",
  },
  {
    name: "Magento Expert",
    slug: "magento",
    icon: "logos:magento",
    description:
      "Adobe Commerce REST/GraphQL, catalog structure parsing, multi-source inventory (MSI), and orders sync.",
  },
  {
    name: "Shopify Hydrogen",
    slug: "shopify_hydrogen",
    icon: "logos:shopify",
    description:
      "Headless Commerce React scaffolding, Storefront GraphQL API edge caching, and cart mutations.",
  },
];

const IOT_AGENTS = [
  {
    name: "AWS IoT Core Expert",
    slug: "aws_iot",
    icon: "logos:aws",
    description:
      "X.509 mutual TLS MQTT, Device Shadow desired/reported/delta, Rules Engine SQL→Lambda/DynamoDB, Greengrass v2 edge, OTA Jobs.",
  },
  {
    name: "MQTT Expert",
    slug: "mqtt",
    icon: "simple-icons:mqtt",
    description:
      "MQTT v5 QoS 0/1/2, LWT offline detection, retained messages, shared subscriptions, Mosquitto TLS config with ca/cert/key.",
  },
  {
    name: "InfluxDB Expert",
    slug: "influxdb",
    icon: "simple-icons:influxdb",
    description:
      "v3 IOx SQL + Flux, Line Protocol with Point builder, Telegraf MQTT consumer config, Grafana data source + threshold alerts.",
  },
  {
    name: "Home Assistant Expert",
    slug: "home_assistant",
    icon: "simple-icons:homeassistant",
    description:
      "REST/WebSocket state + service calls, YAML automation triggers/conditions/modes, config_flow integration, HACS, Lovelace.",
  },
  {
    name: "Raspberry Pi Expert",
    slug: "raspberry_pi",
    icon: "simple-icons:raspberrypi",
    description:
      "gpiozero non-blocking GPIO, I2C BME280/DHT22/ADS1115, picamera2 MJPEG stream, systemd service unit, edge-to-cloud buffer.",
  },
  {
    name: "Tuya IoT Expert",
    slug: "tuya",
    icon: "solar:cpu-bold",
    description:
      "Tuya Developer API, HMAC-SHA256 authenticated commands, Pulsar message queues, and smart device states.",
  },
  {
    name: "BalenaCloud Expert",
    slug: "balena",
    icon: "solar:server-square-bold",
    description:
      "Edge container orchestration, fleet firmware updates, device variability configs, and Raspberry Pi networks.",
  },
];

const REALESTATE_AGENTS = [
  {
    name: "Zillow Expert",
    slug: "zillow",
    icon: "solar:home-2-bold",
    description:
      "Bridge Interactive MLS API, Zestimate AVM, Walk Score walkability, GreatSchools ratings, mortgage payment formula with PMI.",
  },
  {
    name: "Buildium Expert",
    slug: "buildium",
    icon: "solar:buildings-bold",
    description:
      "Property/unit/lease/tenant CRUD, rent charges + payments with GL accounts, maintenance request lifecycle, accounting reports.",
  },
  {
    name: "Procore Expert",
    slug: "procore",
    icon: "solar:sledgehammer-bold",
    description:
      "Construction management: RFIs, Submittals, Daily Logs (crew/weather), Budget + change orders, Punch List QA items.",
  },
  {
    name: "Guesty Expert",
    slug: "guesty",
    icon: "solar:sun-bold",
    description:
      "STR/Airbnb channel manager: listings/reservations, calendar blocking, automated guest messages, dynamic pricing, cleaning tasks.",
  },
  {
    name: "ATTOM Expert",
    slug: "attom",
    icon: "solar:chart-square-bold",
    description:
      "Property AVM with FSD confidence, sale comps (CMA), neighborhood demographics, hazard risk (flood FEMA/wildfire/earthquake).",
  },
  {
    name: "CoStar CRE Expert",
    slug: "costar",
    icon: "solar:city-bold",
    description:
      "Commercial Real Estate analytics, pulling lease comps, property valuations, and market forecasting.",
  },
  {
    name: "Yardi Systems Expert",
    slug: "yardi",
    icon: "solar:buildings-bold",
    description:
      "Voyager/Elevate APIs, commercial tenant rent rolls, SOAP integration, and maintenance ledger synchronization.",
  },
];

const EDTECH_AGENTS = [
  {
    name: "Canvas LMS Expert",
    slug: "canvas_lms",
    icon: "solar:diploma-bold",
    description:
      "PKCE OAuth2, courses/assignments + grade passback, Module content sequencing, Quiz engine, LTI 1.3 AGS grade return.",
  },
  {
    name: "Google Classroom Expert",
    slug: "google_classroom",
    icon: "logos:google-classroom",
    description:
      "Scoped OAuth2, Coursework ASSIGNMENT/MCQ types, submission grading + return, Pub/Sub push notifications.",
  },
  {
    name: "Zoom SDK Expert",
    slug: "zoom_sdk",
    icon: "logos:zoom-icon",
    description:
      "Server-to-Server OAuth, Meeting + Video SDK custom UI, webinars, cloud recordings, HMAC webhook validation.",
  },
  {
    name: "D2L Brightspace Expert",
    slug: "brightspace",
    icon: "solar:book-bold",
    description:
      "LE/LP API versioning, GradeBook PointsNumerator grade passback, SCORM upload + completion tracking, BDP analytics.",
  },
  {
    name: "Moodle Expert",
    slug: "moodle",
    icon: "solar:book-bold",
    description:
      "Moodle Web Services REST API, batch course creation, SIS enrollment syncing, and SCORM completion extraction.",
  },
  {
    name: "Blackboard Learn",
    slug: "blackboard",
    icon: "solar:book-bookmark-bold",
    description:
      "LMS external SIS mappings, column gradebook aggregations, LTI Advantage integrations, and user paginations.",
  },
];

const LEGAL_AGENTS = [
  {
    name: "DocuSign Expert",
    slug: "docusign",
    icon: "simple-icons:docusign",
    description:
      "JWT RSA grant auth, envelope tab positioning, embedded iframe signing URL, template role-fill, bulk send, Connect HMAC webhooks.",
  },
  {
    name: "Clio Expert",
    slug: "clio",
    icon: "solar:case-bold",
    description:
      "Matter/Contact/TimeEntry CRUD, invoice draft→approve→payment lifecycle, multipart document upload, webhook HMAC-SHA256.",
  },
  {
    name: "Ironclad Expert",
    slug: "ironclad",
    icon: "solar:document-add-bold",
    description:
      "Contract Lifecycle Management API, triggering templates, metadata extraction, and workflow status webhooks.",
  },
  {
    name: "Everlaw Expert",
    slug: "everlaw",
    icon: "solar:scale-bold",
    description:
      "Cloud eDiscovery workflows, massive litigation binder handling, chronological metadata uploading.",
  },
];

const MEDIA_AGENTS = [
  {
    name: "Spotify Expert",
    slug: "spotify",
    icon: "logos:spotify-icon",
    description:
      "PKCE OAuth2, Web Playback SDK (Premium), recommendations with audio feature seeds, playlist CRUD, now playing + queue control.",
  },
  {
    name: "YouTube Expert",
    slug: "youtube",
    icon: "logos:youtube-icon",
    description:
      "Data API v3 search/upload (resumable), Analytics views/watchtime/revenue, Live Streaming broadcast+bind+transition.",
  },
  {
    name: "Twitch Expert",
    slug: "twitch",
    icon: "logos:twitch",
    description:
      "Helix streams/clips, EventSub HMAC webhooks + WS chat, Channel Points create/fulfill, Predictions & Polls lifecycle.",
  },
  {
    name: "Discord Expert",
    slug: "discord",
    icon: "logos:discord-icon",
    description:
      "Discord.js v14 slash commands, EmbedBuilder, buttons/modals/select menus, role management, webhook notifs, OAuth2 guild auth.",
  },
  {
    name: "Mux Expert",
    slug: "mux",
    icon: "solar:video-library-bold",
    description:
      "Automated VOD transcoding to HLS, RTMP ingest keys for live streaming, and playback QoE data telemetry.",
  },
  {
    name: "Frame.io Expert",
    slug: "frame_io",
    icon: "solar:videocamera-record-bold",
    description:
      "Video asset upload pipelines, timestamped comment/annotation pushing, Webhook render alerts.",
  },
];

const HR_AGENTS = [
  {
    name: "BambooHR Expert",
    slug: "bamboohr",
    icon: "simple-icons:bamboohr",
    description:
      "Employee CRUD + custom fields, time-off request and approval, custom report builder, ATS pipeline, field-monitor webhooks.",
  },
  {
    name: "Greenhouse ATS Expert",
    slug: "greenhouse",
    icon: "simple-icons:greenhouse",
    description:
      "Candidate/application/stage pipeline, scorecard overall_recommendation, offer create+open lifecycle, Job Board API, HMAC webhooks.",
  },
  {
    name: "Rippling Expert",
    slug: "rippling",
    icon: "simple-icons:rippling",
    description:
      "SCIM 2.0 employee provisioning/deprovisioning, lifecycle webhooks, payroll_run_completed events, MDM device + app provisioning.",
  },
  {
    name: "Workday Expert",
    slug: "workday",
    icon: "solar:users-group-two-rounded-bold",
    description:
      "HCM integration via Workday REST/SOAP, org chart traversal, employee data extraction, and Custom Reports (RaaS).",
  },
  {
    name: "Lattice Expert",
    slug: "lattice",
    icon: "solar:target-bold",
    description:
      "OKR matrix updates, 1:1 meeting tracking, performance review extraction, and goal integrations.",
  },
];

const CYBERSEC_AGENTS = [
  {
    name: "VirusTotal Expert",
    slug: "virustotal",
    icon: "solar:shield-check-bold",
    description:
      "File/URL/IP/domain scanning, YARA Livehunt rules, behavioral sandbox MITRE ATT&CK, IOC pivot graph across dropped files/domains.",
  },
  {
    name: "Shodan Expert",
    slug: "shodan",
    icon: "solar:radar-bold",
    description:
      "Host lookup (ports/banners/CVEs/SSL), advanced search (vuln/asn/org/ssl), continuous monitoring alerts, exploit DB cross-reference.",
  },
  {
    name: "CrowdStrike Falcon Expert",
    slug: "crowdstrike",
    icon: "solar:shield-star-bold",
    description:
      "OAuth2 Detections API, RTR remote command execution, host containment/lift, custom IOC prevent/detect, Threat Intel actor profiles.",
  },
  {
    name: "Splunk Expert",
    slug: "splunk",
    icon: "solar:chart-bold",
    description:
      "SPL queries (failed logins/Sysmon/geo), HEC log ingestion, saved search cron alerts, KV Store IOC lookups, SOAR playbook trigger.",
  },
  {
    name: "Have I Been Pwned Expert",
    slug: "hibp",
    icon: "solar:lock-keyhole-bold",
    description:
      "Email breach lookup, k-anonymity Pwned Passwords SHA-1 prefix (privacy-safe), domain monitoring, integration for secure registration flows.",
  },
  {
    name: "Tenable Expert",
    slug: "tenable",
    icon: "solar:shield-warning-bold",
    description:
      "Nessus Vulnerability Management API, chunked export of scan results, and compliance reporting.",
  },
  {
    name: "Auth0 CIAM Expert",
    slug: "auth0",
    icon: "logos:auth0",
    description:
      "Auth0 Management API v2, RBAC mutations, Rules/Hooks migration logic, and strict rate-limit handling.",
  },
];

const MARKETING_AGENTS = [
  {
    name: "HubSpot CRM Expert",
    slug: "hubspot",
    icon: "logos:hubspot",
    description:
      "CRM contacts/deals/pipeline, custom properties, engagement timeline, webhook HMAC-SHA256-v3, form submission for lead capture.",
  },
  {
    name: "Klaviyo Expert",
    slug: "klaviyo",
    icon: "simple-icons:klaviyo",
    description:
      "Revision-header API, profile upsert + subscription, ecommerce event Flows (abandoned cart/winback), campaign send-job, SMS.",
  },
  {
    name: "Segment Expert",
    slug: "segment",
    icon: "logos:segment",
    description:
      "Identify/Track/Page/Group CDP calls, 300+ destination auto-forwarding, Profiles API customer 360, Protocols schema validation.",
  },
  {
    name: "Mixpanel Expert",
    slug: "mixpanel",
    icon: "logos:mixpanel",
    description:
      "$insert_id event deduplication, People profile $set/$add/$union, funnel/retention cohorts, JQL programmatic queries, NDJSON export.",
  },
  {
    name: "Marketo Expert",
    slug: "marketo",
    icon: "solar:cart-large-bold",
    description:
      "Marketo Engage REST API, lead upserting, smart campaign triggering, and activity scoring.",
  },
  {
    name: "Iterable Expert",
    slug: "iterable",
    icon: "solar:mailbox-bold",
    description:
      "Cross-channel engagement API, manipulating massive user profile JSON payloads, dynamic ETL webhooks.",
  },
];

const BIOTECH_AGENTS = [
  {
    name: "NCBI Expert",
    slug: "ncbi",
    icon: "solar:test-tube-minimalistic-bold",
    description: "PubMed, GenBank, dbSNP, and Entrez E-utilities integration.",
  },
  {
    name: "Ensembl Expert",
    slug: "ensembl",
    icon: "solar:dna-bold",
    description: "VEP, orthologs, gene trees, and EBI bioinformatics data.",
  },
  {
    name: "Illumina Expert",
    slug: "illumina",
    icon: "solar:bacteria-bold",
    description:
      "BaseSpace sequence hub, FASTQ analysis, and clinical genomics.",
  },
  {
    name: "Seven Bridges Expert",
    slug: "sevenbridges",
    icon: "solar:cloud-snow-bold",
    description: "Velsera cloud compute, CWL pipelines, and TCGA datasets.",
  },
  {
    name: "RCSB PDB Expert",
    slug: "rcsb_pdb",
    icon: "solar:bacteria-bold",
    description:
      "Protein Data Bank REST/GraphQL API for macromolecular structure retrieval and 3D coordinate parsing.",
  },
  {
    name: "Benchling Expert",
    slug: "benchling",
    icon: "solar:test-tube-bold",
    description:
      "Life Sciences R&D Cloud, DNA/Protein Sequence registry mutations, and custom ELN pipeline syncing.",
  },
];

const SPACETECH_AGENTS = [
  {
    name: "NASA Open Data",
    slug: "nasa",
    icon: "solar:planet-bold",
    description: "APOD, NeoWs, Earth Observatory, and satellite TLE tracking.",
  },
  {
    name: "Maxar Expert",
    slug: "maxar",
    icon: "solar:satellite-bold",
    description: "SecureWatch ARD, electro-optical satellite imagery tasking.",
  },
  {
    name: "Spire Global",
    slug: "spire",
    icon: "solar:radar-2-bold",
    description:
      "Global satellite AIS tracking, ADS-B marítimo, and weather data.",
  },
  {
    name: "Starlink Enterprise",
    slug: "starlink",
    icon: "solar:antenna-bold",
    description:
      "Starlink telemetry, latency management, and satellite bandwidth.",
  },
  {
    name: "ESA Copernicus Expert",
    slug: "esa_copernicus",
    icon: "solar:satellite-bold",
    description:
      "Copernicus Open Access Hub, Sentinel satellite imagery retrieval, and OData catalog search.",
  },
  {
    name: "Capella Space Expert",
    slug: "capella",
    icon: "solar:earth-bold",
    description:
      "Synthetic Aperture Radar (SAR) satellite tasking, STAC metadata querying, and earth observation ordering.",
  },
];

const GOVTECH_AGENTS = [
  {
    name: "Data.gov Expert",
    slug: "datagov",
    icon: "solar:buildings-bold",
    description:
      "CKAN API datasets, municipal metadata, and federal datalakes.",
  },
  {
    name: "OpenFEMA Expert",
    slug: "openfema",
    icon: "solar:tornado-bold",
    description:
      "Disaster declarations, NFIP policies, and hazard mitigation metrics.",
  },
  {
    name: "IRS API Expert",
    slug: "irs",
    icon: "solar:banknotes-bold",
    description:
      "EIN validation, Form 990 TEOS, and non-profit 501(c)(3) verification.",
  },
  {
    name: "US Census Expert",
    slug: "census_gov",
    icon: "solar:buildings-bold",
    description:
      "Census Data API (CitySDK), American Community Survey demographics, and FIPS geographic parsing.",
  },
  {
    name: "USAspending Expert",
    slug: "usaspending",
    icon: "solar:dollar-minimalistic-bold",
    description:
      "Federal contracting datasets, grant tracing, congressional district financial tracing, and UEI mapping.",
  },
];

const EVENTS_AGENTS = [
  {
    name: "Ticketmaster",
    slug: "ticketmaster",
    icon: "solar:ticket-sale-bold",
    description: "Discovery API, venue seat mapping, and concert availability.",
  },
  {
    name: "Eventbrite",
    slug: "eventbrite",
    icon: "solar:calendar-star-bold",
    description: "Event organizing, attendee check-in webhooks, and ticketing.",
  },
  {
    name: "SeatGeek Platform",
    slug: "seatgeek",
    icon: "solar:ticket-bold",
    description:
      "Secondary market tickets, performer scores, and event aggregation.",
  },
  {
    name: "StubHub Expert",
    slug: "stubhub",
    icon: "solar:ticket-sale-bold",
    description:
      "Secondary ticket market API, catalog inventory scanning, and sales price trend reporting.",
  },
  {
    name: "Live Nation Expert",
    slug: "livenation",
    icon: "solar:music-notes-bold",
    description:
      "Enterprise festival technology mapping, extreme-throughput venue charting, and event availability algorithms.",
  },
];

const LOGISTICS_AGENTS = [
  {
    name: "Shippo Expert",
    slug: "shippo",
    icon: "solar:box-minimalistic-bold",
    description: "Multi-carrier shipping rates, tracking webhooks, and labels.",
  },
  {
    name: "Flexport Expert",
    slug: "flexport",
    icon: "solar:ship-bold",
    description:
      "Ocean/air freight forwarding, customs clearance, and supply chain APIs.",
  },
  {
    name: "Samsara Expert",
    slug: "samsara",
    icon: "solar:bus-bold",
    description:
      "Fleet management, dashcam telematics, and ELD compliance logs.",
  },
  {
    name: "Onfleet Expert",
    slug: "onfleet",
    icon: "solar:routing-2-bold",
    description:
      "Last-mile delivery tracking, driver routing logic, and ETA calculation.",
  },
  {
    name: "project44 Expert",
    slug: "project44",
    icon: "solar:box-minimalistic-bold",
    description:
      "Advanced Visibility Platform schemas, truckload predictive ETAs, ocean freight status, and Geofence event queues.",
  },
];

const TRAVEL_AGENTS = [
  {
    name: "Amadeus Expert",
    slug: "amadeus",
    icon: "solar:plain-bold",
    description:
      "Global Distribution System (GDS) for flight availability and hotel search.",
  },
  {
    name: "Uber Expert",
    slug: "uber",
    icon: "solar:car-bold",
    description:
      "Uber Rides integration and Uber Direct local delivery dispatching.",
  },
  {
    name: "Skyscanner Expert",
    slug: "skyscanner",
    icon: "solar:map-arrow-up-bold",
    description:
      "Live flight pricing, indicative rates, and travel affiliate data.",
  },
  {
    name: "Sabre Expert",
    slug: "sabre",
    icon: "solar:plane-bold",
    description:
      "Sabre GDS flight search algorithms, PNR creation, and hospitality pricing.",
  },
  {
    name: "Hopper Cloud Expert",
    slug: "hopper",
    icon: "solar:graph-bold",
    description:
      "Fintech travel integrations, 'Price Freeze' locking, predictive B2B flight volatility, and dynamic guarantees.",
  },
];

const AUTO_AGENTS = [
  {
    name: "Smartcar Expert",
    slug: "smartcar",
    icon: "solar:car-bold",
    description:
      "Universal API for connected cars, odometer, and EV lock/unlock.",
  },
  {
    name: "ChargePoint Expert",
    slug: "chargepoint",
    icon: "solar:bolt-circle-bold",
    description:
      "Real-time EV charging station availability and session monitoring.",
  },
  {
    name: "Tesla API Expert",
    slug: "tesla",
    icon: "solar:battery-charge-bold",
    description:
      "Tesla fleet telemetry, wake states, and remote vehicle commands.",
  },
  {
    name: "Geotab Expert",
    slug: "geotab",
    icon: "solar:steering-wheel-bold",
    description:
      "Commercial fleet telematics, OBD-II logging, and MyGeotab data feeds.",
  },
  {
    name: "Rivian Fleet Expert",
    slug: "rivian",
    icon: "solar:buses-bold",
    description:
      "Electric commercial van (EDV) telematics, battery state-of-charge tracking, and push geographic vehicle tracing.",
  },
];

const AGRI_AGENTS = [
  {
    name: "John Deere Expert",
    slug: "myjohndeere",
    icon: "solar:leaf-bold",
    description:
      "Agronomic field boundaries, tractor engine telemetry, and map files.",
  },
  {
    name: "Climate FieldView",
    slug: "climatefieldview",
    icon: "solar:map-bold",
    description:
      "Yield mapping, precipitation forecasts, and digital agriculture pipelines.",
  },
  {
    name: "Planet Labs",
    slug: "planetlabs",
    icon: "solar:earth-bold",
    description:
      "High-frequency geospatial satellite imagery for NDVI crop health.",
  },
  {
    name: "Cropin Expert",
    slug: "cropin",
    icon: "solar:sprout-bold",
    description:
      "Predictive crop intelligence, yield estimation, and farm operations sync.",
  },
  {
    name: "Trimble Ag Expert",
    slug: "trimble_ag",
    icon: "solar:map-arrow-up-bold",
    description:
      "Enterprise precision agriculture, massive RTK-GPS tractor path tracing, and Field boundaries (A-B Lines).",
  },
];

const ENERGY_AGENTS = [
  {
    name: "WattTime Expert",
    slug: "watttime",
    icon: "solar:plug-circle-bold",
    description:
      "Real-time grid marginal emissions tracking for automated load shifting.",
  },
  {
    name: "Enphase Expert",
    slug: "enphase",
    icon: "solar:sun-bold",
    description:
      "Solar microinverter generation telemetry and Encharge battery SoC.",
  },
  {
    name: "Persefoni Expert",
    slug: "persefoni",
    icon: "solar:leaf-bold",
    description:
      "Carbon footprint ledger ingestion, tracking Scope 1-3 SEC emissions.",
  },
  {
    name: "NREL Expert",
    slug: "nrel",
    icon: "solar:solar-panel-large-bold",
    description:
      "PVWatts solar irradiance, alternative fuel stations, and rate structures.",
  },
  {
    name: "Octopus Energy Expert",
    slug: "octopus_energy",
    icon: "solar:bolt-circle-bold",
    description:
      "Kraken API telemetry, half-hourly dynamic pricing/Agile tariffs, and residential grid export load tracking.",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Agent Card
// ──────────────────────────────────────────────────────────────────────────────

interface Agent {
  name: string;
  slug: string;
  icon: string;
  description: string;
}

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="group flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 backdrop-blur-sm hover:border-violet-500/40 hover:bg-white/[0.06] transition-all duration-200 cursor-default"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
    >
      <div className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 group-hover:ring-violet-500/30 transition-all">
        <Icon className="text-xl" icon={agent.icon} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white leading-tight truncate">
          {agent.name}
        </p>
        <p className="text-xs text-default-400 mt-0.5 leading-relaxed line-clamp-2">
          {agent.description}
        </p>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Section Config
// ──────────────────────────────────────────────────────────────────────────────

interface SectionConfig {
  id: string;
  label: string;
  icon: string;
  gradient: string;
  badge?: string;
  agents: Agent[];
}

const SECTIONS: SectionConfig[] = [
  {
    id: "language",
    label: "Language Agents",
    icon: "solar:code-bold",
    gradient: "from-violet-500 to-fuchsia-500",
    agents: LANGUAGE_AGENTS,
  },
  {
    id: "cloud",
    label: "Cloud & Infrastructure Agents",
    icon: "solar:cloud-bold",
    gradient: "from-sky-500 to-blue-600",
    agents: CLOUD_AGENTS,
  },
  {
    id: "integration",
    label: "Integration Agents",
    icon: "solar:plug-circle-bold",
    gradient: "from-emerald-500 to-teal-500",
    agents: INTEGRATION_AGENTS,
  },
  {
    id: "web3",
    label: "Crypto & Web3 Agents",
    icon: "solar:dollar-minimalistic-bold",
    gradient: "from-amber-500 to-orange-500",
    agents: WEB3_AGENTS,
  },
  {
    id: "fintech",
    label: "FinTech & Financial Markets",
    icon: "solar:graph-up-bold",
    gradient: "from-green-500 to-emerald-600",
    badge: "NEW",
    agents: FINTECH_AGENTS,
  },
  {
    id: "healthcare",
    label: "Healthcare & MedTech",
    icon: "solar:hospital-bold",
    gradient: "from-cyan-500 to-sky-600",
    badge: "NEW",
    agents: HEALTHCARE_AGENTS,
  },
  {
    id: "gaming",
    label: "Gaming & GameFi",
    icon: "solar:gamepad-bold",
    gradient: "from-purple-500 to-indigo-600",
    badge: "NEW",
    agents: GAMING_AGENTS,
  },
  {
    id: "ecommerce",
    label: "E-Commerce & Retail",
    icon: "solar:cart-large-bold",
    gradient: "from-orange-500 to-amber-500",
    badge: "NEW",
    agents: ECOMMERCE_AGENTS,
  },
  {
    id: "iot",
    label: "IoT & Embedded Systems",
    icon: "solar:cpu-bolt-bold",
    gradient: "from-teal-500 to-cyan-600",
    badge: "NEW",
    agents: IOT_AGENTS,
  },
  {
    id: "realestate",
    label: "Real Estate & PropTech",
    icon: "solar:home-2-bold",
    gradient: "from-yellow-500 to-orange-500",
    badge: "NEW",
    agents: REALESTATE_AGENTS,
  },
  {
    id: "edtech",
    label: "EdTech & Education",
    icon: "solar:diploma-bold",
    gradient: "from-blue-500 to-indigo-500",
    badge: "NEW",
    agents: EDTECH_AGENTS,
  },
  {
    id: "legal",
    label: "Legal & LegalTech",
    icon: "solar:case-bold",
    gradient: "from-slate-400 to-slate-600",
    badge: "NEW",
    agents: LEGAL_AGENTS,
  },
  {
    id: "media",
    label: "Media & Entertainment",
    icon: "solar:play-circle-bold",
    gradient: "from-rose-500 to-pink-600",
    badge: "NEW",
    agents: MEDIA_AGENTS,
  },
  {
    id: "hr",
    label: "HR & Workforce",
    icon: "solar:users-group-rounded-bold",
    gradient: "from-indigo-500 to-violet-600",
    badge: "NEW",
    agents: HR_AGENTS,
  },
  {
    id: "cybersec",
    label: "Cybersecurity & Threat Intel",
    icon: "solar:shield-star-bold",
    gradient: "from-red-600 to-rose-700",
    badge: "NEW",
    agents: CYBERSEC_AGENTS,
  },
  {
    id: "marketing",
    label: "Marketing & Analytics",
    icon: "solar:chart-2-bold",
    gradient: "from-orange-400 to-pink-500",
    badge: "NEW",
    agents: MARKETING_AGENTS,
  },
  {
    id: "biotech",
    label: "BioTech & Genomics",
    icon: "solar:dna-bold",
    gradient: "from-lime-400 to-green-500",
    badge: "NEW",
    agents: BIOTECH_AGENTS,
  },
  {
    id: "spacetech",
    label: "SpaceTech & Geospatial",
    icon: "solar:planet-bold",
    gradient: "from-slate-700 to-black",
    badge: "NEW",
    agents: SPACETECH_AGENTS,
  },
  {
    id: "govtech",
    label: "GovTech & Public Sector",
    icon: "solar:buildings-2-bold",
    gradient: "from-blue-600 to-indigo-800",
    badge: "NEW",
    agents: GOVTECH_AGENTS,
  },
  {
    id: "events",
    label: "Live Events",
    icon: "solar:ticket-bold",
    gradient: "from-fuchsia-500 to-purple-600",
    badge: "NEW",
    agents: EVENTS_AGENTS,
  },
  {
    id: "logistics",
    label: "Logistics & Supply Chain",
    icon: "solar:box-bold",
    gradient: "from-blue-500 to-indigo-600",
    badge: "NEW",
    agents: LOGISTICS_AGENTS,
  },
  {
    id: "travel",
    label: "Travel & Hospitality",
    icon: "solar:point-on-map-bold",
    gradient: "from-cyan-400 to-blue-500",
    badge: "NEW",
    agents: TRAVEL_AGENTS,
  },
  {
    id: "auto",
    label: "Automotive & Smart Mobility",
    icon: "solar:car-bold",
    gradient: "from-slate-600 to-zinc-800",
    badge: "NEW",
    agents: AUTO_AGENTS,
  },
  {
    id: "agri",
    label: "Agriculture & Farming",
    icon: "solar:leaf-bold",
    gradient: "from-green-500 to-emerald-700",
    badge: "NEW",
    agents: AGRI_AGENTS,
  },
  {
    id: "energy",
    label: "Energy & Climate",
    icon: "solar:bolt-bold",
    gradient: "from-yellow-400 to-orange-500",
    badge: "NEW",
    agents: ENERGY_AGENTS,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────────────

export default function AgentsShowcasePage() {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const total = SECTIONS.reduce((sum, s) => sum + s.agents.length, 0);

  const filteredSections = SECTIONS.map((sec) => ({
    ...sec,
    agents: sec.agents.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((sec) => activeSection === null || sec.id === activeSection);

  return (
    <div className="min-h-screen bg-background px-6 py-10 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
        initial={{ opacity: 0, y: -12 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/20">
            <Icon className="text-2xl text-white" icon="solar:robot-bold" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Agent Roster
            </h1>
            <p className="text-default-400 text-sm mt-0.5">
              {total} specialist agents across {SECTIONS.length} categories —
              each an elite expert in its domain
            </p>
          </div>
        </div>

        {/* Category stat pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {SECTIONS.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${s.gradient} bg-opacity-10 text-white text-xs font-medium opacity-80`}
            >
              <Icon className="text-sm" icon={s.icon} />
              <span>
                {s.agents.length} {s.label.split(" ")[0]}
              </span>
              {s.badge && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-bold uppercase">
                  {s.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Input
          isClearable
          aria-label="Search agents"
          className="max-w-xs"
          classNames={{ inputWrapper: "bg-white/5 border-white/10" }}
          placeholder="Search agents…"
          startContent={
            <Icon
              className="text-default-400 text-lg"
              icon="solar:magnifer-linear"
            />
          }
          value={search}
          onClear={() => setSearch("")}
          onValueChange={setSearch}
        />
        <div className="flex gap-2 flex-wrap">
          <Chip
            className={`cursor-pointer ${activeSection === null ? "bg-violet-600 text-white" : "border-white/20 text-default-400"}`}
            variant={activeSection === null ? "solid" : "bordered"}
            onClick={() => setActiveSection(null)}
          >
            All
          </Chip>
          {SECTIONS.map((s) => (
            <Chip
              key={s.id}
              className={`cursor-pointer ${activeSection === s.id ? "bg-violet-600 text-white" : "border-white/20 text-default-400"}`}
              variant={activeSection === s.id ? "solid" : "bordered"}
              onClick={() =>
                setActiveSection(activeSection === s.id ? null : s.id)
              }
            >
              {s.label}
              {s.badge && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-bold">
                  {s.badge}
                </span>
              )}
            </Chip>
          ))}
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="space-y-12">
        {filteredSections.map((section) => (
          <motion.section
            key={section.id}
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className={`p-2 rounded-xl bg-gradient-to-br ${section.gradient} shadow-lg`}
              >
                <Icon className="text-lg text-white" icon={section.icon} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    {section.label}
                  </h2>
                  {section.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                      {section.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-default-500">
                  {section.agents.length} agents
                </p>
              </div>
              <div
                className={`ml-auto h-px flex-1 bg-gradient-to-r ${section.gradient} opacity-20 rounded-full`}
              />
            </div>

            {/* Agent Grid */}
            {section.agents.length === 0 ? (
              <p className="text-default-500 text-sm pl-2">
                No agents match your search.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {section.agents.map((agent, i) => (
                  <AgentCard key={agent.slug} agent={agent} index={i} />
                ))}
              </div>
            )}
          </motion.section>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="mt-16 text-center text-default-500 text-xs space-y-1">
        <p>
          {LANGUAGE_AGENTS.length} language · {CLOUD_AGENTS.length} cloud ·{" "}
          {INTEGRATION_AGENTS.length} integration · {WEB3_AGENTS.length}{" "}
          crypto/web3
        </p>
        <p>
          {FINTECH_AGENTS.length} fintech · {HEALTHCARE_AGENTS.length}{" "}
          healthcare · {GAMING_AGENTS.length} gaming · {ECOMMERCE_AGENTS.length}{" "}
          e-commerce · {IOT_AGENTS.length} IoT · {LEGAL_AGENTS.length} legal ·{" "}
          {MEDIA_AGENTS.length} media · {HR_AGENTS.length} HR
        </p>
        <p>
          {REALESTATE_AGENTS.length} real estate · {EDTECH_AGENTS.length} edtech
          · {CYBERSEC_AGENTS.length} cybersecurity · {MARKETING_AGENTS.length}{" "}
          marketing
        </p>
        <p>
          {BIOTECH_AGENTS.length} biotech · {SPACETECH_AGENTS.length} space ·{" "}
          {GOVTECH_AGENTS.length} govtech · {EVENTS_AGENTS.length} events ·{" "}
          {LOGISTICS_AGENTS.length} logistics · {TRAVEL_AGENTS.length} travel
        </p>
        <p>
          {AUTO_AGENTS.length} auto · {AGRI_AGENTS.length} agri ·{" "}
          {ENERGY_AGENTS.length} energy
        </p>
        <p>Growing every sprint · Built with ⚡ by Alti.Code.Studio</p>
      </div>
    </div>
  );
}
