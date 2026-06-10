# MARKETPLACE PRICING & TIERING STRATEGY

Inso Code supports native hyperscaler billing via the AWS Marketplace, Azure Marketplace, and Google Cloud Marketplace.

## 1. INFRASTRUCTURE COSTS (PAID TO HYPERSCALER)
The BYOC Data Plane utilizes highly specialized, military-grade cloud resources. The customer pays their cloud provider (AWS/Azure/GCP) directly for the underlying compute.

*Estimated Infrastructure Baselines:*
- **Standard Confidential:** ~$5,000 / month (Standard SGX/SEV nodes).
- **Physical Air-Gapped:** ~$25,000 / month (AWS Outposts, Azure Stack Hub).
- **Zenith Space-Linked:** ~$150,000+ / month (Requires Satellite Downlink Leasing and dedicated dark fiber).

## 2. SOFTWARE LICENSING (BILLED VIA MARKETPLACE)

### Tier 1: SaaS Pay-As-You-Go (PAYG) Metered Billing
Designed for elastic workloads. Billing is handled natively through the Cloud Provider's metering APIs (e.g., AWS Metering Service, Azure Marketplace API).
- **Control Plane Orchestration:** $0.50 per 1M Tokens processed.
- **Support:** Standard Business Hours.
- *Billed seamlessly on your monthly AWS/Azure/GCP invoice.*

### Tier 2: Bring Your Own License (BYOL) - Enterprise Annual
Designed for massive-scale enterprise deployments utilizing the God-Tier and Zenith architectures.
- **Platform Fee:** $120,000 / year (Fixed fee covering the Liberty Center One mTLS tether).
- **Unlimited Usage:** No per-token metering.
- **Support:** 24/7/365 Dedicated SRE line.
- *Customer negotiates the license directly with Inso Code, then imports the License Key into the Marketplace deployment wizard.*

## 3. PROFESSIONAL SERVICES (OPTIONAL)
For deploying the **Disconnected Air-Gapped** or **Zenith Space-Linked** architectures, Inso Code provides specialized clearance-holding engineers to assist with physical rack delivery, dark fiber routing, and satellite configuration.
- **Rate:** $500 / hour, billed via Private Marketplace Offers.
