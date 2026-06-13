# 🏢 Alti.Code.Studio — Industry Vertical Agent Reference

> Deep-dive technical reference for all 25 industry vertical agent groups.
> Each agent contains a production-grade `preamble` covering auth patterns, API endpoints, SDK usage, pagination, webhooks, and security best practices.

---

## How Industry Agents Are Routed

Industry agents are registered in `capability.router.js` as keyword-scored entries. Any query containing relevant domain keywords is automatically dispatched to the appropriate specialist.

```bash
# Example: dispatch to best agent via REST
POST /api/swarm/dispatch
{ "query": "How do I block a Guesty calendar for maintenance?" }
# → routes to: GuestyAgent

POST /api/swarm/dispatch
{ "query": "YARA hunting rule for CobaltStrike beacon" }
# → routes to: VirusTotalAgent

POST /api/swarm/dispatch
{ "query": "LTI 1.3 grade passback from Canvas LMS" }
# → routes to: CanvasLmsAgent
```

---

## 💰 FinTech & Financial Markets (9 Agents)

### Alpaca Expert — `alpaca.agent.js`
- **APIs**: Alpaca REST API, WebSocket Trade Streaming
- **Capabilities**: Paper/live trading accounts, fractional shares (notional orders), crypto 24/7, real-time trade events, order types (market/limit/stop/bracket)
- **Auth**: API Key + Secret in `APCA-API-KEY-ID` / `APCA-API-SECRET-KEY` headers
- **Env**: `ALPACA_API_KEY`, `ALPACA_API_SECRET`, `ALPACA_BASE_URL`

### Polygon.io Expert — `polygon_io.agent.js`
- **APIs**: REST Aggregates, WebSocket Stocks/Options/Forex/Crypto SIP feeds
- **Capabilities**: OHLCV bars (1min→1month), real-time trades/quotes, options chain + Greeks/IV, reference data, financial news
- **Auth**: API key as query param `?apiKey=` or header `Authorization: Bearer`
- **Env**: `POLYGON_API_KEY`

### Alpha Vantage Expert — `alpha_vantage.agent.js`
- **APIs**: REST API (free tier: 25 req/day, premium: 75–1,200 req/min)
- **Capabilities**: 50+ technical indicators (RSI, MACD, BBANDS, ATR, EMA, SMA), fundamental data (income statement, balance sheet, earnings), forex, crypto, commodities, news sentiment with ticker relevance scores
- **Auth**: API key query param `?apikey=`
- **Env**: `ALPHA_VANTAGE_API_KEY`

### Plaid Expert — `plaid.agent.js`
- **SDKs**: `plaid-node`
- **Capabilities**: Link flow (hosted OAuth), transaction sync cursor, ACH + routing numbers, payroll income for underwriting, investment accounts
- **Auth**: Client ID + Secret in request body; Access Token per connected account
- **Env**: `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV` (sandbox/development/production)

### Modern Treasury Expert — `modern_treasury.agent.js`
- **APIs**: REST API v1
- **Capabilities**: Payment orders (ACH/wire/RTP/SEPA), double-entry ledger (debit=credit enforcement), virtual accounts, counterparties, HMAC-SHA256 webhook verification
- **Auth**: HTTP Basic (`Organization-ID:API-Key`)
- **Env**: `MODERN_TREASURY_ORG_ID`, `MODERN_TREASURY_API_KEY`, `MODERN_TREASURY_WEBHOOK_SECRET`

### Stripe Treasury Expert — `stripe_treasury.agent.js`
- **SDKs**: `stripe` Node.js v12+
- **Capabilities**: Financial accounts per Connect account (InboundTransfer ACH, OutboundPayment, OutboundTransfer sweep), Issuing virtual/physical cards with spending_limits, real-time card auth webhook (<2s response required)
- **Note**: Requires Stripe approval for live mode (partner banks: Goldman Sachs, Evolve Bank)
- **Env**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### Persona KYC Expert — `persona_kyc.agent.js`
- **APIs**: REST API v1
- **Capabilities**: KYC inquiry (hosted/embedded), document + selfie verifications, AML watchlist (OFAC/PEP), webhook HMAC-SHA256 verify
- **Auth**: `Authorization: Bearer {PERSONA_API_KEY}`
- **Env**: `PERSONA_API_KEY`, `PERSONA_WEBHOOK_SECRET`

### Yodlee Expert — `yodlee.agent.js`
- **APIs**: Envestnet Yodlee FastLink API
- **Capabilities**: Hosted integration flow, account aggregation parsing, Personal Financial Management (PFM) metrics
- **Env**: `YODLEE_CLIENT_ID`, `YODLEE_SECRET`, `YODLEE_COBRAND_NAME`

### Brex Expert — `brex.agent.js`
- **APIs**: Brex API
- **Capabilities**: Corporate cards management, strict expense approvals, automated onboarding pipelines
- **Env**: `BREX_USER_TOKEN`

---

## 🏥 Healthcare & MedTech (5 Agents)

### FHIR R4 Expert — `fhir.agent.js`
- **Standard**: HL7 FHIR R4 + US Core Implementation Guide
- **Capabilities**: SMART on FHIR OAuth2 (`openid fhirUser launch/patient`), Patient/Observation/Condition/MedicationRequest CRUD, `$everything` patient summary, bulk async export, US Core IG compliance
- **Auth**: SMART on FHIR OAuth2 with discovery endpoint
- **Env**: `FHIR_SERVER_URL`, `SMART_CLIENT_ID`, `SMART_CLIENT_SECRET`

### HL7 v2 Expert — `hl7.agent.js`
- **Standard**: HL7 v2.3–v2.8
- **Capabilities**: ADT (admit/discharge/transfer), ORU (lab results), ORM (orders), MDM (documents), MLLP transport (0x0B/0x1C wrapper), ACK/NACK generation, HL7→FHIR transformation
- **Transport**: MLLP over TCP port 2575 (standard)
- **Env**: `HL7_LISTENING_PORT`, `DOWNSTREAM_MLLP_HOST`

### Medplum Expert — `medplum.agent.js`
- **SDKs**: `@medplum/core`, `@medplum/fhirtypes`, `@medplum/react`
- **Capabilities**: FHIR BaaS TypeScript SDK, Bot serverless functions (BotEvent), WebSocket Subscriptions, Task workflows, Questionnaire React forms, search operators
- **Auth**: Client Credentials or Basic auth → `accessToken`
- **Env**: `MEDPLUM_CLIENT_ID`, `MEDPLUM_CLIENT_SECRET`, `MEDPLUM_BASE_URL`

### Epic Interconnect Expert — `epic_mychart.agent.js`
- **APIs**: Epic App Orchard / Interconnect
- **Capabilities**: MyChart patient data integration, SMART on FHIR OAuth 2.0, condition extraction, scheduling workflows
- **Env**: `EPIC_CLIENT_ID`, `EPIC_NON_PRODUCTION_PRIVATE_KEY`

### Cerner Expert — `cerner.agent.js`
- **APIs**: Cerner Ignite APIs
- **Capabilities**: Comprehensive EHR integration, real-time patient data streams, secure clinical workflow manipulation
- **Env**: `CERNER_CLIENT_ID`, `CERNER_CLIENT_SECRET`

---

## 🎮 Gaming & GameFi (9 Agents)

### Unity SDK Expert — `unity_sdk.agent.js`
- **SDKs**: Unity Gaming Services (UGS) — Authentication, CloudSave, Economy, Matchmaker, Relay; Netcode for GameObjects
- **Capabilities**: UGS Auth anonymous/social, CloudSave public/private data, Economy virtual currencies + catalog, Matchmaker pooling + tickets, Relay DTLS server code, NGO NetworkVariable + ServerRpc/ClientRpc
- **Env**: `UNITY_PROJECT_ID`, `UNITY_ENVIRONMENT_ID`, `UNITY_SERVICE_KEY_ID`, `UNITY_SERVICE_KEY_SECRET`

### Azure PlayFab Expert — `playfab.agent.js`
- **SDKs**: PlayFab JavaScript SDK, CloudScript V8
- **Capabilities**: TitlePlayer auth, CloudScript V8 serverless functions, Economy virtual currencies + catalog + inventory, Leaderboards v2 (statistic handles), Matchmaking queue policies, A/B Experiments, LiveOps Segments
- **Env**: `PLAYFAB_TITLE_ID`, `PLAYFAB_DEV_SECRET_KEY`

### Photon Fusion 2 Expert — `photon_fusion.agent.js`
- **SDKs**: Photon Fusion 2 (Unity C#)
- **Capabilities**: NetworkRunner host/shared mode, NetworkBehaviour + NetworkObject spawning, [Networked] properties + OnChanged, INetworkInput pipeline, lag compensation + hit detection
- **Env**: `PHOTON_APP_ID`, `PHOTON_APP_VERSION`

### Nakama Expert — `nakama.agent.js`
- **SDKs**: `@heroiclabs/nakama-js` (client), TypeScript runtime (server-side RPC)
- **Capabilities**: Device/email/social auth, match state + opcodes, matchmaker ticket queries, server storage permissions, server-side TypeScript RPC functions, leaderboards, notifications
- **Env**: `NAKAMA_SERVER_KEY`, `NAKAMA_HOST`, `NAKAMA_PORT`

### Steam API Expert — `steam_api.agent.js`
- **SDKs**: Steamworks C++ SDK, Steam Web API
- **Capabilities**: GetPlayerSummaries/GetOwnedGames, auth ticket validation + OpenID, Steamworks achievements/stats/leaderboards, Steam IAP (microtransactions), VAC anti-cheat
- **Env**: `STEAM_WEB_API_KEY`, `STEAM_APP_ID`

### Immutable zkEVM Expert — `immutable_zkevm.agent.js`
- **SDKs**: `@imtbl/sdk` (Passport, Orderbook, GameBridge)
- **Capabilities**: Passport embedded wallet (OAuth2 PKCE), gas-free NFT minting, orderbook `prepareListing` + `fulfillOrder`, Unity SDK deep-link for mobile, wallet address management
- **Env**: `IMMUTABLE_CLIENT_ID`, `IMMUTABLE_PUBLISHABLE_KEY`

### Agora Expert — `agora.agent.js`
- **SDKs**: `agora-rtc-sdk-ng` (Web), Agora Unity SDK, `agora-token`
- **Capabilities**: Server-side AccessToken2 generation (PUBLISHER/SUBSCRIBER), Web RTC publish/subscribe, Unity/Unreal in-game voice chat (team channelName pattern), Spatial Audio 3D position updates, Cloud Recording composite (S3), RTMP push to Twitch/YouTube
- **Env**: `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE`, `AGORA_CUSTOMER_KEY`, `AGORA_CUSTOMER_SECRET`

### Epic Online Services Expert — `epic_online_services.agent.js`
- **APIs**: Epic Online Services (EOS) Web API
- **Capabilities**: EOS Connect Auth, peer-to-peer WebRTC matchmaking lobbies, cross-platform stats, achievement syncing
- **Env**: `EOS_CLIENT_ID`, `EOS_CLIENT_SECRET`

### Roblox Cloud Expert — `roblox.agent.js`
- **APIs**: Roblox Open Cloud API
- **Capabilities**: Server-to-server messaging, massive datastores extraction, live place publishing integrations
- **Env**: `ROBLOX_API_KEY`

---

## 🛒 E-Commerce & Retail (8 Agents)

### WooCommerce Expert — `woocommerce.agent.js`
- **Auth**: Basic Auth (Consumer Key:Secret) or OAuth1.0a
- **Capabilities**: REST API v3 products/variations/orders/coupons/reports, webhook HMAC-SHA256 verify, PHP action/filter hooks for custom functionality

### Amazon SP-API Expert — `amazon_sp_api.agent.js`
- **Auth**: LWA OAuth2 + AWS SigV4 dual-layer auth
- **Capabilities**: Catalog Items v2022, Inventory 3-step (createListing→patchListingItem→submit), Orders with shipment confirmation, FBA inbound shipments, async Reports NDJSON

### EasyPost Expert — `easypost.agent.js`
- **Capabilities**: Address verification, rate shopping (lowestRate across carriers), SmartRate delivery date percentiles, return labels, Tracker webhook events

### Klarna Expert — `klarna.agent.js`
- **Capabilities**: Checkout v3 `html_snippet` iframe, Payments JS SDK session→authorize→capture, On-Site Messaging BNPL widget for product pages

### BigCommerce Expert — `bigcommerce.agent.js`
- **Capabilities**: V3 REST (products/orders/customers), GraphQL Storefront with `X-BC-Storefront-API-Token`, Catalyst Next.js 14 headless starter, webhook HMAC verify

### eBay Expert — `ebay.agent.js`
- **Auth**: User OAuth2 (scoped) + App OAuth2 (client credentials)
- **Capabilities**: Inventory Item → Offer → Publish 3-step listing, Promoted Listings CPS campaigns, Notification subscriptions via platform API

### Magento Expert — `magento.agent.js`
- **APIs**: Adobe Commerce (Magento) REST/GraphQL
- **Capabilities**: Catalog structure parsing, multi-source inventory (MSI), orders sync, GraphQL product filtering
- **Env**: `MAGENTO_ACCESS_TOKEN`, `MAGENTO_BASE_URL`

### Shopify Hydrogen Expert — `shopify_hydrogen.agent.js`
- **APIs**: Shopify Headless/Hydrogen Storefront API
- **Capabilities**: Headless storefront configuration, intricate cart management, customizable secure React checkout patterns
- **Env**: `SHOPIFY_STOREFRONT_TOKEN`

---

## 🌡️ IoT & Embedded Systems (7 Agents)

### AWS IoT Core Expert — `aws_iot.agent.js`
- **Auth**: X.509 mutual TLS (device cert), IAM for API operations
- **Capabilities**: MQTT publish/subscribe with QoS, Device Shadow desired/reported/delta cycle, Rules Engine SQL→Lambda/DynamoDB, Greengrass v2 edge components, OTA Jobs deployment

### MQTT Expert — `mqtt.agent.js`
- **Standard**: MQTT v5 (backward compatible to v3.1.1)
- **Capabilities**: QoS 0/1/2, Last Will and Testament (LWT) for offline detection, retained messages, shared subscriptions `$share/group/topic`, Mosquitto TLS config

### InfluxDB Expert — `influxdb.agent.js`
- **Capabilities**: v3 IOx SQL + Flux, Line Protocol with `Point` builder, Telegraf MQTT consumer plugin config, Grafana data source JSON + threshold alerts

### Home Assistant Expert — `home_assistant.agent.js`
- **Capabilities**: REST/WebSocket API state + service calls, YAML automation (triggers/conditions/actions/modes), `config_flow` custom integration, HACS custom repos, Lovelace dashboard

### Raspberry Pi Expert — `raspberry_pi.agent.js`
- **Capabilities**: `gpiozero` non-blocking GPIO, I2C sensors (BME280/DHT22/ADS1115), `picamera2` MJPEG stream server, `systemd` service unit for auto-start, edge-to-cloud buffer pattern

### Tuya IoT Expert — `tuya.agent.js`
- **APIs**: Tuya Developer Cloud API
- **Capabilities**: HMAC-SHA256 authenticated commands, Pulsar message queue ingestion, smart device state toggling, energy usage queries
- **Env**: `TUYA_CLIENT_ID`, `TUYA_CLIENT_SECRET`

### Balena Expert — `balena.agent.js`
- **APIs**: balenaCloud API
- **Capabilities**: Cloud-based edge container fleet deployment, dynamic OS device variables, localized fleet monitoring
- **Env**: `BALENA_API_KEY`

---

## 🏠 Real Estate & PropTech (7 Agents)

### Zillow Expert — `zillow.agent.js`
- **APIs**: Zillow Bridge Interactive MLS API (`https://api.bridgedataoutput.com`), Zestimate (unofficial), Walk Score API, GreatSchools API, Google Maps Platform
- **Capabilities**: MLS property search with OData-style `$filter`, Zestimate AVM, Walk Score walkability/transit/bike scores, school ratings, mortgage payment formula with PMI
- **Env**: `BRIDGE_API_TOKEN`, `WALK_SCORE_API_KEY`, `GREATSCHOOLS_API_KEY`, `GOOGLE_MAPS_API_KEY`

### Buildium Expert — `buildium.agent.js`
- **APIs**: Buildium REST API v1
- **Capabilities**: Property/unit/rental owner CRUD, tenant lease management, rent charges + payments with GL account codes, maintenance request lifecycle (New→InProgress→Completed), accounting reports
- **Auth**: `X-BUILDIUM-CLIENT-ID` + `X-BUILDIUM-CLIENT-SECRET` headers
- **Env**: `BUILDIUM_CLIENT_ID`, `BUILDIUM_CLIENT_SECRET`

### Procore Expert — `procore.agent.js`
- **APIs**: Procore REST API v1
- **Capabilities**: OAuth2 + `Procore-Company-Id` header, Project management (RFIs/Submittals/Daily Logs with crew+weather), Budget + potential change orders, Punch List QA items
- **Auth**: OAuth2 Authorization Code flow
- **Env**: `PROCORE_CLIENT_ID`, `PROCORE_CLIENT_SECRET`, `PROCORE_COMPANY_ID`

### Guesty Expert — `guesty.agent.js`
- **APIs**: Guesty REST API v1
- **Capabilities**: Listing CRUD, Reservation management (inquiry→confirmed→checked_in→checked_out), calendar blocking, automated guest messages by trigger, dynamic pricing rules, cleaning task assignments
- **Auth**: `Authorization: Bearer {GUESTY_API_TOKEN}`
- **Env**: `GUESTY_API_TOKEN`, `GUESTY_WEBHOOK_SECRET`

### ATTOM Expert — `attom.agent.js`
- **APIs**: ATTOM Data Solutions REST API v1.0.0
- **Capabilities**: Property detail (legal description, footage, year built), AVM with FSD confidence score, comparable sales (CMA), neighborhood demographics, hazard risk (FEMA flood zone, wildfire, earthquake)
- **Auth**: `apikey` header
- **Env**: `ATTOM_API_KEY`

### CoStar CRE Expert — `costar.agent.js`
- **APIs**: CoStar Group Real Estate API
- **Capabilities**: Commercial Real Estate analytics, pulling lease comps, property valuations, market forecasting, LoopNet sync
- **Env**: `COSTAR_API_KEY`

### Yardi Expert — `yardi.agent.js`
- **APIs**: Yardi Voyager APIs
- **Capabilities**: Enterprise residential and commercial property workflows, accounting automation, vendor and tenant portals
- **Env**: `YARDI_USERNAME`, `YARDI_PASSWORD`

---

## 📚 EdTech & Education (6 Agents)

### Canvas LMS Expert — `canvas_lms.agent.js`
- **APIs**: Canvas REST API v1 (Instructure Cloud + self-hosted)
- **Capabilities**: PKCE OAuth2 with refresh tokens, course/enrollment management, assignments + SpeedGrader grade passback, Module content sequencing + completion requirements, Quiz engine (question banks, time limits), LTI 1.3 Advantage Grade Service (AGS)
- **Auth**: OAuth2 PKCE or Developer Key token
- **Env**: `CANVAS_BASE_URL`, `CANVAS_CLIENT_ID`, `CANVAS_CLIENT_SECRET`

### Google Classroom Expert — `google_classroom.agent.js`
- **SDKs**: `googleapis` (Node.js)
- **Capabilities**: Scoped OAuth2 (`classroom.courses`, `classroom.coursework.students`), Course/Coursework CRUD, ASSIGNMENT + MULTIPLE_CHOICE_QUESTION types, submission grading + return, Pub/Sub push notifications for real-time events
- **Env**: `GOOGLE_CLASSROOM_API_KEY`, `GOOGLE_CLASSROOM_CLIENT_ID`, `GOOGLE_CLASSROOM_CLIENT_SECRET`

### Zoom SDK Expert — `zoom_sdk.agent.js`
- **APIs**: Zoom REST API, Meeting SDK, Video SDK
- **Capabilities**: Server-to-Server OAuth token (no refresh needed for 1-hour TTL), Meeting API (create/update/delete, breakout rooms, cloud recording, polls), Meeting SDK HMAC-SHA256 signature, Video SDK custom UI with SessionContext, Webinar registration + panelists
- **Auth**: Server-to-Server OAuth (Client Credentials)
- **Env**: `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_WEBHOOK_SECRET_TOKEN`

### D2L Brightspace Expert — `brightspace.agent.js`
- **APIs**: Brightspace Learning Environment (LE) API + Learning Platform (LP) API
- **Capabilities**: API version matrix (LE 1.51+), course offering enrollment with `roleId`, GradeBook `PointsNumerator` passback, SCORM package upload + Activity Feed tracking, BDP Brightspace Data Platform analytics export
- **Auth**: OAuth2 implicit or Client Credentials
- **Env**: `BRIGHTSPACE_HOST`, `BRIGHTSPACE_CLIENT_ID`, `BRIGHTSPACE_CLIENT_SECRET`

### Moodle Expert — `moodle.agent.js`
- **APIs**: Moodle Web Services REST API
- **Capabilities**: Batch course creation, SIS enrollment syncing, user progression tracking, SCORM completion extraction
- **Env**: `MOODLE_TOKEN`, `MOODLE_URL`

### Blackboard Expert — `blackboard.agent.js`
- **APIs**: Blackboard Learn REST API
- **Capabilities**: Gradebook manipulation, forum scraping, course module syncing, and user role entitlements
- **Env**: `BLACKBOARD_CLIENT_ID`, `BLACKBOARD_CLIENT_SECRET`

---

## ⚖️ Legal & LegalTech (4 Agents)

### DocuSign Expert — `docusign.agent.js`
- **SDKs**: `docusign-esign`
- **Capabilities**: JWT RSA grant auth, envelope creation with anchor-string tab positioning, embedded iframe signing URLs (recipientViewRequest), template role-fill, bulk send, Connect HMAC-SHA256 webhook verification
- **Env**: `DOCUSIGN_INTEGRATION_KEY`, `DOCUSIGN_USER_ID`, `DOCUSIGN_ACCOUNT_ID`, `DOCUSIGN_RSA_PRIVATE_KEY`

### Clio Expert — `clio.agent.js`
- **APIs**: Clio REST API v4
- **Capabilities**: Matter + Contact + TimeEntry CRUD, Invoice draft→approve→payment lifecycle, multipart document upload, HMAC-SHA256 webhook verification
- **Auth**: OAuth2 Authorization Code
- **Env**: `CLIO_CLIENT_ID`, `CLIO_CLIENT_SECRET`

### Ironclad Expert — `ironclad.agent.js`
- **APIs**: Ironclad CLM API
- **Capabilities**: Contract Lifecycle Management API, triggering templates, metadata extraction, workflow status webhooks
- **Env**: `IRONCLAD_API_TOKEN`

### Everlaw Expert — `everlaw.agent.js`
- **APIs**: Everlaw API
- **Capabilities**: Cloud eDiscovery, document clustering, legal hold automation, redaction tracking
- **Env**: `EVERLAW_API_KEY`

---

## 🎵 Media & Entertainment (6 Agents)

### Spotify Expert — `spotify.agent.js`
- Auth: PKCE OAuth2; Capabilities: Web Playback SDK (Premium), music recommendations with audio feature seeds, playlist CRUD, now playing + queue

### YouTube Expert — `youtube.agent.js`
- Auth: OAuth2 + API key; Capabilities: Data API v3 search/resumable upload, Analytics views/watchtime/revenue, Live Streaming broadcast lifecycle

### Twitch Expert — `twitch.agent.js`
- Auth: Client Credentials + User OAuth; Capabilities: Helix streams/clips, EventSub HMAC webhooks, Channel Points, Predictions & Polls lifecycle

### Discord Expert — `discord.agent.js`
- SDKs: `discord.js` v14; Capabilities: Slash commands, EmbedBuilder, buttons/modals/select menus, role management, OAuth2 guild authorization

### Mux Expert — `mux.agent.js`
- **APIs**: Mux Video & Data API
- **Capabilities**: Automated VOD transcoding to HLS, RTMP ingest keys for live streaming, playback QoE data telemetry
- **Env**: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`

### Frame.io Expert — `frame_io.agent.js`
- **APIs**: Frame.io API
- **Capabilities**: High-speed video collaboration, asset uploading, granular timeline commenting, review workflows
- **Env**: `FRAME_IO_DEVELOPER_TOKEN`

---

## 👥 HR & Workforce (5 Agents)

### BambooHR Expert — `bamboohr.agent.js`
- Auth: API Key Basic auth; Capabilities: Employee CRUD + custom fields, time-off requests + approval, custom report builder, ATS pipeline, field-monitor webhooks

### Greenhouse ATS Expert — `greenhouse.agent.js`
- Auth: API Key Basic auth; Capabilities: Candidate/application/stage pipeline, scorecard `overall_recommendation`, offer create+open lifecycle, Job Board API, HMAC webhooks

### Rippling Expert — `rippling.agent.js`
- Auth: OAuth2 Bearer; Capabilities: SCIM 2.0 employee provisioning/deprovisioning, lifecycle webhooks, `payroll_run_completed` events, MDM device + app provisioning

### Workday Expert — `workday.agent.js`
- **APIs**: Workday REST/SOAP APIs (RaaS)
- **Capabilities**: HCM integration, org chart traversal, employee data extraction, Custom Reports (RaaS) parsing
- **Env**: `WORKDAY_CLIENT_ID`, `WORKDAY_CLIENT_SECRET`, `WORKDAY_TENANT_NAME`

### Lattice Expert — `lattice.agent.js`
- **APIs**: Lattice Platform REST APIs
- **Capabilities**: Org-wide OKR syncing, 1-on-1 performance review lifecycle charting, employee feedback loop triggers
- **Env**: `LATTICE_API_KEY`

---

## 🔐 Cybersecurity & Threat Intel (8 Agents)

### VirusTotal Expert — `virustotal.agent.js`
- **APIs**: VirusTotal API v3
- **Capabilities**: File/URL/IP/domain analysis + polling, `last_analysis_stats.malicious` count, YARA Livehunt ruleset creation, behavioral sandbox MITRE ATT&CK technique extraction, IOC pivot via `contacted_domains/ips/dropped_files`, re-scan freshness check
- **Rate**: Free: 4 req/min, 500/day; Premium: Livehunt + higher limits
- **Env**: `VIRUSTOTAL_API_KEY`

### Shodan Expert — `shodan.agent.js`
- **APIs**: Shodan REST API, Shodan Search API
- **Capabilities**: Host lookup (ports/banners/SSL certs/CVEs), advanced search syntax (vuln/org/asn/ssl/http.title filters), faceted stats, DNS forward/reverse, continuous monitoring alerts with trigger types (new_service/new_vuln/malware), exploit DB CVE cross-reference
- **Env**: `SHODAN_API_KEY`

### CrowdStrike Falcon Expert — `crowdstrike.agent.js`
- **APIs**: CrowdStrike Falcon API (region-specific)
- **Capabilities**: Region-aware OAuth2 (US-1/US-2/EU-1), Detections query+update (severity/tactic/cmdline/sha256), Incident CrowdScore risk 0-1000, host containment/lift containment, RTR remote session (ls/get/put/run commands), custom IOC prevent/detect for SHA256/domain/IPv4, Threat Intel actor/YARA
- **Env**: `CROWDSTRIKE_CLIENT_ID`, `CROWDSTRIKE_CLIENT_SECRET`, `CROWDSTRIKE_BASE_URL`

### Splunk Expert — `splunk.agent.js`
- **APIs**: Splunk REST API (port 8089), HEC (port 8088)
- **Capabilities**: Session vs API token auth, SPL search job create/poll/results, key SPL patterns (failed logins/Sysmon process exec/geo network), HEC event+batch+raw endpoints, saved search cron + webhook alert, KV Store as IOC lookup for `| inputlookup`, SOAR container+artifact trigger
- **Env**: `SPLUNK_HOST`, `SPLUNK_API_TOKEN`, `SPLUNK_HEC_TOKEN`

### Have I Been Pwned Expert — `hibp.agent.js`
- **APIs**: HIBP API v3, Pwned Passwords API
- **Capabilities**: Email breach lookup with DataClasses array, domain-wide monitoring grouped by breach name, k-anonymity SHA-1 prefix/suffix Pwned Passwords (never full hash remote), paste lookup urgency, all-breaches polling for new AddedDate, integration patterns (registration/login/corporate cron)
- **Env**: `HIBP_API_KEY` (Pwned Passwords endpoint is free, no key)

### PentAGI Expert — `pentagi.agent.js`
- **APIs**: PentAGI containerized GraphQL/REST API (`http://pentagi:8443/api/v1`)
- **Capabilities**: Autonomous penetration testing, red-teaming, vulnerability scanning, active exploitation simulations within an isolated Docker sandbox network. Dispatches orchestrated security jobs and retrieves vulnerability reports.
- **Env**: `PENTAGI_API_URL`, `OPEN_AI_KEY` (configured internally)

### Tenable Expert — `tenable.agent.js`
- **APIs**: Tenable.io Vulnerability Management API
- **Capabilities**: Nessus scan initialization, vulnerability chunked export, asset tracking, compliance reporting
- **Env**: `TENABLE_ACCESS_KEY`, `TENABLE_SECRET_KEY`

### Auth0 Expert — `auth0.agent.js`
- **APIs**: Auth0 Management API
- **Capabilities**: Enterprise CIAM, SAML provider hook integrations, multi-tenant DB user migrations, webhook lifecycle manipulation
- **Env**: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`

---

## 📊 Marketing & Analytics (6 Agents)

### HubSpot CRM Expert — `hubspot.agent.js`
- **SDKs**: `@hubspot/api-client`
- **Capabilities**: Private App token vs OAuth2, contact search with `filterGroups`, batch upsert by email, deal pipeline stages (ms-epoch closedate), contact→deal association, custom enumeration property, engagement (call/note/meeting) with association, webhook HMAC-SHA256-v3, form submission without auth for lead capture

### Klaviyo Expert — `klaviyo.agent.js`
- **APIs**: Klaviyo API v2023-12-15 (revision header required)
- **Capabilities**: Profile upsert by email with custom properties, bulk subscription consent job, ecommerce event Flows (abandoned cart/winback/welcome), campaign create+message+send-job lifecycle, SMS E.164 + STOP compliance
- **Env**: `KLAVIYO_PRIVATE_KEY`

### Segment CDP Expert — `segment.agent.js`
- **SDKs**: `@segment/analytics-node` (server), `@segment/analytics-next` (browser)
- **Capabilities**: Write Key Basic auth, identify with nested company traits, track with ecommerce spec (Order Completed/Product Viewed), anonymousId for pre-login, page + group for B2B org linking, 300+ Destinations auto-forwarding with per-call integration overrides, Profiles API cross-source customer 360, Protocols schema validation/blocking
- **Env**: `SEGMENT_WRITE_KEY`

### Mixpanel Expert — `mixpanel.agent.js`
- **SDKs**: `mixpanel` (Node.js)
- **Capabilities**: Service account server-side auth, event import with `$insert_id` deduplication and Unix seconds time, People profile `$set/$add/$union/$set_once` operations, funnel API with `funnel_id`, retention birth cohort, JQL JavaScript query for custom event aggregation, NDJSON data export for ETL/GDPR
- **Env**: `MIXPANEL_PROJECT_ID`, `MIXPANEL_SERVICE_ACCOUNT`, `MIXPANEL_SERVICE_ACCOUNT_SECRET`

### Marketo Expert — `marketo.agent.js`
- **APIs**: Adobe Marketo Engage REST API
- **Capabilities**: Lead generation + upserting, custom activity tracking, smart campaign triggering, Munchkin web tracking association
- **Env**: `MARKETO_CLIENT_ID`, `MARKETO_CLIENT_SECRET`, `MARKETO_MUNCHKIN_ID`

### Iterable Expert — `iterable.agent.js`
- **APIs**: Iterable Platform APIs
- **Capabilities**: Cross-channel engagement, massive user profile JSON payloads manipulation, dynamic ETL webhooks
- **Env**: `ITERABLE_API_KEY`

---

## 🧬 BioTech & Genomics (6 Agents)

### NCBI Expert — `ncbi.agent.js`
- **APIs**: NCBI Entrez E-utilities API
- **Capabilities**: PubMed literature queries, GenBank sequence retrieval, dbSNP variant lookup, bioinformatics data extraction
- **Env**: `NCBI_API_KEY`

### Ensembl Expert — `ensembl.agent.js`
- **APIs**: Ensembl REST API (EBI)
- **Capabilities**: Variant Effect Predictor (VEP), orthologs, gene trees, sequence alignment mapping

### Illumina Expert — `illumina.agent.js`
- **APIs**: Illumina BaseSpace Sequence Hub
- **Capabilities**: Developer API interface for FASTQ analysis, sequencing run monitoring, and clinical genomic dataset querying
- **Auth**: BaseSpace access token
- **Env**: `ILLUMINA_BASESPACE_TOKEN`

### Seven Bridges Expert — `sevenbridges.agent.js`
- **Platform**: Velsera Seven Bridges
- **Capabilities**: CWL pipeline orchestrations, massive TCGA data querying, cloud compute orchestration for genomics

### RCSB PDB Expert — `rcsb_pdb.agent.js`
- **APIs**: Protein Data Bank (PDB) REST/GraphQL API
- **Capabilities**: Macromolecular structure retrieval, 3D coordinate bounding box parsing, protein sequence homolog analysis
- **Env**: Public API (no key required)

### Benchling Expert — `benchling.agent.js`
- **APIs**: Benchling R&D Cloud APIs
- **Capabilities**: Genetic sequence cataloging, bioprocessing LIMS, clinical registry mutations tracking, structured pipeline synchronizations
- **Env**: `BENCHLING_API_KEY`

---

## 🚀 SpaceTech & Geospatial (6 Agents)

### NASA Open Data Expert — `nasa.agent.js`
- **APIs**: NASA API Portal (APOD, NeoWs, Earth Observatory)
- **Capabilities**: Satellite TLE tracking, Near-Earth Object telemetry, astronomical picture metadata, planetary datalakes
- **Env**: `NASA_API_KEY`

### Maxar Expert — `maxar.agent.js`
- **APIs**: SecureWatch ARD (Analysis Ready Data)
- **Capabilities**: High-resolution electro-optical imagery tasking, geospatial cloud data parsing, Earth observation analytics

### Spire Global Expert — `spire.agent.js`
- **Capabilities**: Satellite AIS tracking (maritime), ADS-B tracking (aviation), radio occultation weather data feeds
- **Env**: `SPIRE_API_KEY`

### Starlink Enterprise Expert — `starlink.agent.js`
- **Capabilities**: Satellite constellation telemetry querying, enterprise latency management, bandwidth charting

### ESA Copernicus Expert — `esa_copernicus.agent.js`
- **APIs**: Copernicus Open Access Hub (OData)
- **Capabilities**: Sentinel satellite imagery (SAR/Optical) search, Earth observation dataset retrieval, geometry intersection querying
- **Env**: `COPERNICUS_USERNAME`, `COPERNICUS_PASSWORD`

### Capella Space Expert — `capella.agent.js`
- **APIs**: Capella Space API
- **Capabilities**: Synthetic Aperture Radar (SAR) satellite tasking, STAC metadata querying, direct Earth observation imagery ordering
- **Env**: `CAPELLA_API_KEY`

---

## 🏛️ GovTech & Public Sector (5 Agents)

### Data.gov Expert — `datagov.agent.js`
- **APIs**: CKAN API
- **Capabilities**: Federal open datalake querying, municipal metadata parsing, census/demographics package retrieval

### OpenFEMA Expert — `openfema.agent.js`
- **APIs**: OpenFEMA API
- **Capabilities**: Disaster declarations, NFIP policies, hazard mitigation analytics, GIS logic formatting

### IRS API Expert — `irs.agent.js`
- **APIs**: IRS TEOS API
- **Capabilities**: EIN validation, Form 990 tax-exempt financial parsing, 501(c)(3) verification

### US Census Expert — `census_gov.agent.js`
- **APIs**: US Census Bureau Data API (CitySDK)
- **Capabilities**: American Community Survey demographics, decennial census data, FIPS geographic parsing, tract/block geometries
- **Env**: `CENSUS_API_KEY`

### USAspending Expert — `usaspending.agent.js`
- **APIs**: USAspending.gov Data Retrieval API
- **Capabilities**: Federal contracting datasets analysis, federal grant tracing, congressional district financial analytics, UEI mapping
- **Env**: Public API (no key required)

---

## 🎫 Live Events & Entertainment (5 Agents)

### Ticketmaster Expert — `ticketmaster.agent.js`
- **APIs**: Ticketmaster Discovery API
- **Capabilities**: Concert availability, venue seating charts, lat/long event bounding, category event maps
- **Env**: `TICKETMASTER_API_KEY`

### Eventbrite Expert — `eventbrite.agent.js`
- **APIs**: Eventbrite API v3
- **Capabilities**: Event organizer operations, dynamic ticketing, attendee check-in webhooks
- **Env**: `EVENTBRITE_PRIVATE_TOKEN`

### SeatGeek Platform Expert — `seatgeek.agent.js`
- **APIs**: SeatGeek Platform API
- **Capabilities**: Secondary market aggregation, performer popularity metrics, price distribution graphing
- **Env**: `SEATGEEK_CLIENT_ID`, `SEATGEEK_CLIENT_SECRET`

### StubHub Expert — `stubhub.agent.js`
- **APIs**: StubHub Commerce API
- **Capabilities**: Secondary ticket market inventory scanning, venue mapping parsing, live event sales price trend reporting
- **Env**: `STUBHUB_CONSUMER_KEY`, `STUBHUB_CONSUMER_SECRET`

### Live Nation Expert — `livenation.agent.js`
- **APIs**: Live Nation Partner/Affiliate APIs
- **Capabilities**: Enterprise festival technology mapping, extreme-throughput venue charting, live availability logic extraction
- **Env**: `LIVENATION_PARTNER_KEY`

---

## 📦 Logistics & Supply Chain (5 Agents)

### Shippo Expert — `shippo.agent.js`
- **APIs**: Shippo REST API
- **Capabilities**: Multi-carrier shipping rates, label generation, return labels, and package tracking webhooks
- **Env**: `SHIPPO_API_TOKEN`

### Flexport Expert — `flexport.agent.js`
- **APIs**: Flexport API
- **Capabilities**: Ocean/air freight tracking, customs clearance documents, carbon footprint emissions data
- **Env**: `FLEXPORT_API_KEY`

### Samsara Expert — `samsara.agent.js`
- **APIs**: Samsara Connected Operations Cloud API
- **Capabilities**: Fleet GPS telemetry, dashcam event extraction, Hours of Service (HOS)/ELD compliance
- **Env**: `SAMSARA_API_TOKEN`

### Onfleet Expert — `onfleet.agent.js`
- **APIs**: Onfleet REST API
- **Capabilities**: Last-mile delivery tracking, automated driver routing logic, drop-off ETA calculations, task assignment webhooks
- **Env**: `ONFLEET_API_KEY`

### project44 Expert — `project44.agent.js`
- **APIs**: project44 Advanced Visibility Platform APIs
- **Capabilities**: Intricate shipping and logistics schemas, predictive truckload ETAs, ocean freight milestones tracking, geofence event queues
- **Env**: `PROJECT44_API_KEY`

---

## ✈️ Travel & Hospitality (5 Agents)

### Amadeus Expert — `amadeus.agent.js`
- **APIs**: Amadeus Travel API (GDS)
- **Capabilities**: Flight availability, live pricing quotes, round-trip itinerary booking, hotel rate plan search
- **Env**: `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`

### Uber Expert — `uber.agent.js`
- **APIs**: Uber Rides & Uber Direct APIs
- **Capabilities**: Ride-hailing dispatch, business travel vouchers, delivery quotes, and tracking webhooks
- **Env**: `UBER_CLIENT_ID`, `UBER_CLIENT_SECRET`, `UBER_CUSTOMER_ID`

### Skyscanner Expert — `skyscanner.agent.js`
- **APIs**: Skyscanner Travel API
- **Capabilities**: Bookable flight price streams, cached indicative calendar rates, affiliate referral construction
- **Env**: `SKYSCANNER_API_KEY`

### Sabre Expert — `sabre.agent.js`
- **APIs**: Sabre GDS REST APIs
- **Capabilities**: Flight search algorithms (Bargain Finder Max), PNR creation + session management, hospitality room pricing
- **Env**: `SABRE_CLIENT_ID`, `SABRE_CLIENT_SECRET`

### Hopper Expert — `hopper.agent.js`
- **APIs**: Hopper Cloud Connect API
- **Capabilities**: Fintech travel integrations, predictive flight pricing, dynamic price freeze (lock) guarantees, volatility hedging algorithms
- **Env**: `HOPPER_API_KEY`

---

## 🚗 Automotive & Smart Mobility (5 Agents)

### Smartcar Expert — `smartcar.agent.js`
- **APIs**: Smartcar Connect API
- **Capabilities**: Cross-brand odometer reading, EV battery SoC and charging capacity, door unlock/lock commands
- **Env**: `SMARTCAR_CLIENT_ID`, `SMARTCAR_CLIENT_SECRET`

### ChargePoint Expert — `chargepoint.agent.js`
- **APIs**: ChargePoint / OCPI Networks
- **Capabilities**: Real-time EV charging station port availability, level 2 vs DC charger proximity filtering, active session telemetry
- **Env**: `CHARGEPOINT_API_KEY`

### Tesla Fleet API Expert — `tesla.agent.js`
- **APIs**: Official Tesla Fleet API
- **Capabilities**: Encrypted remote commands (horn, lock, HVAC), fleet telemetry webhooks, Powerwall and solar roof generation data
- **Env**: `TESLA_CLIENT_ID`, `TESLA_CLIENT_SECRET`, `TESLA_PRIVATE_KEY`

### Geotab Expert — `geotab.agent.js`
- **APIs**: Geotab MyGeotab API
- **Capabilities**: Commercial fleet telematics, OBD-II logging, continuous location streaming, engine fault code extraction
- **Env**: `GEOTAB_USERNAME`, `GEOTAB_PASSWORD`, `GEOTAB_DATABASE`

### Rivian Fleet Expert — `rivian.agent.js`
- **APIs**: Rivian Commercial Fleet API
- **Capabilities**: Electric commercial van (EDV) telematics, commercial EV battery state-of-charge tracking, and push geographic vehicle tracing
- **Env**: `RIVIAN_API_KEY`

---

## 🌾 Agriculture & Farming (5 Agents)

### John Deere Expert — `myjohndeere.agent.js`
- **APIs**: MyJohnDeere API
- **Capabilities**: Machine telemetry (GPS, engine hours, DTC logic), agronomic operations (yield, planting), geojson field boundaries
- **Env**: `MYJOHNDEERE_CLIENT_ID`, `MYJOHNDEERE_CLIENT_SECRET`

### Climate FieldView Expert — `climatefieldview.agent.js`
- **APIs**: Climate FieldView API
- **Capabilities**: Harvest yield mapping, field contour mapping, hyper-local precipitation forecasts
- **Env**: `CLIMATE_CLIENT_ID`, `CLIMATE_CLIENT_SECRET`

### Planet Labs Expert — `planetlabs.agent.js`
- **APIs**: Planet Labs Orders & Data APIs
- **Capabilities**: PlanetScope daily satellite imagery orders, NDVI crop health tracking, multi-spectral field monitoring
- **Env**: `PLANET_API_KEY`

### Cropin Expert — `cropin.agent.js`
- **APIs**: Cropin Compute REST API
- **Capabilities**: Predictive crop intelligence, seasonal yield estimation, weather analytics, farm operations syncing
- **Env**: `CROPIN_API_KEY`

### Trimble Ag Expert — `trimble.agent.js`
- **APIs**: Trimble Ag Software APIs
- **Capabilities**: Enterprise precision agriculture logic, massively scalable RTK-GPS tractor path tracing, Field boundaries (A-B Lines)
- **Env**: `TRIMBLE_API_KEY`

---

## ⚡ Energy & Climate (5 Agents)

### WattTime Expert — `watttime.agent.js`
- **APIs**: WattTime API
- **Capabilities**: Real-time MOER (Marginal Operating Emissions Rate) tracking, automated green-grid load shifting
- **Env**: `WATTTIME_USERNAME`, `WATTTIME_PASSWORD`

### Enphase Expert — `enphase.agent.js`
- **APIs**: Enphase Enlighten API
- **Capabilities**: Solar microinverter array power production, real-time consumption mapping, Encharge battery SoC
- **Env**: `ENPHASE_CLIENT_ID`, `ENPHASE_CLIENT_SECRET`

### Persefoni Expert — `persefoni.agent.js`
- **APIs**: Persefoni ESG Ledger
- **Capabilities**: Operational data ledger ingestion, API-driven Scope 1-3 carbon footprint calculation, SEC compliance auditing
- **Env**: `PERSEFONI_API_KEY`

### NREL Expert — `nrel.agent.js`
- **APIs**: NREL Developer Network APIs
- **Capabilities**: PVWatts solar irradiance estimation, alternative fuel stations proximity, utility rate structures
- **Env**: `NREL_API_KEY`

### Octopus Energy Expert — `octopus.agent.js`
- **APIs**: Octopus Energy Kraken API
- **Capabilities**: Kraken platform telemetry, half-hourly dynamic pricing/Agile tariff scraping, residential grid export load tracking
- **Env**: `OCTOPUS_API_KEY`

---

## 🔑 Environment Variables — Industry Verticals

A consolidated list of required environment variables for all industry agent groups:

```env
# FinTech
ALPHA_VANTAGE_API_KEY=
ALPACA_API_KEY=
ALPACA_API_SECRET=
POLYGON_API_KEY=
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox
MODERN_TREASURY_ORG_ID=
MODERN_TREASURY_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PERSONA_API_KEY=

# Healthcare
FHIR_SERVER_URL=
SMART_CLIENT_ID=
SMART_CLIENT_SECRET=
MEDPLUM_CLIENT_ID=
MEDPLUM_CLIENT_SECRET=

# Gaming
AGORA_APP_ID=
AGORA_APP_CERTIFICATE=
AGORA_CUSTOMER_KEY=
AGORA_CUSTOMER_SECRET=
UNITY_PROJECT_ID=
PLAYFAB_TITLE_ID=
PLAYFAB_DEV_SECRET_KEY=

# Real Estate
BRIDGE_API_TOKEN=
WALK_SCORE_API_KEY=
GREATSCHOOLS_API_KEY=
BUILDIUM_CLIENT_ID=
BUILDIUM_CLIENT_SECRET=
PROCORE_CLIENT_ID=
PROCORE_CLIENT_SECRET=
PROCORE_COMPANY_ID=
GUESTY_API_TOKEN=
GUESTY_WEBHOOK_SECRET=
ATTOM_API_KEY=

# EdTech
CANVAS_BASE_URL=
CANVAS_CLIENT_ID=
CANVAS_CLIENT_SECRET=
GOOGLE_CLASSROOM_CLIENT_ID=
GOOGLE_CLASSROOM_CLIENT_SECRET=
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_WEBHOOK_SECRET_TOKEN=
BRIGHTSPACE_HOST=
BRIGHTSPACE_CLIENT_ID=
BRIGHTSPACE_CLIENT_SECRET=

# Cybersecurity
VIRUSTOTAL_API_KEY=
SHODAN_API_KEY=
CROWDSTRIKE_CLIENT_ID=
CROWDSTRIKE_CLIENT_SECRET=
CROWDSTRIKE_BASE_URL=https://api.crowdstrike.com
SPLUNK_HOST=
SPLUNK_API_TOKEN=
SPLUNK_HEC_TOKEN=
HIBP_API_KEY=
PENTAGI_API_URL=

# Marketing
HUBSPOT_ACCESS_TOKEN=
KLAVIYO_PRIVATE_KEY=
SEGMENT_WRITE_KEY=
MIXPANEL_PROJECT_ID=
MIXPANEL_SERVICE_ACCOUNT=
MIXPANEL_SERVICE_ACCOUNT_SECRET=

# BioTech
NCBI_API_KEY=
ILLUMINA_BASESPACE_TOKEN=

# SpaceTech
NASA_API_KEY=
SPIRE_API_KEY=

# Live Events
TICKETMASTER_API_KEY=
EVENTBRITE_PRIVATE_TOKEN=
SEATGEEK_CLIENT_ID=
SEATGEEK_CLIENT_SECRET=

# Logistics
SHIPPO_API_TOKEN=
FLEXPORT_API_KEY=
SAMSARA_API_TOKEN=

# Travel
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
UBER_CLIENT_ID=
UBER_CLIENT_SECRET=
UBER_CUSTOMER_ID=
SKYSCANNER_API_KEY=

# Auto Mobility
SMARTCAR_CLIENT_ID=
SMARTCAR_CLIENT_SECRET=
CHARGEPOINT_API_KEY=
TESLA_CLIENT_ID=
TESLA_CLIENT_SECRET=
TESLA_PRIVATE_KEY=

# Agriculture
MYJOHNDEERE_CLIENT_ID=
MYJOHNDEERE_CLIENT_SECRET=
CLIMATE_CLIENT_ID=
CLIMATE_CLIENT_SECRET=
PLANET_API_KEY=

# Energy
WATTTIME_USERNAME=
WATTTIME_PASSWORD=
ENPHASE_CLIENT_ID=
ENPHASE_CLIENT_SECRET=
PERSEFONI_API_KEY=

# Phase 53: FinTech & Real Estate
CHAINALYSIS_API_KEY=
GRIDICS_API_KEY=
ZONEOMICS_API_KEY=
SUPPLIER_RISK_DNB_KEY=

# Phase 53: Media & IP
SONGTRUST_API_KEY=
USPTO_API_KEY=

# Phase 53: Cybersecurity
OKTA_API_KEY=
OKTA_DOMAIN=

# Phase 53: EdTech & HR
PROCTORIO_LTI_SECRET=
CHECK_HQ_API_KEY=

# Phase 53: IoT, BioTech, AgriTech, SpaceTech
AWS_TWINMAKER_ROLE_ARN=
DRONEDEPLOY_API_KEY=
NETAFIM_API_KEY=
# Phase 53: IoT, BioTech, AgriTech, SpaceTech
AWS_TWINMAKER_ROLE_ARN=
DRONEDEPLOY_API_KEY=
NETAFIM_API_KEY=
SCHRODINGER_LICENSE_SERVER=

# Phase 54: GovTech & Institutional Finance
FEDRAMP_OSCAL_ENDPOINT=
BLACKROCK_ALADDIN_API_KEY=

# Phase 54: Gaming, Retail, Travel
EPIC_GAMES_EOS_TOKEN=
MINDBODY_API_KEY=
MINDBODY_SITE_ID=
CLEAR_VERIFICATION_KEY=

# Phase 54: InsurTech, NGO, Maritime
GUIDEWIRE_CLIENT_ID=
GUIDEWIRE_CLIENT_SECRET=
BLACKBAUD_SKY_API_KEY=
MAERSK_TRACK_TRACE_KEY=

# Phase 54: Life Sciences & FinTech Auth
VEEVA_VAULT_SESSION_TOKEN=
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox

```

## Phase 54: The Final Frontier Agents

### 134. FederalRampAgent (GovTech & Compliance)
- **Role**: GovCloud continuous monitoring and FedRAMP assessment orchestrator.
- **Capabilities**: Formulates OSCAL JSON pipelines, reads DISA STIG benchmarks via OpenSCAP, and translates NIST 800-53 controls to Terraform.
- **Auth**: FIPS 140-3 boundary scoped tokens / IAM Roles.

### 135. BlackrockAladdinAgent (FinTech & Wealth)
- **Role**: Institutional portfolio execution and algorithmic trading specialist.
- **Capabilities**: Translates FIX over TLS protocols for market orders, interacting with the Aladdin Risk API to measure VaR and ESG physical risks.
- **Auth**: Mutual TLS (mTLS) and static IP whitelisting.

### 136. EpicGamesMetaverseAgent (Gaming & Spatial Computing)
- **Role**: Unreal Engine deployment architect and Pixel Streaming orchestration.
- **Capabilities**: Deploys shipping builds of UE Dedicated Servers inside Kubernetes via Agones, bridging MetaHuman SDKs and WebRTC signaling servers.
- **Auth**: EOS (Epic Online Services) Scoped Tokens.

### 137. MindbodyAgent (Wellness & Retail Boutique)
- **Role**: Studio scheduling logistics and ClassPass aggregator integration.
- **Capabilities**: Translates specific Franchise vs Corporate pricing options, handling high-concurrency waitlist promotions and membership rebilling logic.
- **Auth**: API Key + Distinct Site ID per Studio.

### 138. ClearIdentityAgent (Travel & Biometrics)
- **Role**: TSA PreCheck integration and Decentralized Identity wallet mapping.
- **Capabilities**: Handles mathematical vector matching concepts without exposing biometric templates, decoding IATA Bar Coded Boarding Passes (BCBP).
- **Auth**: Scoped Client Credentials flow.

### 139. GuidewireAgent (InsurTech)
- **Role**: Property & Casualty (P&C) core system analyst.
- **Capabilities**: Orchestrates First Notice of Loss (FNOL) JSON schemas across PolicyCenter and ClaimCenter, implementing strict two-phase commits on general ledgers.
- **Auth**: Guidewire Cloud Authentication.

### 140. BlackbaudAgent (Non-Profit & NGO Philanthropy)
- **Role**: Raiser's Edge NXT and global donor CRM mapping specialist.
- **Capabilities**: Formulates Gift Splitting logic (Fund/Campaign/Appeal), manages anonymous donor GDPR constraints, and connects to SKY API.
- **Auth**: OAUTH2 / Webhooks.

### 141. MaerskAgent (Maritime Logistics)
- **Role**: Global ocean freight API abstraction and Electronic Bill of Lading (eBL).
- **Capabilities**: Translates DCSA Track & Trace frameworks bridging Demurrage/Detention metrics to global container ports and Terminal Operating Systems (TOS).
- **Auth**: Carrier-specific developer tokens.

### 142. VeevaSystemsAgent (Life Sciences)
- **Role**: Pharmaceutical CRM and Clinical Trial Data (CTMS) mapping.
- **Capabilities**: Integrates with Veeva Vault endpoints utilizing VQL query syntax, enforcing FDA 21 CFR Part 11 electronic signature audit trails.
- **Auth**: Managed Session Tokens.

### 143. PlaidIdentityAgent (FinTech & Open Banking Verification)
- **Role**: Bank account linkage, KYC/AML validation, and Micro-Deposit structuring.
- **Capabilities**: Transforms frontend \`public_token\`s via Plaid Link exchanging them into persistent \`access_token\`s, mapping sensitive routing/account geometries.
- **Auth**: Three-piece Client/Secret/Env keys.
### 144. SapS4HanaAgent (Enterprise ERP)
- **Role**: S/4HANA implementation and ABAP OData Gateway specialist.
- **Capabilities**: Connects Node.js to SAP routers translating ABAP structures, RFC/BAPIs, and legacy IDocs via OData v4 conventions.
- **Auth**: Basic Auth / SAP Cloud Connector.

### 145. NvidiaOmniverseAgent (3D Digital Twins)
- **Role**: Isaac Sim physics and USD syntax rendering logic.
- **Capabilities**: Deploys scalable Python networking scripts over Nucleus servers leveraging live Universal Scene Description (USD) pipelines.
- **Auth**: Bearer tokens.

### 146. SolanaRustAgent (Web3 Decentralization)
- **Role**: Ultra high-speed blockchain state management.
- **Capabilities**: Orchestrates rust-based Anchor smart contracts calculating specific Program Derived Address (PDA) spatial limits and RPC token execution payloads.
- **Auth**: Phantom Wallet / Web3 Keypairs.

### 147. FFmpegMediaAgent (Multimedia Streaming)
- **Role**: Hardware-accelerated transrating and CDN delivery.
- **Capabilities**: Calculates explicit adaptive bitrate chunk durations (MPEG-DASH/HLS) passing video pipes across CUDA NVENC cores.
- **Auth**: Signed URLs.

### 148. Hl7FhirAgent (Healthcare Interoperability)
- **Role**: Deep Medical Record translations across EPIC/Cerner lines.
- **Capabilities**: Absorbs legacy raw pipe-delimited HL7v2 arrays translating them faithfully into JSON explicitly fitting FHIR R4 \`Patient\` resources.
- **Auth**: SMART-on-FHIR Scoped Access.

### 149. Ros2RoboticsAgent (Autonomous Robotics)
- **Role**: ROS2 middleware and DDS networking logic architect.
- **Capabilities**: Writes zero-copy intra-process C++ node parameters translating URDF kinematics straight into Gazebo simulated environments.
- **Auth**: FastRTPS / DDS topologies.

### 150. AutodeskForgeAgent (AEC Engineering)
- **Role**: Design Automation and Building Information Modeling (BIM) extraction.
- **Capabilities**: Pushes Revit architectures down through Forge Model Derivative pipelines emitting raw SVF2 vectors mapped to WebGL overlays.
- **Auth**: 2-Legged / 3-Legged OAuth.

### 151. StripeTreasuryAgent (FinTech BaaS)
- **Role**: Neobanking physical card issuance and ledge accounting.
- **Capabilities**: Balances financial account ledgers wrapping idempotently around strict \`issuing_authorization\` Webhook response limits.
- **Auth**: Treasury Restricted API Tokens.

### 152. SalesforceApexAgent (Enterprise CRM)
- **Role**: Salesforce limits architect and bulk data loader.
- **Capabilities**: Bypasses synchronous DML/SOQL Governor constraints implementing batchable Apex jobs scaling to tens of millions of records.
- **Auth**: Connected App JWT Auth.

### 153. WebrtcSfuAgent (Real-Time Communication)
- **Role**: Low-level UDP topology routing (Mediasoup/Janus).
- **Capabilities**: Punctures enterprise firewalls utilizing STUN/TURN (Coturn) bridging massive multi-party spatial audio and WebRTC Simulcast layers.
- **Auth**: Secure SDP Offers.

### 154. GdprComplianceAgent (LegalTech & Privacy)
- **Role**: Data Sovereignty and encryption infrastructure mapper.
- **Capabilities**: Translates cross-border right-to-be-forgotten sweeps deleting cached primary-keys whilst implementing mathematical Vault Transit tokenization.
- **Auth**: Vault API / IAM Roles.

### 156. QiskitQuantumAgent (Quantum Computing)
- **Role**: IBM Qiskit and Superconducting Qubit specialist.
- **Capabilities**: Translates openQASM instructions targeting topological layouts via NISQ error-mitigation (ZNE) and stochastic measurement probabilities.
- **Auth**: IBM Quantum Cloud Token.

### 157. PlanetGeospatialAgent (Satellite AI)
- **Role**: Earth Observation data aggregation and SAR interpretation.
- **Capabilities**: Slices massive Cloud Optimized GeoTIFF parameters mapping synthetic aperture radar waves and NDWI indexing through STAC APIs.
- **Auth**: Planet labs API keys.

### 158. OpenAdrSmartGridAgent (Smart Grid)
- **Role**: Energy Virtual Power Plant (VPP) architecture controller.
- **Capabilities**: Orchestrates distributed IoT load shedding responding instantly to OpenADR frequency deviation schemas across utility VEN nodes.
- **Auth**: Mutual TLS (mTLS) RSA-2048 certs.

### 159. FpgaHftTradingAgent (Algorithmic Finance)
- **Role**: Ultra-low latency trading hardware compiler.
- **Capabilities**: Transpiles deep tick-to-trade quantitative logic directly into Verilog/VHDL gate arrays manipulating exact limit order books inside FPGA BRAM.
- **Auth**: DPDK / FIX Protocol tunnels.

### 160. NextflowGenomicsAgent (Bioinformatics)
- **Role**: Computational genetic sequencing workflow orchestrator.
- **Capabilities**: Maps explicit DAG structures aligning 100GB+ FASTQ reads utilizing BWA-MEM mappings writing heavily annotated VCF outputs.
- **Auth**: AWS Batch / HPC Slurm keys.

### 161. WasmWasiAgent (WebAssembly Edge)
- **Role**: Near-native sandboxed systems execution engine.
- **Capabilities**: Bridges Rust `wasm32-wasi` Compilation targets allowing serverless CloudFlare/WasmEdge environments to mimic Linux system calls explicitly.
- **Auth**: Zero-Trust Host imports.

### 162. GhidraReversingAgent (Cybersecurity)
- **Role**: Static malware analysis and Zero-Day unpacked payloads.
- **Capabilities**: Scripting deep NSA Ghidra logic mapping x86 decompilation stack boundaries exposing obfuscated Entry Points and Control Flow Graphs.
- **Auth**: De-obfuscated ELF/PE permissions.

### 163. CcsdsTelemetryAgent (Aerospace Engineering)
- **Role**: Interplanetary flight software standard mappings.
- **Capabilities**: Bit-packs raw NASA AMMOS arrays converting cyclically redundant orbital transfer frames adhering strictly to CCSDS DSN schemas.
- **Auth**: Ground Station Telecommand logic.

### 164. OcppEvChargingAgent (Electric Vehicles)
- **Role**: CSMS (Charging Station Management System) network controller.
- **Capabilities**: Balances V2G (Vehicle-to-Grid) grid stabilization algorithms tracking volatile OCPP WebSockets managing real-time ISO 15118 charge profiles.
- **Auth**: Secure WSS (WebSocket over SSL).

### 165. ZephyrRtosAgent (Embedded Hardware)
- **Role**: Bare-metal Cortex-M device thread orchestrator.
- **Capabilities**: Composes strict Device Tree hardware HAL abstractions passing real-time determinism limits across priority inverted Semaphore contexts.
- **Auth**: Silicon bootloader JTAG.

### 166. PdalPointcloudAgent (LiDAR Spatiality)
- **Role**: Large scale Topographic matrix extraction.
- **Capabilities**: Decimates hundred-million node dense unstructured LAS arrays orchestrating Structure from Motion (SfM) pipelines with Point Data Abstraction topologies.
- **Auth**: WebDAV / Cloud storage matrices.

### 167. QuantlibPricingAgent (Quantitative Finance)
- **Role**: Exotic Options Monte Carlo pathway simulator.
- **Capabilities**: Maps Black-Scholes boundaries and local-volatility matrices estimating infinite-dimensional pricing graphs through Longstaff-Schwartz regressions.
- **Auth**: Real Time datafeed access.

### 168. SbolSyntheticBioAgent (Synthetic Biology)
- **Role**: BioCAD standard sequence configuration architect.
- **Capabilities**: Defines exact Single-Guide RNA targets enforcing XML parameter compliance via the Synthetic Biology Open Language mapping strict CRISPR circuits.
- **Auth**: Benchling / NCBI BLAST sequences.

### 169. OpcuaScadaAgent (Industrial Control Systems)
- **Role**: Factory 4.0 IoT bridging systems mapper.
- **Capabilities**: Parses explicitly deep OT (Operational Technology) Siemens PLCs through Modbus RTU telemetry emitting strictly Deadband-filtered OPC UA subscription arrays.
- **Auth**: SCADA DMZ networks.

### 170. HomomorphicEncryptionAgent (Applied Cryptography)
- **Role**: Mathematically encrypted ciphertext computation logic.
- **Capabilities**: Configures CKKS / BFV FHE schemes tracking explicitly deep Noise Budgets allowing polynomial arrays to add/multiply blindly without Decryption arrays.
- **Auth**: Microsoft SEAL abstractions.

### 171. QnxAutosarAgent (Automotive Systems)
- **Role**: Safety-critical vehicle OS telemetrics.
- **Capabilities**: Manages strict QNX Neutrino RTOS partitioning mapping AUTOSAR logic across ISO-26262 compliant CAN FD bus topologies.
- **Auth**: Silicon bootloader encryption keys.

### 172. VaspMaterialsAgent (Materials Science)
- **Role**: Density Functional Theory calculations.
- **Capabilities**: Configures VASP INCAR/POSCAR parameterization mapping solid-state crystal lattice structures and Phonon dispersion curves.
- **Auth**: Remote HPC Slurm nodes.

### 173. CesmClimateAgent (Climatology)
- **Role**: Macro earth system modeling.
- **Capabilities**: Resolves Fortran-90 Navier-Stokes grids executing explicit Thermodynamic oceanic/atmospheric phase coupling arrays via the CESM simulator.
- **Auth**: NetCDF binary dataset permissions.

### 174. EpicsFusionAgent (Nuclear Fusion)
- **Role**: Magnetic plasma containment operator.
- **Capabilities**: Manages deep EPICS soft real-time Channel Access variables reacting sub-millisecond to Tokamak vertical displacement vectors.
- **Auth**: Particle Accelerator hardware networks.

### 175. ObspySeismologyAgent (Geophysics)
- **Role**: Continental plate tectonic and P-Wave plotting.
- **Capabilities**: Filters massive broadband SEED matrices via ObsPy tracking distinct S-Wave phase shifts identifying subterranean epicenter loci.
- **Auth**: Global Seismographic Network APIs.

### 176. OpenfoamCfdAgent (Fluid Dynamics)
- **Role**: Aerodynamic turbulence mesh solver.
- **Capabilities**: Drives C++ OpenFOAM DES/RANS equations mapping kinematic viscosity boundaries securely across millions of blockMesh cells.
- **Auth**: Cluster MPI environments.

### 177. LoihiNeuromorphicAgent (Neuromorphic AI)
- **Role**: Asynchronous Spiking Neural Network (SNN) architect.
- **Capabilities**: Bridges standard PyTorch layers into biologically accurate STDP synapse models targeting explicit Intel Loihi hardware gates.
- **Auth**: Neuromorphic research clusters.

### 178. GaussianChemistryAgent (Computational Chemistry)
- **Role**: Molecular orbital and transition state analysis.
- **Capabilities**: Formulates explicit Hartree-Fock quantum probabilities mapping organic reaction intrinsic coordinates (IRC) across theoretical energy saddle points.
- **Auth**: Quantum chemistry lab licenses.

### 179. RootCernAgent (High-Energy Physics)
- **Role**: Hadron particle collision array parser.
- **Capabilities**: Shreds CERN ROOT TTree datasets plotting invariant mass Lorentz scalars isolating massive multi-muon decay cascades statistically.
- **Auth**: Large Hadron Collider GRID certificates.

### 180. MonaiDicomAgent (Medical AI)
- **Role**: Neural Network 3D Radiology Segmentor.
- **Capabilities**: Transposes heterogeneous hospital DICOM pixels into spatial UNet tensor voxels mapping automated MRI abnormality geometries.
- **Auth**: HL7/FHIR de-identified token access.

### 181. Qiime2MetagenomicsAgent (Microbiome Genetics)
- **Role**: Soil/Gut bacteria sequencing mapper.
- **Capabilities**: Distills 16S rRNA Illumina reads utilizing DADA2 filtering to output explicitly un-weighted UniFrac biodiversity matrices.
- **Auth**: Genomics Cloud/NCBI.

### 182. EpimodelDiseaseAgent (Epidemiology)
- **Role**: Temporal infection network predictor.
- **Capabilities**: Integrates compartmental SIR arrays mapping stochastic transmission vector possibilities evaluating explicit mathematical pandemic R0 decay.
- **Auth**: Public health database connections.

### 183. OpenbciEegAgent (Brain-Computer Interfaces)
- **Role**: Real-time electroencephalogram processor.
- **Capabilities**: Applies extreme independent component analysis (ICA) stripping facial telemetry filtering explicitly defined alpha motor cortex triggers.
- **Auth**: Local USB diagnostic boards.

### 184. LorawanAgtechAgent (Precision Agriculture)
- **Role**: Extreme-range low-voltage telemetry tracking.
- **Capabilities**: Calculates sub-GHz chirp spreading factors maximizing battery yields against soil nitrogen sensing algorithms across 15km grids.
- **Auth**: The Things Network (TTN) gateways.

### 185. AcousticRovAgent (Deep Sea Robotics)
- **Role**: Oceanic hydro-acoustic telecommand architecture.
- **Capabilities**: Abstracts micro-packet UDP arrays overcoming latency transmitting Doppler Velocity Log trajectories mapping abyssal trenches.
- **Auth**: Ship-to-Submersible modems.

### 186. OpenroadEdaAgent (Semiconductor Design)
- **Role**: Abstract logic to physical silicon rendering.
- **Capabilities**: Synthesizes formal Verilog architectures through Yosys and SPICE timing loops constructing physical silicon wafer GDSII plots.
- **Auth**: Multi-Project Wafer NDA nodes.

### 187. DwdmOpticalAgent (Telecommunications Layer 0)
- **Role**: Long-Haul subsea fiber optics multiplexer.
- **Capabilities**: Configures SDN ROADM transceivers assigning explicit ITU-T Grid photonic wavelengths preventing chromatic signal dispersion.
- **Auth**: Telecom Network Operation Centers.

### 188. Arinc429AvionicsAgent (Aviation Systems)
- **Role**: Critical DO-178C avionics software structurer.
- **Capabilities**: Translates digital flight management computer telemetry executing 100% Modified Condition/Decision Coverage safety checks.
- **Auth**: AFDX partitioned network rings.

### 189. StratumMiningAgent (Cryptocurrency Architecture)
- **Role**: Energy arbitrage and ASIC Proof-of-Work balancing.
- **Capabilities**: Directs AEAD encrypted multi-node Stratum V2 hashes optimizing local grid electrical demand against dynamically calculated SHA-256 rewards.
- **Auth**: Global Mining Pool keys.

### 190. Iec61850SubstationAgent (High Voltages Grids)
- **Role**: Power Bay transformer control telemetry.
- **Capabilities**: Authors protective real-time GOOSE multicasts identifying localized power trips securing transformers milliseconds before kinetic overload.
- **Auth**: Substation SCADA DMZ.

### 191. Slic3r3dprintAgent (Additive Manufacturing)
- **Role**: G-Code path rendering execution.
- **Capabilities**: Transposes CAD meshes into gyroid infill algorithms parsing intricate multi-extruder kinematic trajectories tracking molten flow constants.
- **Auth**: FDM/SLA local web-servers.

### 192. GurobiOptimizationAgent (Logistics / Operations Research)
- **Role**: Mixed-Integer Linear Programming executor.
- **Capabilities**: Calculates extreme Simplex topologies solving capacitated Vehicle Routing Problems navigating hundreds of supply chain temporal variables.
- **Auth**: Academic/Enterprise Solver keys.

### 193. VolatilityForensicsAgent (Cyber DFIR)
- **Role**: Fileless resident malware tracking.
- **Capabilities**: Evaluates live RAM page-tables exposing Unlinked virtual addressing tracking mathematically obfuscated powershell injections.
- **Auth**: Raw E01 Memory Dumps.

### 194. ProphetActuarialAgent (Life Insurance Risk)
- **Role**: Solvency II Liability flow projections.
- **Capabilities**: Generates multi-decade mortality assumption curves tracking explicit ALM stochastic variables defining absolute bankruptcy boundaries.
- **Auth**: Proprietary demographic tables.

### 195. EssentiaAudioAgent (Acoustic Informatics)
- **Role**: Algorithmic music frequency breakdown.
- **Capabilities**: Calculates complex Short-Time Fourier Transforms extracting physical Mel-Frequency Cepstral variables tracking harmonic BPM transients.
- **Auth**: Open audio datasets.

### 196. SumoTrafficAgent (Municipal Civil Engineering)
- **Role**: City-scale vehicle micro-simulation.
- **Capabilities**: Manages complex Intelligent Driver Models (IDM) resolving continuous trajectory routing parsing explicit intersection edge yields.
- **Auth**: OpenStreetMap nodes.

### 197. NltkLinguisticsAgent (Natural Language Parsing)
- **Role**: Formal semantics and Context-Free Grammar.
- **Capabilities**: Traverses multi-node syntactic dependency structures processing deterministic lexical lemmas tracking morphological roots.
- **Auth**: Standalone textual corpus dictionaries.

### 198. HawkeyeSportsAgent (Kinematics Tracking)
- **Role**: Stereoscopic physical trajectory array.
- **Capabilities**: Solves extremely high-speed Magnus Effect differential math modeling absolute three-dimensional baseball spin-rates from overlapping lenses.
- **Auth**: Multi-camera hardware loops.

### 199. OrekitAstrodynamicsAgent (Orbital Mechanics)
- **Role**: Low Earth ephemeris perturbation math.
- **Capabilities**: Integrates continuous numerical vectors factoring Lunar/Solar gravitational drag explicitly calculating J2000 to Earth-Centered matrices.
- **Auth**: DoD/NASA tracking APIs.

### 200. Bb84QkdAgent (Quantum Cybersecurity)
- **Role**: Entangled photon polarization cryptography.
- **Capabilities**: Models absolute Single-Photon avalanche diode noise distilling impenetrable symmetric encryption keys checking explicitly for quantum Decoy States.
- **Auth**: Fiber-optic network switch hardware.
