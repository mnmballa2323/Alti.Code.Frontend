# Release Notes — v4.0.0 "The Industry Armada"

**Release Date:** 2026-02-21
**Type:** Major Release

---

## 🎉 What's New

### 🏢 16 Industry Verticals — 245+ Specialist Agents

Version 4.0 expands Inso Code from a general-purpose engineering platform into a **full-spectrum industry intelligence platform** — with deep, specialized agents for 16 distinct industry sectors.

---

### 🏠 Real Estate & PropTech (Phase 7)

| Agent | Specialty |
|-------|-----------|
| **Zillow Expert** | Bridge Interactive MLS API, Zestimate AVM, Walk Score, GreatSchools |
| **Buildium Expert** | Property/unit/lease/tenant CRUD, rent + GL accounting, maintenance lifecycle |
| **Procore Expert** | Construction RFIs, Submittals, Daily Logs, Budget/change orders, Punch List |
| **Guesty Expert** | STR/Airbnb channel manager, calendar blocking, dynamic pricing, guest messaging |
| **ATTOM Expert** | Property AVM + FSD confidence, sale comps (CMA), FEMA flood/wildfire/EQ risk |

---

### 📚 EdTech & Education (Phase 8)

| Agent | Specialty |
|-------|-----------|
| **Canvas LMS Expert** | PKCE OAuth2, grade passback, Module sequencing, LTI 1.3 AGS |
| **Google Classroom Expert** | Coursework ASSIGNMENT/MCQ, Pub/Sub push notifications |
| **Zoom SDK Expert** | Meeting + Video SDK, webinars, cloud recordings, HMAC webhook |
| **D2L Brightspace Expert** | GradeBook PointsNumerator, SCORM upload+tracking, BDP analytics |

---

### 🔐 Cybersecurity & Threat Intel (Phase 9)

| Agent | Specialty |
|-------|-----------|
| **VirusTotal Expert** | File/URL/IP scan, YARA Livehunt, MITRE ATT&CK sandbox, IOC pivot |
| **Shodan Expert** | Host lookup (ports/CVEs/SSL), advanced search, continuous monitoring |
| **CrowdStrike Falcon Expert** | Detections API, RTR remote commands, host containment, custom IOC |
| **Splunk Expert** | SPL queries, HEC ingestion, saved search cron alerts, KV Store, SOAR |
| **Have I Been Pwned Expert** | k-anonymity Pwned Passwords, email breach, domain monitoring |

---

### 📊 Marketing & Analytics

| Agent | Specialty |
|-------|-----------|
| **HubSpot CRM Expert** | Contacts/deals/pipeline, custom properties, HMAC-SHA256-v3 webhooks |
| **Klaviyo Expert** | Revision-header API, ecommerce Flows (abandoned cart/winback), SMS |
| **Segment CDP Expert** | Identify/Track/Page/Group, 300+ destinations, Profiles API, Protocols |
| **Mixpanel Expert** | $insert_id deduplication, People profiles, funnel/cohort, JQL, NDJSON export |

---

### 💰 FinTech Depth Additions

- **Alpha Vantage Expert** — 50+ technical indicators (RSI/MACD/BBANDS/ATR), fundamental data, forex, crypto, news sentiment
- **Stripe Treasury Expert** — Financial accounts, InboundTransfer ACH, Issuing virtual card with spending_limits

---

### 🎮 Gaming Depth Addition

- **Agora Expert** — AccessToken2, in-game voice chat, Spatial Audio 3D positioning, Cloud Recording composite (S3), RTMP push to Twitch/YouTube

---

### 🗺️ Phase 11 — Orchestrator Wiring

The `capability.router.js` now has **141 keyword routes** (up from 114), with 22 new entries covering all Phase 7-10 industry agents. Zero-config auto-routing:

```
Query: "How do I block a Guesty calendar for cleaning?"      → GuestyAgent
Query: "Write a YARA rule for CobaltStrike beacon"           → VirusTotalAgent  
Query: "Set up LTI 1.3 grade passback in Canvas LMS"        → CanvasLmsAgent
Query: "Alpha Vantage MACD crossover signal"                 → AlphaVantageAgent
Query: "CrowdStrike RTR remote session collect artifacts"    → CrowdStrikeAgent
```

---

## 📖 New Documentation

| Document | Description |
|----------|-------------|
| [`INDUSTRY_AGENTS.md`](INDUSTRY_AGENTS.md) | Deep-dive auth, API, SDK, and env var reference for all 16 verticals |
| [`AGENTS.md`](AGENTS.md) | Updated full agent roster (245+ agents, 16 verticals, 141 routes) |
| Monorepo `README.md` | Updated to v4.0 "The Industry Armada" |

---

## 📋 Breaking Changes

None — all changes are backward compatible additions.

---

## 🧪 Platform Statistics

| Metric | v3.0 | v4.0 | Change |
|--------|------|------|--------|
| Total Agents | 120+ | **245+** | +125 |
| Industry Verticals | 0 | **16** | +16 |
| Capability Router Routes | 114 | **141** | +27 |
| Showcase Sections | 4 | **16** | +12 |
| Cloud Providers | 21 | 21 | — |
| Programming Languages | 46 | 46 | — |

---

## 🔜 What's Next (v4.1.0)

- **DevSecOps Vertical**: Snyk, Semgrep, OWASP ZAP, SonarQube
- **Supply Chain & Logistics**: FedEx/UPS API, ShipBob, Flexport, SAP Ariba
- **Agent Quality Scoring**: Promptfoo A/B testing for agent preamble optimization
