# Alti Code Studio — Service Level Objectives

## Platform SLOs

| SLO | Target | Measurement | Alert Threshold |
|-----|--------|-------------|----------------|
| **Availability** | 99.9% (8.7h downtime/year) | Successful requests / total requests | <99.5% over 5 min → P1 |
| **Latency (p50)** | < 200ms | Cloud Run request latency | >500ms over 5 min → P3 |
| **Latency (p99)** | < 2s | Cloud Run request latency | >5s over 5 min → P2 |
| **Error Rate** | < 0.1% | 5xx responses / total responses | >1% over 5 min → P1 |
| **AI Inference** | < 3s (p95) | Vertex AI prediction latency | >10s over 5 min → P2 |

## Error Budget Policy

- **Monthly budget**: 0.1% of requests may fail (99.9% target)
- **Budget consumed 50%**: Review recent deployments
- **Budget consumed 80%**: Freeze non-critical deployments
- **Budget consumed 100%**: All hands on reliability, no feature work

## Per-Tier SLOs

| Tier | Availability | Latency p99 | Support Response |
|------|-------------|-------------|------------------|
| **SaaS (Cloud)** | 99.9% | 2s | 1 hour |
| **BYOC (Enterprise)** | 99.95% | 1s | 30 min |
| **Air-Gap (Gov/DoD)** | 99.99% | 500ms | 15 min |
