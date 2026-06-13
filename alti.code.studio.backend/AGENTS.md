# 🤖 Alti.Code.Studio — Agent Roster

> **578+ Hyper-Specialized AI Agents** across 20 tiers + 35 Industry Verticals
> Every agent is hardened with retry, timeout, circuit breaker, and input validation via `BaseSpecialistAgent`.

---

## How Agents Work

1. **Routing**: The `CapabilityRouter` scores queries against **403 keyword routes** and dispatches to the best agent
2. **Consultation**: `agent.consult(prompt, contextData[])` → `agent._invoke()` → `GeminiAiService`
3. **Hardening**: Every call gets retry, timeout, circuit breaker, and response validation automatically
4. **Metrics**: `.getMetrics()` returns `{ calls, errors, avgLatencyMs, errorRate, circuitOpen }`
5. **Elite Architecture**: Each agent preamble is infused with rigorous, highly specialized domain expertise (e.g., framework-specific pitfalls, security best practices, and integration geometries).

```js
// Example: direct usage
import { capabilityRouter } from './capability.router.js';

const result = await capabilityRouter.dispatch(
  'Set up a Guesty channel manager for Airbnb listings',
  [{ path: 'config.json', content: '...' }]
);
// → GuestyAgent consult() result

// Fan-out to top 3 agents
const results = await capabilityRouter.fanOut('YARA rule for CobaltStrike', [], 3);
// → [{ name: 'VirusTotal_Expert', result: '...' }, ...]
```

---

## Tier 6/7 — Core Cloud & Language Experts

| Agent | File | Keywords |
|-------|------|----------|
| AWS Expert | `aws.agent.js` | aws, ec2, s3, lambda, cloudformation, iam, eks, cdk |
| GCP Expert | `gcp.agent.js` | gcp, google cloud, cloud run, bigquery, firebase |
| Azure Expert | `azure.agent.js` | azure, aks, azure devops, arm template, bicep |
| TypeScript Expert | `typescript.agent.js` | typescript, ts strict, generic, next.js |
| Python Expert | `python.agent.js` | python, asyncio, fastapi, django, pydantic |
| Rust Expert | `rust.agent.js` | rust, borrow checker, lifetime, cargo, tokio |
| Go Expert | `golang.agent.js` | golang, goroutine, channel go, go mod |

---

## Tier 9 — Growth & Operations

| Agent | File | Keywords |
|-------|------|----------|
| SEO Expert | `seo.agent.js` | seo, meta, sitemap, core web vitals, opengraph |
| Accessibility Expert | `accessibility.agent.js` | a11y, wcag, aria, screen reader |
| Onboarding Expert | `onboarding.agent.js` | quickstart, readme, getting started, documentation |
| API Design Expert | `api_design.agent.js` | api design, openapi, swagger, rest design |
| Incident Expert | `incident.agent.js` | incident, outage, postmortem, rca, sre |
| Migration Expert | `migration.agent.js` | migrate, schema change, zero downtime, rollback |
| Cost Expert | `cost.agent.js` | finops, cloud spend, billing, right-size |

---

## Tier 12 — Hyper-Niche Micro Specialists

| Agent | File | Keywords |
|-------|------|----------|
| Regex Expert | `regex.agent.js` | regex, capture group, lookahead, lookbehind |
| Docker Expert | `docker.agent.js` | dockerfile, docker, container, multi-stage build |
| Kubernetes Expert | `kubernetes.agent.js` | kubernetes, k8s, pod, helm, ingress |
| Nginx Expert | `nginx.agent.js` | nginx, reverse proxy, server block, ssl termination |
| GraphQL Expert | `graphql.agent.js` | graphql, resolver, n+1, dataloader, apollo |
| Bash Expert | `bash.agent.js` | bash, shell script, awk, sed, grep |
| Cron Expert | `cron.agent.js` | cron, schedule, crontab, periodic job |
| FFmpeg Expert | `ffmpeg.agent.js` | ffmpeg, video encode, transcode, hls, codec |
| JWT Expert | `jwt.agent.js` | jwt, bearer token, claims, rs256 |
| Three.js Expert | `threejs.agent.js` | three.js, webgl, glsl, shader |

---

## Tier 13 — Enterprise SDK Integrations

| Agent | File | Keywords |
|-------|------|----------|
| Stripe Expert | `stripe.agent.js` | stripe, payment, subscription, webhook |
| Redis Expert | `redis.agent.js` | redis, cache, pub/sub, rate limit |
| Supabase Expert | `supabase.agent.js` | supabase, row level security, rls |
| Prisma Expert | `prisma.agent.js` | prisma, orm, drizzle, prisma schema |
| WebRTC Expert | `webrtc.agent.js` | webrtc, peer connection, sdp, stun, turn |
| Solidity Expert | `solidity.agent.js` | solidity, smart contract, evm, erc20 |
| Svelte Expert | `svelte.agent.js` | svelte, sveltekit, svelte runes |
| Vue Expert | `vue.agent.js` | vue, nuxt, pinia, composition api |
| Storybook Expert | `storybook.agent.js` | storybook, component story, chromatic |
| OpenTelemetry Expert | `opentelemetry.agent.js` | otel, tracing, jaeger, zipkin |
| Ansible Expert | `ansible.agent.js` | ansible, playbook, inventory, idempotent |
| Terraform Expert | `terraform.agent.js` | terraform, hcl, tf plan, terragrunt |

---

## Tier 13b — Deep OS Integration Agents (v7.6.0)

> Backed by the 4 new open-source submodules (66k+ combined GitHub stars). All use real subprocess or LangGraph-based execution.

| Agent | File | Queue | Keywords |
|-------|------|-------|----------|
| Context Engineering | `agent-skills-context.agent.js` | `context-engineering-queue` | context engineering, token budget, scratchpad, compressor, selector agent, context distillery |
| Deep Research | `deer-flow.agent.js` | `deer-flow-queue` | deer-flow, deep research, research harness, langgraph research, superagent harness, multi-step research |
| PageIndex RAG | `pageindex.agent.js` | `pageindex-queue` | vectorless rag, page index, reasoning rag, no vector database, page citation, document reasoning |
| Nano Code Agent | `learn-claude-code.agent.js` | `nano-agent-queue` | nano agent, bash tool loop, autonomous code execution, self-correcting agent, read write bash |

---

## Tier 14 — AI / ML / Mobile / Data

| Agent | File | Keywords |
|-------|------|----------|
| LangChain Expert | `langchain.agent.js` | langchain, rag, retrieval augmented, lcel |
| MLOps Expert | `mlops.agent.js` | mlops, mlflow, model drift, feature store |
| Prompt Engineering Expert | `prompteng.agent.js` | prompt engineering, few-shot, chain of thought |
| React Native Expert | `reactnative.agent.js` | react native, expo, eas build |
| Flutter Expert | `flutter.agent.js` | flutter, riverpod, flutter widget, cupertino |
| PWA Expert | `pwa.agent.js` | pwa, service worker, workbox, offline |
| Vitest Expert | `vitest.agent.js` | vitest, vi.mock, unit test |
| Playwright Expert | `playwright.agent.js` | playwright, e2e test, page object |
| SQL Expert | `sql.agent.js` | sql, cte, window function, explain analyze |
| Elasticsearch Expert | `elasticsearch.agent.js` | elasticsearch, kibana, knn search |
| Kafka Expert | `kafka.agent.js` | kafka, consumer group, kafka streams |

---

## Tier 15 — Security, Platform & Creative

| Agent | File | Keywords |
|-------|------|----------|
| Pentest Expert | `pentest.agent.js` | pentest, owasp, xss, sql injection, red team |
| GitHub Actions Expert | `githubactions.agent.js` | github actions, workflow yaml, ci/cd |
| Figma Expert | `figma.agent.js` | figma, design token, design system |
| WebAssembly Expert | `wasm.agent.js` | wasm, wasi, wasm-pack, emscripten |
| Deno Expert | `deno.agent.js` | deno, fresh framework, deno deploy |
| MongoDB Expert | `mongodb.agent.js` | mongodb, mongoose, atlas search |
| gRPC Expert | `grpc.agent.js` | grpc, protobuf, proto file, rpc |
| Tailwind Expert | `tailwind.agent.js` | tailwind, tailwindcss, tw merge |
| i18n Expert | `i18n.agent.js` | i18n, internationalization, localization |
| WebSocket Expert | `websocket.agent.js` | websocket, socket.io, real-time |

---

## Tier 16 — Cloud Providers (21 Total)

| Agent | File | Specialty |
|-------|------|-----------|
| AWS Expert | `aws.agent.js` | EC2, S3, Lambda, EKS, CloudFormation, CDK |
| GCP Expert | `gcp.agent.js` | Cloud Run, BigQuery, GKE, Firebase |
| Azure Expert | `azure.agent.js` | AKS, Azure DevOps, Bicep, Azure AD |
| Cloudflare Expert | `cloudflare.agent.js` | Workers, D1, R2, Durable Objects, KV |
| Vercel Expert | `vercel.agent.js` | Edge functions, ISR, Vercel KV/Postgres |
| Netlify Expert | `netlify.agent.js` | Functions, Edge, Forms, Blobs, Jamstack |
| DigitalOcean Expert | `digitalocean.agent.js` | Droplets, App Platform, DOKS, Spaces |
| Oracle Cloud Expert | `oracle.agent.js` | OCI, Autonomous DB, OKE, OCI IAM |
| IBM Cloud Expert | `ibmcloud.agent.js` | Watson, Code Engine, IKS, DB2 |
| Alibaba Expert | `alibaba.agent.js` | ECS, OSS, Function Compute, PAI ML |
| Hetzner Expert | `hetzner.agent.js` | Hcloud, VPS, K3s, Volumes, Robot |
| Fly.io Expert | `flyio.agent.js` | Fly Machines, Tigris, Volumes |
| Railway Expert | `railway.agent.js` | Nixpacks, Railway deploy, Cron |
| Render Expert | `render.agent.js` | Web services, Background workers, Blueprints |
| Linode Expert | `linode.agent.js` | LKE, Object Storage, NodeBalancers |
| Vultr Expert | `vultr.agent.js` | VKE, Bare Metal, Block Storage |
| Scaleway Expert | `scaleway.agent.js` | Kapsule, Serverless, GDPR EU cloud |
| OVHcloud Expert | `ovhcloud.agent.js` | Dedicated Servers, OpenStack, OVH K8s |
| Neon Expert | `neon.agent.js` | Serverless Postgres, branching, zero-scale |
| Fastly Expert | `fastly.agent.js` | VCL, Compute@Edge, origin shielding, WAF |
| Backblaze Expert | `backblaze.agent.js` | B2 Object Storage, CDN Bandwidth Alliance |

---

## Tier 17 — Systems Languages

| Agent | File | Version / Focus |
|-------|------|----------------|
| C Expert | `c.agent.js` | C11/C17, manual memory, POSIX, GCC/Clang |
| C++ Expert | `cpp.agent.js` | C++23, RAII, STL, templates, concurrency |
| C# Expert | `csharp.agent.js` | C# 12/.NET 8, LINQ, Entity Framework, ASP.NET |
| Java Expert | `java.agent.js` | Java 21, virtual threads, records, Spring Boot 3 |
| Kotlin Expert | `kotlin.agent.js` | Kotlin 2.0, coroutines, KMP, Android/Compose |
| Swift Expert | `swift.agent.js` | Swift 6, actors, SwiftUI, Vapor, SPM |
| Zig Expert | `zig.agent.js` | Zig 0.13+, comptime, allocators, cross-compile |
| Nim Expert | `nim.agent.js` | Nim 2.0, ARC/ORC, macros, Nimble |

---

## Tier 18 — Dynamic / Scripting Languages

| Agent | File | Version / Focus |
|-------|------|----------------|
| Ruby Expert | `ruby.agent.js` | Ruby 3.3, Rails 7, metaprogramming, RSpec, Sidekiq |
| PHP Expert | `php.agent.js` | PHP 8.3, Fibers, Laravel 11, Eloquent, Pest |
| Perl Expert | `perl.agent.js` | Perl 5.38, Moose, CPAN, regex engine, BioPerl |
| R Expert | `r.agent.js` | R 4.x, tidyverse, ggplot2, Shiny, tidymodels |
| Julia Expert | `julia.agent.js` | Julia 1.10+, multiple dispatch, Flux.jl, DataFrames |
| MATLAB Expert | `matlab.agent.js` | MATLAB R2024a, Simulink, DSP, Control Systems |
| PowerShell Expert | `powershell.agent.js` | PowerShell 7+, DSC, Az module, Pester |
| Groovy Expert | `groovy.agent.js` | Groovy 4.x, Gradle DSL, Jenkinsfile, Grails |

---

## Tier 19 — Functional Languages

| Agent | File | Version / Focus |
|-------|------|----------------|
| Haskell Expert | `haskell.agent.js` | GHC 9.8, type classes, monads, lens, Servant |
| Elixir Expert | `elixir.agent.js` | Elixir 1.17, OTP, Phoenix LiveView, Ecto |
| Erlang Expert | `erlang.agent.js` | Erlang/OTP 27, BEAM, actor model, rebar3 |
| Scala Expert | `scala.agent.js` | Scala 3, Cats Effect, ZIO, Akka, Spark |
| F# Expert | `fsharp.agent.js` | F# 8, DUs, computation expressions, Fable, Giraffe |
| OCaml Expert | `ocaml.agent.js` | OCaml 5, effects, Dune, Eio, modules, Dream |
| Clojure Expert | `clojure.agent.js` | Clojure 1.12, core.async, Datomic, ClojureScript |
| Racket Expert | `racket.agent.js` | Racket 8.x, macros, continuations, Typed Racket |

---

## Tier 20 — Deep Systems, Cryptography & Platform Languages

| Agent | File | Focus |
|-------|------|-------|
| Zero-Knowledge Architect | `crypto.zk.agent.js` | zk-SNARKs, zk-STARKs circuits, Halo2 implementations, and Circom R1CS schemas |
| Post-Quantum Specialist | `crypto.pqc.agent.js` | ML-KEM/Kyber algorithms, Dilithium signatures, and liboqs wrappers |
| Consensus Protocol Eng. | `distributed.consensus.agent.js` | Go/Rust State Machine Replication, Raft (CFT), and PBFT (BFT) algorithms |
| Gossip & DHT Networking | `distributed.networking.agent.js` | Kademlia DHT algorithms, epidemic Gossip routing, and CRDT conflict resolution |
| LSM Tree Storage Arch. | `database.storage.agent.js` | B+Trees, LSM compaction, NVMe buffer pools, and robust Write-Ahead Logs (WAL) |
| Query Optimizer Arch. | `database.query.agent.js` | Cost-Based Optimizers (CBO), SQL parsers, and HNSW graphs for vector searching |
| TinyML Edge Optimizer | `edge.tinyml.agent.js` | CMSIS-NN inference C code for MCUs, INT8 Post-Training Quantization |
| COBOL Expert | `cobol.agent.js` | COBOL 2023, z/OS, CICS, VSAM, JCL |
| Fortran Expert | `fortran.agent.js` | Fortran 2023, OpenMP, MPI, LAPACK, HPC |
| Ada Expert | `ada.agent.js` | Ada 2022, SPARK, DO-178C, IEC 61508, Ravenscar |
| Assembly Expert | `assembly.agent.js` | x86-64 NASM, ARM64, SIMD/AVX, calling conventions |
| Objective-C Expert | `objc.agent.js` | Obj-C 2.0, ARC, Cocoa, runtime, Swift bridging |
| Crystal Expert | `crystal.agent.js` | Crystal 1.x, macros, Fibers, Lucky, Shards |
| Lua Expert | `lua.agent.js` | Lua 5.4, LuaJIT, OpenResty, LÖVE2D, metatables |
| APL Expert | `apl.agent.js` | Dyalog APL, J, K, kdb+/Q, array-oriented programming |
| HDL Expert | `vhdl.agent.js` | VHDL 2019, SystemVerilog, FPGA, UVM, Vivado |
| Apex Expert | `apex.agent.js` | Salesforce Apex, SOQL, LWC, Flows, governor limits |
| ABAP Expert | `abap.agent.js` | SAP ABAP 7.5+, CDS views, RAP, BAPI, S/4HANA |
| Prolog Expert | `prolog.agent.js` | SWI-Prolog, CLP, Datalog, backtracking, DCG |
| Dart Expert | `dart.agent.js` | Dart 3.5+, null safety, isolates, FFI, patterns |
| Wolfram Expert | `wolfram.agent.js` | Wolfram Language/Mathematica, symbolic math |
| PL/SQL Expert | `plsql.agent.js` | Oracle PL/SQL, T-SQL, packages, cursors, tuning |

---

## 🏢 Industry Verticals (Phases 7–10)

> Automatically routed via `capability.router.js` — 51 new routes covering 16 verticals.

### BioTech & Genomics (6 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| NCBI Expert | `ncbi.agent.js` | PubMed, GenBank, dbSNP, and Entrez E-utilities integration |
| Ensembl Expert | `ensembl.agent.js` | Variant Effect Predictor (VEP), orthologs, and gene trees |
| Illumina Expert | `illumina.agent.js` | BaseSpace sequence hub, FASTQ analysis, and clinical genomics |
| Seven Bridges Expert | `sevenbridges.agent.js` | Velsera cloud compute, CWL pipelines, and TCGA datasets |
| RCSB PDB Expert | `rcsb_pdb.agent.js` | Macromolecular structure retrieval |
| Benchling Expert | `benchling.agent.js` | Genetic sequence cataloging, bioprocessing LIMS |

### SpaceTech & Geospatial (6 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| NASA Open Data | `nasa.agent.js` | APOD, NeoWs, Earth Observatory, and satellite TLE tracking |
| Maxar Expert | `maxar.agent.js` | SecureWatch ARD, electro-optical satellite imagery tasking |
| Spire Global | `spire.agent.js` | Satellite AIS maritime, ADS-B aviation, and weather data feeds |
| Starlink Enterprise | `starlink.agent.js` | Satellite constellation telemetry, latency, and bandwidth |
| ESA Copernicus Expert | `esa_copernicus.agent.js` | Sentinel satellite imagery search |
| Capella Space Expert | `capella.agent.js` | Synthetic Aperture Radar (SAR) satellite tasking |

### GovTech & Public Sector (5 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Data.gov Expert | `datagov.agent.js` | CKAN API datasets, municipal metadata, federal datalakes |
| OpenFEMA Expert | `openfema.agent.js` | Disaster declarations, NFIP policies, hazard mitigation analytics |
| IRS API Expert | `irs.agent.js` | EIN validation, Form 990 TEOS, tax-exempt verification |
| US Census Expert | `census_gov.agent.js` | American Community Survey demographics, decennial census data |
| USAspending Expert | `usaspending.agent.js` | Federal contracting datasets analysis |

### Live Events & Entertainment (5 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Ticketmaster | `ticketmaster.agent.js` | Discovery API, seat mapping, and concert availability |
| Eventbrite | `eventbrite.agent.js` | Event organizer operations, ticketing, attendee check-in webhooks |
| SeatGeek Platform | `seatgeek.agent.js` | Secondary market aggregation, performer scores, price graphing |
| StubHub Expert | `stubhub.agent.js` | Secondary ticket market inventory scanning |
| Live Nation Expert | `livenation.agent.js` | Enterprise festival technology mapping |

### Logistics & Supply Chain (5 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Shippo Expert | `shippo.agent.js` | Multi-carrier shipping rates, label generation, and tracking webhooks |
| Flexport Expert | `flexport.agent.js` | Global freight forwarding, customs clearance, and supply chain APIs |
| Samsara Expert | `samsara.agent.js` | Fleet GPS telemetry, dashcams, and ELD/HOS compliance logging |
| Onfleet Expert | `onfleet.agent.js` | Last-mile delivery tracking, automated driver routing logic |
| project44 Expert | `project44.agent.js` | Intricate shipping and logistics schemas, predictive truckload ETAs |

### Travel & Hospitality (5 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Amadeus Expert | `amadeus.agent.js` | GDS flight availability, live pricing quotes, and hotel rate search |
| Uber Expert | `uber.agent.js` | Ride-hailing dispatch, business travel vouchers, and delivery |
| Skyscanner Expert | `skyscanner.agent.js` | Live flight prices, indicative caching, and travel affiliate links |
| Sabre Expert | `sabre.agent.js` | Flight search algorithms (Bargain Finder Max) |
| Hopper Expert | `hopper.agent.js` | Fintech travel integrations, predictive flight pricing |

### Automotive & Smart Mobility (5 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Smartcar Expert | `smartcar.agent.js` | Universal connected car API, odometer, EV battery stats, lock/unlock |
| ChargePoint Expert | `chargepoint.agent.js` | Real-time EV charging availability, port filtering, and OCPI networks |
| Tesla Fleet API | `tesla.agent.js` | OEM encrypted vehicle commands, powerwall data, and wake states |
| Geotab Expert | `geotab.agent.js` | Commercial fleet telematics, OBD-II logging |
| Rivian Fleet Expert | `rivian.agent.js` | Electric commercial van (EDV) telematics |

### Agriculture & Farming (5 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| John Deere Expert | `myjohndeere.agent.js` | Machine telemetry, agronomic operations, geojson field boundaries |
| Climate FieldView | `climatefieldview.agent.js` | Harvest yield mapping, field topologies, and hyper-local precipitation |
| Planet Labs Expert | `planetlabs.agent.js` | PlanetScope satellite imagery orders, NDVI metrics, crop health |
| Cropin Expert | `cropin.agent.js` | Predictive crop intelligence, seasonal yield estimation |
| Trimble Ag Expert | `trimble.agent.js` | Enterprise precision agriculture logic |

### Energy & Climate (5 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| WattTime Expert | `watttime.agent.js` | Real-time MOER tracking and automated green-grid load shifting |
| Enphase Expert | `enphase.agent.js` | Solar microinverter telemetry, consumption mapping, Encharge SoC |
| Persefoni Expert | `persefoni.agent.js` | Scope 1-3 ledger ingestion, carbon calculation, ESG compliance auditing |
| NREL Expert | `nrel.agent.js` | PVWatts solar irradiance estimation |
| Octopus Energy Expert | `octopus.agent.js` | Kraken platform telemetry |

### FinTech & Financial Markets (9 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Alpaca Expert | `alpaca.agent.js` | Algo trading, paper/live accounts, fractional shares, crypto 24/7 |
| Polygon.io Expert | `polygon_io.agent.js` | Real-time OHLCV, WebSocket SIP feed, options Greeks, reference data |
| Alpha Vantage Expert | `alpha_vantage.agent.js` | 50+ technical indicators (RSI/MACD/BBANDS), fundamentals, forex, news sentiment |
| Plaid Expert | `plaid.agent.js` | Bank Link OAuth, transactions sync cursor, ACH routing, payroll income |
| Modern Treasury Expert | `modern_treasury.agent.js` | ACH/wire/RTP/SEPA, double-entry ledger, virtual accounts, HMAC webhooks |
| Stripe Treasury Expert | `stripe_treasury.agent.js` | Financial accounts, InboundTransfer ACH, Issuing virtual card, spending limits |
| Persona KYC Expert | `persona_kyc.agent.js` | KYC inquiry, document+selfie verify, AML OFAC/PEP watchlist, HMAC webhooks |
| Yodlee Expert | `yodlee.agent.js` | Personal Financial Management (PFM) metrics |
| Brex Expert | `brex.agent.js` | Corporate cards, expense management |

### Healthcare & MedTech (5 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| FHIR R4 Expert | `fhir.agent.js` | SMART on FHIR OAuth2, Patient/Observation/Condition, bulk export, US Core IG |
| HL7 v2 Expert | `hl7.agent.js` | Pipe-delimited messages, MLLP transport, ACK handling, HL7→FHIR transform |
| Medplum Expert | `medplum.agent.js` | FHIR BaaS SDK, Bots serverless, Subscriptions, Task workflows, Questionnaires |
| Epic Interconnect Expert | `epic_mychart.agent.js` | MyChart patient data integration |
| Cerner Expert | `cerner.agent.js` | EHR integration, patient data, clinical workflows |

### Gaming & GameFi (9 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Unity SDK Expert | `unity_sdk.agent.js` | UGS Auth/CloudSave/Economy/Relay, Netcode NetworkVariable + RPC |
| Azure PlayFab Expert | `playfab.agent.js` | CloudScript V8, Economy catalog, Leaderboards, Matchmaking, A/B Experiments |
| Photon Fusion 2 Expert | `photon_fusion.agent.js` | NetworkRunner host/shared, NetworkObject spawning, lag compensation |
| Nakama Expert | `nakama.agent.js` | Device/social auth, match state opcodes, matchmaker tickets, TypeScript RPC |
| Steam API Expert | `steam_api.agent.js` | Web API, auth ticket + OpenID, Steamworks achievements/leaderboards |
| Immutable zkEVM Expert | `immutable_zkevm.agent.js` | Passport wallet OAuth2, gas-free NFT minting, orderbook |
| Agora Expert | `agora.agent.js` | AccessToken2, in-game voice, Spatial Audio 3D, Cloud Recording, RTMP push |
| Epic Online Services Expert | `epic_online_services.agent.js` | EOS Connect Auth, matchmaking lobbies |
| Roblox Cloud Expert | `roblox.agent.js` | Server-to-server messaging, datastores |

### E-Commerce & Retail (8 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| WooCommerce Expert | `woocommerce.agent.js` | REST API v3, variable products, webhook HMAC, PHP plugin hooks |
| Amazon SP-API Expert | `amazon_sp_api.agent.js` | LWA OAuth2 + SigV4, Inventory 3-step publish, Orders, async Reports |
| EasyPost Expert | `easypost.agent.js` | Address verify, rate shopping, SmartRate percentiles, return labels, webhooks |
| Klarna Expert | `klarna.agent.js` | Checkout v3 hosted snippet, Payments JS SDK session→authorize→capture |
| BigCommerce Expert | `bigcommerce.agent.js` | V3 REST, GraphQL Storefront, Catalyst Next.js headless, webhook HMAC |
| eBay Expert | `ebay.agent.js` | User+app OAuth2, Inventory 3-step, Promoted Listings CPS, Notification subscriptions |
| Magento Expert | `magento.agent.js` | Adobe Commerce (Magento) REST/GraphQL |
| Shopify Hydrogen Expert | `shopify_hydrogen.agent.js` | Shopify Headless/Hydrogen Storefront API |

### IoT & Embedded Systems (7 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| AWS IoT Core Expert | `aws_iot.agent.js` | X.509 mutual TLS MQTT, Device Shadow, Rules Engine, Greengrass v2, OTA Jobs |
| MQTT Expert | `mqtt.agent.js` | MQTT v5 QoS 0/1/2, LWT, retained messages, shared subscriptions, Mosquitto TLS |
| InfluxDB Expert | `influxdb.agent.js` | v3 IOx SQL + Flux, Line Protocol, Telegraf MQTT consumer, Grafana alerts |
| Home Assistant Expert | `home_assistant.agent.js` | REST/WebSocket state + service calls, YAML automations, HACS, Lovelace |
| Raspberry Pi Expert | `raspberry_pi.agent.js` | gpiozero GPIO, I2C sensors, picamera2 MJPEG stream, systemd, edge-to-cloud |
| Tuya IoT Expert | `tuya.agent.js` | Developer Cloud API |
| Balena Expert | `balena.agent.js` | Edge container fleet deployment |

### Real Estate & PropTech (7 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Zillow Expert | `zillow.agent.js` | Bridge Interactive MLS, Zestimate AVM, Walk Score, GreatSchools, mortgage formula |
| Buildium Expert | `buildium.agent.js` | Property/unit/lease/tenant CRUD, rent charges + GL accounting, maintenance |
| Procore Expert | `procore.agent.js` | Construction RFIs, Submittals, Daily Logs, Budget/change orders, Punch List |
| Guesty Expert | `guesty.agent.js` | STR channel manager, calendar blocking, dynamic pricing, automated messages |
| ATTOM Expert | `attom.agent.js` | Property AVM + FSD confidence, sale comps (CMA), hazard risk flood/wildfire/EQ |
| CoStar CRE Expert | `costar.agent.js` | Commercial Real Estate analytics |
| Yardi Expert | `yardi.agent.js` | Yardi Voyager APIs |

### EdTech & Education (6 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Canvas LMS Expert | `canvas_lms.agent.js` | PKCE OAuth2, courses/assignments, grade passback, Module sequencing, LTI 1.3 AGS |
| Google Classroom Expert | `google_classroom.agent.js` | Scoped OAuth2, Coursework ASSIGNMENT/MCQ, submission grading, Pub/Sub |
| Zoom SDK Expert | `zoom_sdk.agent.js` | Server-to-Server OAuth, Meeting+Video SDK, webinars, cloud recordings, HMAC |
| D2L Brightspace Expert | `brightspace.agent.js` | LE/LP API versioning, GradeBook, SCORM upload+tracking, BDP analytics |
| Moodle Expert | `moodle.agent.js` | Batch course creation, SIS enrollment |
| Blackboard Expert | `blackboard.agent.js` | Gradebook manipulation, forum scraping |

### Legal & LegalTech (4 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| DocuSign Expert | `docusign.agent.js` | JWT RSA auth, envelope tab positioning, embedded signing, bulk send, HMAC webhooks |
| Clio Expert | `clio.agent.js` | Matter/Contact/TimeEntry CRUD, invoice lifecycle, document upload, HMAC |
| Ironclad Expert | `ironclad.agent.js` | Contract Lifecycle Management API |
| Everlaw Expert | `everlaw.agent.js` | Cloud eDiscovery, document clustering |

### Media & Entertainment (6 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Spotify Expert | `spotify.agent.js` | PKCE OAuth2, Web Playback SDK, recommendations, playlist CRUD, queue control |
| YouTube Expert | `youtube.agent.js` | Data API v3 search/upload, Analytics, Live Streaming broadcast+transition |
| Twitch Expert | `twitch.agent.js` | Helix streams/clips, EventSub HMAC, Channel Points, Predictions & Polls |
| Discord Expert | `discord.agent.js` | Discord.js v14 slash commands, EmbedBuilder, buttons/modals, role management |
| Mux Expert | `mux.agent.js` | Automated VOD transcoding to HLS |
| Frame.io Expert | `frame_io.agent.js` | Video collaboration, asset uploading |

### HR & Workforce (5 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| BambooHR Expert | `bamboohr.agent.js` | Employee CRUD, time-off requests, custom reports, ATS pipeline, field webhooks |
| Greenhouse ATS Expert | `greenhouse.agent.js` | Candidate pipeline, scorecard, offer lifecycle, Job Board API, HMAC webhooks |
| Rippling Expert | `rippling.agent.js` | SCIM 2.0 provisioning, lifecycle webhooks, payroll events, MDM device management |
| Workday Expert | `workday.agent.js` | HCM integration, org chart traversal |
| Lattice Expert | `lattice.agent.js` | Lattice Platform REST APIs |

### Cybersecurity & Threat Intel (8 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| VirusTotal Expert | `virustotal.agent.js` | File/URL/IP scan, YARA Livehunt, sandbox MITRE ATT&CK, IOC pivot graph |
| Shodan Expert | `shodan.agent.js` | Host lookup (ports/banners/CVEs/SSL), search syntax, continuous monitoring alerts |
| CrowdStrike Falcon Expert | `crowdstrike.agent.js` | OAuth2 Detections API, RTR remote commands, host containment, custom IOC prevent |
| Splunk Expert | `splunk.agent.js` | SPL queries, HEC log ingestion, saved search cron alerts, KV Store, SOAR trigger |
| Have I Been Pwned Expert | `hibp.agent.js` | Email breach lookup, k-anonymity Pwned Passwords SHA-1 prefix, domain monitoring |
| PentAGI Expert | `pentagi.agent.js` | Autonomous security testing |
| Tenable Expert | `tenable.agent.js` | Nessus scan initialization |
| Auth0 Expert | `auth0.agent.js` | Enterprise CIAM, SAML provider hook integrations |

### Marketing & Analytics (6 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| HubSpot CRM Expert | `hubspot.agent.js` | CRM contacts/deals/pipeline, custom properties, engagement timeline, HMAC webhooks |
| Klaviyo Expert | `klaviyo.agent.js` | Revision-header API, profile upsert, ecommerce Flows (abandoned cart/winback), SMS |
| Segment CDP Expert | `segment.agent.js` | Identify/Track/Page/Group, 300+ destinations, Profiles API, Protocols validation |
| Mixpanel Expert | `mixpanel.agent.js` | Event $insert_id deduplication, People profiles $set/$add, funnel/cohort, JQL |
| Marketo Expert | `marketo.agent.js` | Adobe Marketo Engage REST API |
| Iterable Expert | `iterable.agent.js` | Iterable Platform APIs |

### GitOps & Advanced CI/CD (4 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| GitLab CI Expert | `gitlab_ci.agent.js` | .gitlab-ci.yml pipelines, DAGs, Runners |
| Jenkins Expert | `jenkins.agent.js` | Declarative pipelines, Groovy libs, Node config |
| ArgoCD Expert | `argocd.agent.js` | App CRDs, ApplicationSets, declarative K8s sync |
| FluxCD Expert | `fluxcd.agent.js` | Flux v2, GitRepository, Image Update Auto |

### Python AI & Data Apps (4 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Streamlit Expert | `streamlit.agent.js` | Rapid data apps, st.session_state, rendering |
| Gradio Expert | `gradio.agent.js` | ML UI inference wrappers, gr.Blocks |
| Scikit-Learn Expert | `scikit_learn.agent.js` | Pipelines, GridSearchCV, feature scaling |
| XGBoost Expert | `xgboost.agent.js` | Gradient boosting trees, DMatrix, hyperparams |

### Enterprise JVM & Concurrency (4 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Quarkus Expert | `quarkus.agent.js` | Native AOT builds, Panache ORM, Mutiny |
| Micronaut Expert | `micronaut.agent.js` | AOT dependency injection, Serverless Java |
| Vert.x Expert | `vert_x.agent.js` | Polyglot reactive event loops, EventBus |
| Akka Expert | `akka.agent.js` | Actor Model, Cluster Sharding, Apache Pekko |

### OSS Infrastructure & Platform (4 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Keycloak Expert | `keycloak.agent.js` | IAM Realms, SAML/OIDC federations, SPI modules |
| Sentry Expert | `sentry.agent.js` | Observability, Distributed Tracing, source maps |
| PostHog Expert | `posthog.agent.js` | Product Analytics, Feature Flags, Session Replays |
| Metabase Expert | `metabase.agent.js` | BI Dashboards, SQL questions, JWT embedding |

### Game Engines & Web Graphics (4 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Godot Expert | `godot.agent.js` | Godot 4.x, GDScript syntax, Scene Trees |
| Bevy Expert | `bevy.agent.js` | Bevy Engine, Rust ECS, App states |
| Phaser Expert | `phaser.agent.js` | Phaser 3 framework, Arcade physics, scaling |
| WebGPU Expert | `webgpu.agent.js` | WebGPU API, WGSL context, Compute Shaders |

### Serverless & Cloud Emulation (4 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| SST Expert | `sst.agent.js` | Serverless Stack Ion, Pulumi, OpenNext |
| Serverless Fw Expert | `serverless_fw.agent.js` | serverless.yml specs, plugin ecosystem |
| LocalStack Expert | `localstack.agent.js` | Docker emulator, boto3 overrides, awslocal |
| AWS SAM Expert | `aws_sam.agent.js` | Serverless Application Model, AWS transform |

### Web3 & Blockchain (4 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| Solidity Expert | `solidity.agent.js` | EVM Smart Contracts, ERC-20/721, OpenZeppelin |
| Hardhat Expert | `hardhat.agent.js` | Compilation, deployment scripts, chai matchers |
| Ethers.js Expert | `ethers.agent.js` | ethers v6, JSON-RPC providers, wallet signing |
| Anchor Expert | `anchor.agent.js` | Solana Anchor framework, PDA derivation, CPI |

### Data Engineering & Big Data (4 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| dbt Expert | `dbt.agent.js` | Data Build Tool models, Jinja macros, materializations |
| Airflow Expert | `airflow.agent.js` | Apache Airflow DAGs, TaskFlow, XComs, Operators |
| Snowflake Expert | `snowflake.agent.js` | Snowpark, virtual warehouses, micro-partitions |
| Databricks Expert | `databricks.agent.js` | Delta Lake, PySpark, Spark SQL, Unity Catalog |

### LLMOps & Local AI (4 agents)

| Agent | File | Specialization |
|-------|------|----------------|
| vLLM Expert | `vllm.agent.js` | PagedAttention, continuous batching, tensor-parallel |
| Ollama Expert | `ollama.agent.js` | Local LLM, Modelfile creation, REST API management |

| GGUF Expert | `gguf.agent.js` | llama.cpp quantization, formatting, loRA merge |

---

## 🌐 Open Source Specialists (116 Agents)

> Created in Phase 11, these specialist agents cover the topmost popular open source repositories, frameworks, ORMs, and APIs.

| Category | Agents Included |
|----------|-----------------|
| Frontend Frameworks | React, Vue, Angular, Svelte, Next.js, Nuxt, Remix, Vite, Astro |
| Backend Frameworks | Express, NestJS, FastAPI, Django, Flask, Hono |
| Mobile Frameworks | React Native, Flutter |
| Enterprise Backend | Spring Boot, Laravel, Rails, .NET Core |
| Cloud IaC & Config | AWS CDK, Docker, Kubernetes, Helm, Terraform, GitHub Actions, Ansible |
| Database & ORM | PostgreSQL, TypeORM, SQLAlchemy, Prisma, Drizzle, Supabase, Redis, MongoDB |
| Observability/Infra | Nginx, Prometheus |
| Languages | Rust, Go, Deno, Bun, Kotlin, Swift |
| AI / Data / API | TensorFlow, PyTorch, LangChain, LlamaIndex, Pandas, SciPy, GraphQL, Socket.IO, Passport |
| Testing & Tooling | Jest, Cypress, Playwright, Vitest, Tailwind, tRPC, Zod, shadcn, Turborepo, RxJS, Celery, Electron, Tauri |

---

## Core System Agents (Tiers 1–8)

These agents are **directly registered** in the `executeNode` dispatch map and are NOT routed via `CapabilityRouter`:

| Agent | Purpose |
|-------|---------|
| `siren` | Communication & notification routing |
| `sentinel` | Security monitoring & threat detection |
| `chaos` | Chaos engineering & resilience testing |
| `release` | Release management & versioning |
| `compliance` | Regulatory compliance checks |
| `economist` | Token usage & cost management |
| `codeReview` | Code quality & PR review |
| `architecture` | System design recommendations |
| `performance` | Performance profiling & optimization |
| `e2e` | End-to-end test generation |
| `database` | Database query & schema optimization |
| `analytics` | Usage analytics & reporting |
| `integration` | Third-party system integrations |
| `hiveMind` | Meta-agent: cross-agent coordination |
| `schema` | Knowledge graph maintenance |
| `debug` | Autonomous debugging & root cause |
| `surgeon` | Code self-modification & refactoring |
| `guardian` | Policy enforcement & safety gate |
| `surfer` | Live web browsing for unknown errors |

---

## The Sovereign Delivery Pipeline (Phase 9.0.0)

These agents orchestrate the zero-human-touch SDLC via OpenClaw skills and Argo Rollouts:

| Agent | File | Purpose |
|-------|------|---------|
| Core PR Reviewer | `review.agent.js` | Uses `review-pr` skill to scrutinize architectural drift and security on PRs |
| Staging Preparer | `prepare.agent.js` | Uses `prepare-pr` skill to spin up ephemeral namespaces and coordinate synthetic QA |
| Merge Gatekeeper | `merge.agent.js` | Uses `merge-pr` skill for deterministic, head-SHA pinned squash merges to main |
| SRE Deployment Sentinel | `release_ops.agent.js` | Monitors telemetry during canary rollouts; triggers autonomous ArgoCD rollbacks |
| Technical Librarian | `docs.agent.js` | Uses `mintlify` skill to manage semantic versioning, changelogs, and Mintlify docs |

---

## The Enterprise Genesis Kernel (Phase 10.0.0)

Capabilities designed for extreme-scale enterprise operations, outperforming reactive completion architectures:

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Ephemeral Synthesizer | `ephemeral_synthesizer.service.js` | Dynamically parses workspace ASTs to compile and mount transient context-aware agents. |
| Omni-Refactor Agent | `omni_refactor.agent.js` | Executes massive multi-file architectural overhauls simultaneously across bounded contexts. |
| Compliance Guard Agent | `compliance_guard.agent.js` | CISO firewall; screens outputs for SOC2, HIPAA, and DLP integrity before user presentation. |

---

## The Zero-Downtime Migration Engine (Phase 11.0.0)

Infrastructure dedicated to solving the hardest problem in distributed systems: safe state mutations.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Migration Architect | `migration_architect.agent.js` | Transforms destructive schema changes into safe, multi-phase Expand-and-Contract patterns. |
| DB Shadow Agent | `db_shadow.agent.js` | Clones staging DBs and duplicates live traffic to test schema safety before deployment. |
| Backfill Orchestrator | `backfill_orchestrator.service.js` | Background service for throttled, chunked data backfills preventing DB locks. |
| Schema Ledger | `schema_ledger.service.js` | Immutable ledger tracking schema versions to Git SHAs for safe algorithmic rollbacks. |

---

## The Omnipresent Threat Intel Matrix (Phase 12.0.0)

A self-healing immune system protecting the enterprise perimeter from zero-day exploits and supply chain attacks.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| CVE Sentinel | `cve_sentinel.agent.js` | Polls NVD and GitHub advisories; triggers DEFCON 1 alerts for critical dependency vulnerabilities. |
| Wasm Sandbox Agent | `wasm_sandbox.agent.js` | Isolates 3rd-party `postinstall` scripts inside WebAssembly; vetos malicious data exfiltration. |
| Hotfix Orchestrator | `hotfix_orchestrator.service.js` | Bypasses human SDLC to instantly branch, patch, test, and PR critical dependency updates autonomously. |

---

## The Omnilayer Integration Nexus (Phase 13.0.0)

Deep ecosystem integration powered by the Model Context Protocol (MCP), unlocking infinite DevTool connectivity natively.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| MCP Gateway | `mcp_gateway.service.js` | Dynamically discovers and mounts external MCP servers, injecting Nano-Agents into the global swarm. |
| Jira Architect | `jira_architect.agent.js` | Uses Jira/Linear MCP to translate Epics into AST-mapped code scaffolding autonomously. |
| Figma Compiler | `figma_compiler.agent.js` | Uses Figma MCP to extract AutoLayout geometry and compile semantic React/Tailwind components natively. |
| Telemetry Correlator | `datadog_sentry_correlator.agent.js` | Uses APM MCPs to map cloud runtime crashes directly to local AST lines, proposing auto-remediation. |

---

## The Multimodal Synthetic User & QA Matrix (Phase 14.0.0)

End-to-End visual and behavioral testing agents replacing legacy manual UAT and declarative E2E scripts.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Vision QA Agent | `vision_qa.agent.js` | Multimodal agent for pixel-perfect visual regression analysis against Figma specs. |
| Synthetic User | `synthetic_user.agent.js` | Behavioral chaos monkey that dynamically navigates the DOM to crash client-state. |
| A11y Enforcer | `a11y_enforcer.agent.js` | Audits the AOM for strict WCAG compliance and keyboard navigation mapping. |
| Playwright Compiler | `playwright_compiler.service.js` | Compiles abstract chaos sequences into permanent, committable Playwright TS specs. |

---

## The Global Governance & Compliance Engine (Phase 15.0.0)

Automated legal and regulatory auditing ensuring enterprise liability protection across GCP infrastructures.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Compliance Gateway | `compliance_gateway.service.js` | Analyzes AST jurisdiction to mandate industry-specific legal audits before merge. |
| HIPAA/FHIR Auditor | `hipaa_fhir_auditor.agent.js` | Enforces PHI masking, KMS encryption, and HL7 FHIR conformance. |
| PCI-DSS Auditor | `fintech_pci_auditor.agent.js` | Vetoes raw PAN storage; enforces Stripe tokenization and GCP CMEK for ledgers. |
| GDPR Sovereign | `gdpr_privacy_auditor.agent.js` | Mandates Right to Erasure logic and strict GCP data-residency boundaries for PII. |

---

## The Sovereign Cloud Automata (Phase 16.0.0)

End-to-End Google Cloud infrastructure orchestration for 99.999% global SLA and BeyondCorp Zero-Trust parameters.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| GCP IaC Architect | `gcp_iac_architect.agent.js` | Generates declarative Terraform establishing GKE Autopilot clusters bounded exclusively within VPC Service Control perimeters. |
| Spanner Orchestrator | `cloud_spanner_orchestrator.agent.js` | Administers multi-region Cloud Spanner schemas with TrueTime scaling for true global consistency without sharding. |
| Zero-Trust Sentinel | `beyondcorp_zero_trust.agent.js` | Implements Google Identity-Aware Proxy (IAP) context-aware edge security, replacing VPN perimeters. |
| Anthos GitOps | `anthos_gitops.service.js` | Enforces global fleet management via Google Anthos Config Management declarative deployments. |

---

## The Sovereign Resilience & Confidential Compute Core (Phase 17.0.0)

End-to-End GCP hardware resilience enforcing in-use encryption, immutable WORM backups, and Active-Active DR.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Confidential Compute | `confidential_compute.agent.js` | Modifies Terraform to provision AMD SEV/Intel TDX nodes, ensuring data-in-use memory encryption. |
| Multi-Region DR | `multi_region_dr.agent.js` | Orchestrates Global Load Balancer failover policies for near-zero RTO/RPO across continents. |
| Vault Guardian | `ransomware_vault_guardian.agent.js` | Enforces WORM (Write-Once-Read-Many) retention locks on GCP backups preventing insider ransom. |
| KMS Rotation Enforcer | `kms_rotation_enforcer.service.js` | Manages background zero-downtime rotation of CMEK cryptographic keys across Spanner databases. |

---

## The Cryptographic Supply Chain & Forensic Audit Engine (Phase 18.0.0)

End-to-End Google Cloud infrastructure cryptography, SLSA Level 4 enforcement, and autonomous SOC remediation.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| SLSA Build Enforcer | `slsa_build_enforcer.agent.js` | Modifies GKE to mandate GCP Binary Authorization, blocking any container lacking cryptographic build provenance signatures. |
| Forensic Telemetry | `forensic_telemetry_auditor.agent.js` | Uses Cloud DLP to autonomously redact PII in transit while mathematically preserving immutable Access Audit logs in BigQuery. |
| JIT Access Broker | `jit_access_broker.service.js` | Banishes standing GCP IAM privileges, issuing conditional, ephemeral Just-In-Time role tokens based on PagerDuty/Jira forensics. |
| SCC Incident Responder | `sovereign_incident_responder.agent.js` | Acts as a Level 3 SOC Analyst, ingesting Security Command Center alerts and autonomously merging Terraform remediations inside 60 seconds. |

---

## The Anthropic Data Warehouse & AI Analytics Core (Phase 19.0.0)

End-to-End Google Cloud data intelligence, streaming ETL, and Vertex AI predictive modeling.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| BigQuery Architect | `bigquery_architect.agent.js` | Designs denormalized OLAP lakehouses with Column-Level GCP Security Policy Tags. |
| Vertex AI Modeler | `vertex_ai_modeler.agent.js` | Analyzes BigQuery datasets to orchestrate, train, and deploy predictive AutoML inference endpoints. |
| Streaming Ingestion | `streaming_ingestion.service.js` | Replaces batch ETL with real-time Pub/Sub to Dataflow pipelines for Spanner mutation synchronization. |
| Generative BI Analyst | `generative_bi_analyst.agent.js` | Translates end-user natural language into BigQuery ML SQL, synthesizing visual analytics autonomously. |

---

## The Planetary Edge & Sovereign Distributed Cloud (Phase 20.0.0)

End-to-End Google Cloud multi-environment orchestration spanning Edge CDN, Anthos Intranets, and Cognitive SRE optimizations.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Edge Compute Architect | `edge_compute_architect.agent.js` | Configures Cloud CDN, Media CDN, and Cloud Armor WAF perimeters globally, caching data at the Google Edge POP. |
| Distributed Cloud Orchestrator | `distributed_cloud_orchestrator.agent.js` | Provisions Google Distributed Cloud (Anthos Bare Metal) for on-premise, air-gapped Military/Healthcare data-residency isolation. |
| Serverless V8 Mutator | `serverless_v8_mutator.agent.js` | Analyzes bursty traffic and dynamically upgrades specific GKE workloads natively to Google Cloud Run serverless execution. |
| Cognitive SRE Navigator | `cognitive_sre_navigator.agent.js` | Maps GCP Cloud Trace spans directly to local code logic, autonomously rewriting algorithms to lower latency and minimize GCP billing. |

---

## The Gemini Multimodal Workspace & Copilot Integration (Phase 21.0.0)

End-to-End Google Workspace, local Gemini CLI, and intelligent Cloud Code integration.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Gemini CLI Copilot | `gemini_cli_copilot.agent.js` | Ingests `stdout`/`stderr` from the local terminal daemon, executing autonomous `kubectl` and `gcloud` repairs. |
| Workspace Intelligence | `workspace_intelligence_router.agent.js` | Parses Google Drive PRDs, Google Docs, and Gmail threads to generate code directly from qualitative Enterprise context. |
| Cloud Code Companion | `cloud_code_companion.service.js` | Bridges the autonomous swarm directly into VS Code/IntelliJ via Google Cloud Code for local Minikube emulation and remote debugging. |
| Multimodal Synthesizer | `multimodal_context_synthesizer.agent.js` | Uses Gemini 1.5 Pro Vision to translate whiteboard photos and Lucidchart JPEGs into functional GCP Terraform and gRPC schemas. |

---

## The Quantum AI Gateway & API Monetization Engine (Phase 22.0.0)

Transforms the internal Alti.Code.Studio ecosystem into a public, revenue-generating B2B SaaS platform using Apigee and Google API Gateway.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Apigee Monetization Architect | `apigee_monetization_architect.agent.js` | Generates Apigee X proxy bundles and strict OAuth 2.0 flows, tying API consumption directly to Stripe billing plans. |
| AI Gateway Router | `ai_gateway_router.agent.js` | Routes and load-balances traffic to Vertex AI predictive endpoints, caching semantic prompts at the edge to reduce token costs. |
| GraphQL Federation Builder | `graphql_federation_builder.agent.js` | Deploys an Apollo GraphQL supergraph, mathematically stitching disjointed microservice Swagger/OpenAPI specs into a single declarative UI query point. |

---

## Seamless Coworker Handoff & Omnipresent Context (Phase 23.0.0)

Evolves the Swarm from an on-demand tool into a true, asynchronous, collaborative pair-programming peer with the human engineering team.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Coworker Handoff Orchestrator | `coworker_handoff_orchestrator.agent.js` | Serializes human IDE state and unstaged diffs into a cognitive object, seamlessly transferring work between carbon developers and the silicon swarm. |
| Multi-Agent Consensus Engine | `multi_agent_consensus_engine.agent.js` | Orchestrates rigorous mathematical debates between specialized agents to synthesize flawless Architectural Decision Records (ADRs). |
| Omnipresent Context Mesh | `omnipresent_context_mesh.service.js` | Maintains a globally shared Redis graph of the active problem space, preventing the swarm from executing logic that conflicts with human developers in real-time. |
| Human-in-Loop Escalator | `human_in_loop_escalator.agent.js` | Halts statistically risky autonomous deployments, identifies the specific code owner via `git blame`, and dynamically escalates the context to their corporate Slack/Teams. |

---

## The Omniscient Incident Commander & RCA Synthesizer (Phase 24.0.0)

Evolves the platform into an autonomous Google Site Reliability Engineer (SRE), managing enterprise P0 incidents, drafting post-mortems, and injecting chaos to prove resilience.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Incident Commander | `incident_commander.agent.js` | Orchestrates SEV-1 response triggered by Google Cloud Monitoring, spinning up War Rooms and brokering JIT GCP production access. |
| Root Cause Synthesizer | `root_cause_synthesizer.agent.js` | Correlates GCP Trace logs with `git bisect` output to algorithmically identify the failure cause and draft the official SRE Post-Mortem document. |
| Precision Chaos Monkey | `chaos_engineering_chaos_monkey.agent.js` | Continuously executes targeted fault injections (terminating GKE pods, dropping Spanner packets) in Staging to scientifically validate Multi-Region DR architectures. |
| Blameless Culture Enforcer | `blameless_culture_enforcer.agent.js` | Monitors War Room communication, coaching engineers away from accusatory language and sanitizing RCAs to ensure psychological safety and systemic focus. |

---

## The Cognitive FinOps & Cloud Cost Eradicator (Phase 25.0.0)

Transforms the Swarm into a ruthless, algorithmic CFO that actively optimizes GCP billing, Spot VM arbitrage, and total carbon footprint.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| FinOps Billing Analyzer | `finops_billing_analyzer.agent.js` | Automatically traces Google Cloud Billing spikes back to the specific Git commit and microservice responsible for the regression. |
| Spot Instance Arbitrage | `spot_instance_arbitrage.agent.js` | Continuously monitors global GCP Spot pricing, dynamically migrating stateless workloads to underutilized regions to cut compute bills by 90%. |
| Algorithmic Efficiency Refactorer | `algorithmic_efficiency_refactorer.agent.js` | Reads Google Cloud Profiler data and autonomously rewrites inefficient O(N^2) loops into optimized code, submitting PRs with exact USD cost savings attached. |
| Carbon Footprint Optimizer | `carbon_footprint_optimizer.agent.js` | Connects to the GCP Carbon Footprint API to algorithmically route batch ML training and massive data pipelines to regions currently powered by solar/hydro grids. |

---

## The Global ERP Integration & Legacy Migration Fabric (Phase 26.0.0)

Enables Alti.Code.Studio to penetrate the deepest layers of Fortune 500 tech debt, actively modernizing COBOL mainframes and synchronizing data across SAP, Salesforce, and Workday.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| SAP HANA Financials Bridge | `sap_hana_financials_bridge.agent.js` | Replaces fragile ETL pipelines by autonomously mapping high-throughput GCP microservice transactions directly into SAP ERP/HANA General Ledgers via OData/RFC. |
| Salesforce Apex Architect | `salesforce_apex_architect.agent.js` | Algorithmically writes Bulkified Apex Triggers to maintain absolute, real-time bi-directional parity between BigQuery data warehouses and the Salesforce CRM. |
| Workday HCM Synchronizer | `workday_hcm_synchronizer.agent.js` | Intercepts HR lifecycle events (hires, firings, transfers) and instantly alters or revokes cryptographic Google Cloud IAM / SSH credentials across the global infrastructure. |
| Legacy COBOL Modernizer | `legacy_cobol_modernizer.agent.js` | Parses legacy IBM Mainframe architecture, mathematically extracts the core business logic, and autonomously transpiles it into stateless, cloud-native Go/Node GKE microservices. |

---

## The Industry-Specific ERP & Core Systems Expansion (Phase 27.0.0)

Pushes the Alti.Code.Studio platform directly into highly-regulated verticals by autonomously mapping cloud logic to Oracle NetSuite, Guidewire InsuranceSuite, Epic FHIR APIs, and Plaid Open Banking.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| NetSuite ERP Orchestrator | `netsuite_erp_orchestrator.agent.js` | Autonomously maps complex E-Commerce and REST microservice transactions natively into Oracle NetSuite's heavy SuiteTalk SOAP and RESTlet ecosystem. |
| Guidewire Insurance Bridge | `guidewire_insurance_bridge.agent.js` | Ingests huge streams of Property & Casualty IoT telemetry (connected vehicles/homes) to algorithmically trigger FNOL claims inside Guidewire ClaimCenter APIs. |
| Epic FHIR Health Router | `epic_fhir_health_router.agent.js` | Maps clinical edge data and HIPAA-sanitized physiological payloads directly into the global Epic Systems Electronic Health Record via strict HL7 FHIR constraints. |
| Plaid Open Banking Sync | `plaid_open_banking_sync.agent.js` | Acts as a high-frequency parsing engine that syncs thousands of multi-institution banking transactions via Plaid to perfectly reconcile local Postgres Financial ledgers. |

---

## The Autonomous Semantic RPA & GUI Singularity (Phase 28.0.0)

Eradicates the boundary between APIs and human UI. Equips the Swarm with "eyes" and hands" to autonomously navigate native desktop apps, complex DOMs, and legacy Citrix streams.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Semantic GUI Extractor | `semantic_gui_extractor.agent.js` | Hooks directly into macOS/Windows OS accessibility APIs to map complex desktop graphics (like trading terminals) into structured, queryable semantic JSON graphs. |
| DOM Puppeteer | `playwright_dom_puppeteer.agent.js` | Autonomously launches headless browsers (Playwright/Puppeteer) to navigate, authenticate, and extract data from undocumented enterprise web portals without pre-written scripts. |
| Computer Vision OCR Arbiter | `computer_vision_ocr_arbiter.agent.js` | Ingests live video pixel streams of legacy Citrix, RDP, or AS/400 emulator sessions, using Multimodal OCR to decode screens that lack an underlying semantic API. |
| OS-Level Macro Orchestrator | `os_level_macro_orchestrator.agent.js` | Translates semantic and vision-based coordinates into human-simulated, physical OS-level mouse movements and keyboard strokes to execute physical GUI tasks. |

---

## The Autonomous Edge & IoT Firmware Fabric (Phase 29.0.0)

Pushes the Swarm's intelligence out of the Data Center and onto bare-metal microcontrollers. Autonomously writes, optimizes, and deploys C/Rust firmware to physical IoT and Robotics edge fleets.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Embedded C/Rust Transpiler | `embedded_c_rust_transpiler.agent.js` | Transpiles high-level AI cloud logic into highly-optimized, zero-allocation C99 or `#![no_std]` Rust designed for memory-constrained ARM Cortex-M and ESP32 chips. |
| RTOS Kernel Optimizer | `rtos_kernel_optimizer.agent.js` | Algorithmically proves FreeRTOS/Zephyr latency bounds, eliminating priority inversion deadlocks and stack overflows for hard real-time execution in robotics/automotive systems. |
| LoRaWAN Telemetry Decoder | `lorawan_telemetry_decoder.agent.js` | Ingests low-bandwidth encrypted payloads from distant agricultural/mining gateways, performing complex bitwise reverse-engineering to expand hex bytes into JSON telemetry. |
| Over-The-Air (OTA) Deployer | `over_the_air_ota_deployer.agent.js` | Orchestrates mathematically secure, cryptographically signed binary rollouts across huge physical fleets, leveraging A/B partition logic to instantly rollback failing logic. |

---

## The Web3 & DeFi Autonomous Nexus (Phase 30.0.0)

Brings the Swarm into the trustless blockchain ecosystem. Autonomously generates Solidity smart contracts, performs mathematical safety audits, executes high-frequency MEV arbitrage on DEXs, and bridges Web3 identity to Web2 Enterprise IAM.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Solidity EVM Architect | `solidity_evm_architect.agent.js` | Turns natural language business rules into production-ready, highly gas-optimized Solidity smart contracts, managing the Hardhat/Foundry compile and deploy cycle to Ethereum/L2s. |
| Smart Contract Formal Verifier | `smart_contract_formal_verifier.agent.js` | Employs mathematical formal verification (Halmos/Certora) and symbolic execution to detect critical CVEs (Reentrancy, Overflows, Oracle Manipulation) before bytecode deployment. |
| DeFi Arbitrage Orchestrator | `defi_arbitrage_orchestrator.agent.js` | High-frequency MEV engine monitoring multi-DEX mempools to calculate and execute complex multi-hop flash-loan arbitrage via Flashbots, generating autonomous revenue for the Swarm. |
| Decentralized Identity Bridge | `decentralized_identity_bridge.agent.js` | Synchronizes the Web2/Web3 divide by allowing users to authenticate to deep corporate tools via MetaMask/EIP-1193, dynamically minting bounded GCP IAM roles based on NFT/Governance ownership. |

---

## The Autonomous Manufacturing & Industrial Systems Nexus (Phase 31.0.0)

Bridges the IT (Information Technology) and OT (Operational Technology) divide. The Swarm now connects engineering CAD design, cloud business ledgers, global supply chains, and literal factory machine execution.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Siemens Teamcenter PLM Bridge | `siemens_teamcenter_plm_bridge.agent.js` | Synchronizes the physics of design with the economics of the ledger, translating raw 3D CAD engineering eBOMs into structured S/4HANA mBOMs, triggering global procurement instantly. |
| SCADA Industrial Control Router | `scada_industrial_control_router.agent.js` | Ingests high-frequency OPC-UA/Modbus metrics from physical PLC robot arms. Executes statistical failure prediction (vibration/thermal) and autonomously triggers IBM Maximo preventative work orders. |
| SAP IBP Supply Chain Optimizer | `sap_ibp_supply_chain_optimizer.agent.js` | When factory output drops due to a predicted machine failure, this agent recalculates the macro global supply network within SAP IBP, autonomously re-routing container freight via Maersk APIs to prevent delays. |
| Rockwell MES Orchestrator | `rockwell_mes_orchestrator.agent.js` | Converts high-level Cloud ERP sales orders into specific, machine-readable shop-floor recipes executing inside Rockwell FactoryTalk and Ignition, providing granular traceability telemetry. |

---

## The Enterprise Legacy System & Industry SDK Synthesizer (Phase 32.0.0)

Provides AI superpowers strictly to the software engineers responsible for maintaining the world's most critical, highly-regulated, and proprietary legacy infrastructure.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Automotive AUTOSAR C++ Architect | `automotive_autosar_cpp_architect.agent.js` | Assists automotive engineers in writing highly deterministic, MISRA-compliant C++ code for classic/adaptive AUTOSAR, autonomously generating memory-safe CAN bus and UDS diagnostic protocol parsers. |
| Insurance Guidewire Gosu Generator | `insurance_guidewire_gosu_generator.agent.js` | A co-pilot for P&C developers. Deeply fluent in proprietary Gosu syntax, generating complex back-end classes, PCF UI files, and safely modifying hierarchical Guidewire Entity XML models. |
| Banking ISO 8583 & COBOL Refactor | `banking_iso8583_cobol_refactor.agent.js` | A Rosetta Stone for core banking engineers. Analyzes and refactors undocumented z/OS COBOL into modern Spring Boot Java, and generates bit-perfect ISO 8583 message layers for payment gateway integration. |
| Mortgage Encompass SDK Builder | `mortgage_encompass_sdk_builder.agent.js` | Helps mortgage engineers build complex C# .NET plugins for the ICE Encompass LOS API, automating Fannie Mae GSE rules and safely managing massive XML loan payloads within the SmartClient framework. |

---

## The Sovereign Defense & Aerospace Systems Integrator (Phase 33.0.0)

Providing deterministic AI co-pilots for the engineers building the world's most critical, zero-fail systems across aviation, defense robotics, and orbital space.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Aerospace DO-178C Avionics Certifier | `aerospace_do178c_avionics_certifier.agent.js` | Generates mathematically provable, dynamically-safe Ada and C++ flight control logic, complete with synthesized MC/DC testing vectors for FAA DO-178C DAL-A compliance. |
| Defense ROS2 Robotics Orchestrator | `defense_ros2_robotics_orchestrator.agent.js` | Writes advanced `rclcpp` and DDS middleware configs, bounding network QoS to ensure autonomous drone swarms maintain perfect synchronization even in EW-jammed environments. |
| Satellite C2 Telemetry Decoder | `satellite_c2_telemetry_decoder.agent.js` | Unpacks hyper-compressed binary CCSDS space packets from S-Band/X-Band downlinks into readable JSON, handling strict bit-alignment and cross-architecture endian swapping. |
| Tactical Data Link (Link 16) Parser | `tactical_datalink_link16_parser.agent.js` | Solves legacy military interoperability by algorithmically generating memory-safe C/C++ bit-masks to decode fixed-format Link 16 J-Series messages (e.g., J3.2 Air Track) into modern cloud structs. |

---

## The Quantum Computing & Applied Cryptography Integrator (Phase 34.0.0)

Provides the Swarm with native fluency in Quantum Mechanics, combinatorial optimization, lattice-based mathematics, and Fully Homomorphic Encryption (FHE).

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Quantum Qiskit Algorithm Synthesizer | `quantum_qiskit_algorithm_synthesizer.agent.js` | Generates mathematically optimized IBM Qiskit (Python) and Microsoft Q# algorithms for NISQ hardware, structuring VQE ansatz circuits to minimize physical decoherence depth. |
| Post-Quantum Cryptography Generator | `crypto_post_quantum_lattice_generator.agent.js` | Assists security engineers in writing C/Rust for NIST-standardized lattice cryptography (ML-KEM Kyber, ML-DSA Dilithium), implementing constant-time execution to prevent side-channel attacks. |
| D-Wave Quantum Annealer Optimizer | `quantum_annealing_dwave_optimizer.agent.js` | Formulates massive, NP-Hard combinatoric routing/logistics problems into Quadratic Unconstrained Binary Optimization (QUBO) equations, executing them on D-Wave Quantum Processing Units. |
| Fully Homomorphic Encryption Compiler| `homomorphic_encryption_fhe_compiler.agent.js` | Compiles raw mathematics into Microsoft SEAL or TFHE-rs circuits, mathematically analyzing noise budgets to enable absolute zero-trust computation (like Neural Networks) purely on ciphertext. |

---

## The Precision Medicine & Bioinformatics Geneticist (Phase 35.0.0)

Providing the Swarm with the deep computational biology capabilities required to assist geneticists in genomic sequencing, proteomics, and clinical interoperability.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Genomic Pipeline Orchestrator | `bioinformatics_genomic_pipeline_orchestrator.agent.js` | Autonomously writes robust Nextflow/Snakemake pipelines to process terabytes of NGS FASTQ DNA reads, configuring BWA and GATK for scalable cluster execution. |
| CRISPR-Cas9 Off-Target Predictor | `crispr_cas9_offtarget_predictor.agent.js` | Utilizes thermodynamic algorithms to rank potential CRISPR sgRNAs by editing efficiency and minimal off-target cleavage risk against the GRCh38 human reference genome. |
| Proteomics AlphaFold Modeler | `proteomics_alphafold_modeler.agent.js` | Orchestrates massive PyTorch GPU memory limits to run AlphaFold protein structure predictions, and automatically scripts molecular docking simulations for drug discovery. |
| Clinical HL7 FHIR Interoperability | `medical_hl7_fhir_interoperability.agent.js` | Acts as a Rosetta Stone for legacy healthcare data, converting Epic/Cerner HL7 v2 payloads and unstructured notes into modern FHIR JSON bundles for machine learning. |

---

## The Climate Modeling & Geospatial Meteorologist (Phase 36.0.0)

Providing the Swarm with deep computational models of the Earth itself, scaling from planetary climate simulation to precision agriculture.

| Agent/Service | File | Purpose |
|---------------|------|---------|
| Climate CESM Simulation Architect | `climate_cesm_simulation_architect.agent.js` | Autonomously configures massive Fortran Namelist inputs and MPI scheduling to run global ocean/atmosphere CESM climate scenarios across multi-petaflop supercomputers. |
| Geospatial Sentinel SAR Analyst | `geospatial_sentinel_sar_analyst.agent.js` | Constructs Python `xarray` and `rasterio` pipelines to analyze Synthetic Aperture Radar (SAR) imagery, penetrating clouds to calculate ground subsidence and massive logistical arrays. |
| ESG Carbon Ledger Auditor | `esg_carbon_ledger_auditor.agent.js` | Generates backend code to map corporate ERP logistics into Scope 1-3 CO2 emissions using API registries, creating mathematically irrefutable ESG compliance dashboards. |
| Precision Agriculture IoT Agronomist | `precision_agriculture_iot_agronomist.agent.js` | Fuses drone NDVI imagery with soil moisture IoT telemetry, parsing data to output ISO-XML variable-rate fertilizer prescriptions for autonomous tractors. |

---

## External Tool Agents

These agents wrap containerized AI tools and external services:

| Agent | Tool | Purpose |
|-------|------|---------|
| `browser` | BrowserUse | Autonomous web browser control |
| `crawl4ai` | Crawl4AI | Intelligent web crawling |
| `mcp` | MCP Client | Model Context Protocol server dispatch |
| `openInterpreter` | Open Interpreter | Code execution in sandboxed Python |
| `searxng` | SearXNG | Privacy-preserving web search |
| `tabby` | TabbyML | Self-hosted code completion |
| `dspy` | DSPy | Program-of-Thought LLM optimization |
| `geminiExt` | Gemini Extension | Extended Gemini capabilities via `gemini extensions list/install/invoke` |
| `qdrant` | Qdrant | Vector similarity search |
| `ollama` | Ollama | Local LLM inference |
| `observability` | OTEL | Distributed tracing collection |
| `voice` | LiveKit + ElevenLabs | Voice I/O agent |
| `litellm` | LiteLLM | Multi-provider LLM gateway |
| `temporal` | Temporal | Durable workflow orchestration |
| `langgraph` | LangGraph | Graph-based agent workflows |
| `mem0` | Mem0 | Long-term agent memory |
| `langfuse` | Langfuse | LLM observability & evals |
| `unstructured` | Unstructured.io | Document parsing & extraction |
| `promptfoo` | Promptfoo | Prompt testing & evaluation |
| `agent_s` | Agent S (Simular AI) | Autonomous physical GUI control via mouse/keyboard |
| `background-agents` | Open-Inspect | Hosted multiplayer sandbox agents via Cloudflare and Modal |
| `pentagi` | PentAGI (vxcontrol) | Autonomous Penetration Testing and Security Auditing via isolated containers |
| `fossflow` | FossFLOW (stan-smith) | Autonomous Isometric Architecture Designer and PWA graph editor |
| `openclawCore` | OpenClaw | Central orchestration bridge for 9 OpenClaw submodules (real ACP via acpx) |
| `flawd-bot` | OpenClaw Bot | Chaos engineering and operational automated testing bot |
| `trust` | OpenClaw Consensus | Decentralized trust evaluation and ranking bot |
| `casa` | OpenClaw IoT | Raw sensory telemetry edge-gateway processor |
| `contextEngineering` | Agent-Skills-for-Context-Engineering | SCRATCHPAD / COMPRESSOR / TOKEN-BUDGET patterns |
| `deepResearch` | deer-flow (ByteDance) | SuperAgent harness for deep research (LangGraph) |
| `pageIndexRAG` | PageIndex (VectifyAI) | Vectorless reasoning RAG, page-level citation |
| `nanoCodeAgent` | learn-claude-code | Minimal read/write/bash iterative code agent loop |

---

## 🖥 Gemini CLI Hub

Accessible at **`/gemini-studio`** in the frontend. Full GCP-native developer experience for the `gemini` CLI:

| Tab | Description |
|-----|-------------|
| **Terminal** | Live REPL with `gemini›` prompt, ↑/↓ history, SSE-streamed output |
| **Extensions Marketplace** | Searchable catalog of **200+** real extensions from geminicli.com |
| **Installed** | Lists, invokes, and manages installed extensions via `gemini extensions` |
| **Builder** | Scaffold a new extension (`GEMINI.md` + `index.js` + `package.json`) in-browser |

### Gemini CLI API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/gemini-cli/run` | Run a CLI command, return output |
| `POST` | `/api/gemini-cli/stream` | SSE stream stdout/stderr in real time |
| `GET` | `/api/gemini-cli/history` | Session command history |
| `DELETE` | `/api/gemini-cli/history` | Clear history |
| `GET` | `/api/gemini-extensions/list` | List installed extensions |
| `POST` | `/api/gemini-extensions/install` | Install from GitHub URL |
| `POST` | `/api/gemini-extensions/invoke` | Run extension with args |
| `DELETE` | `/api/gemini-extensions/uninstall/:name` | Remove extension |

---

## 📊 Agent Count Summary

| Category | Count |
|----------|-------|
| Core Orchestration (Tiers 1–8) | 19 |
| Engineering Specialists (Tiers 9–15) | 48 |
| Cloud Providers (Tier 16) | 21 |
| Programming Languages (Tiers 17–20) | 39 |
| **BioTech & Genomics** | 6 |
| **SpaceTech & Geospatial** | 6 |
| **GovTech & Public Sector** | 5 |
| **Live Events & Entertainment** | 5 |
| **Logistics & Supply Chain** | 5 |
| **Travel & Hospitality** | 5 |
| **Automotive & Smart Mobility** | 5 |
| **Agriculture & Farming** | 5 |
| **Energy & Climate** | 5 |
| **FinTech & Financial Markets** | 9 |
| **Healthcare & MedTech** | 5 |
| **Gaming & GameFi** | 9 |
| **E-Commerce & Retail** | 8 |
| **IoT & Embedded Systems** | 7 |
| **Real Estate & PropTech** | 7 |
| **EdTech & Education** | 6 |
| **Legal & LegalTech** | 4 |
| **Media & Entertainment** | 6 |
| **HR & Workforce** | 5 |
| **Cybersecurity & Threat Intel** | 8 |
| **Marketing & Analytics** | 6 |
| **Deep OS Integration (v7.6.0)** | 4 |
| **Open Source Specialists** | 116 |
| **Python AI & Data Apps** | 4 |
| **Enterprise JVM & Concurrency** | 4 |
| **OSS Infrastructure & Platform** | 4 |
| **GitOps & Advanced CI/CD** | 4 |
| **Game Engines & Web Graphics** | 4 |
| **Serverless & Cloud Emulation** | 4 |
| **Web3 & Blockchain** | 4 |
| **Data Engineering & Big Data** | 4 |
| **LLMOps & Local AI** | 4 |
| **Sovereign Delivery Pipeline** | 5 |
| **Enterprise Genesis Kernel** | 2 |
| **Zero-Downtime Migration Engine** | 2 |
| **Omnipresent Threat Intel Matrix** | 2 |
| **Omnilayer Integration Nexus** | 3 |
| **Multimodal Synthetic User Matrix** | 3 |
| **Global Governance & Compliance Engine** | 4 |
| **Sovereign Cloud Automata (GCP)** | 3 |
| **Sovereign Resilience & Confidential Compute** | 3 |
| **Cryptographic Supply Chain & Forensics** | 3 |
| **Anthropic Data Warehouse & AI Analytics** | 3 |
| **Planetary Edge & Distributed Cloud** | 4 |
| **Gemini Multimodal Workspace & Copilot** | 4 |
| **Quantum AI Gateway & API Monetization** | 3 |
| **Seamless Coworker Handoff & Context** | 4 |
| **Omniscient Incident Commander & RCA** | 4 |
| **Cognitive FinOps & Cost Eradicator** | 4 |
| **Global ERP & Legacy Migration** | 4 |
| **Industry Core Systems Expansion** | 4 |
| **Semantic RPA & GUI Singularity** | 4 |
| **Edge & IoT Firmware Fabric** | 4 |
| **Web3 & DeFi Autonomous Nexus** | 4 |
| **Manufacturing & Industrial Nexus** | 4 |
| **Enterprise Legacy System Synthesizer** | 4 |
| **Sovereign Defense & Aerospace Integrator** | 4 |
| **Quantum Computing & Cryptography Integrator** | 4 |
| **Precision Medicine & Bioinformatics** | 4 |
| **Climate Modeling & Geospatial Meteorologist** | 4 |
| External Tool Agents | 24 |
| **Total** | **~571** |

> Capability Router: **403 keyword routes** across all tiers and verticals
