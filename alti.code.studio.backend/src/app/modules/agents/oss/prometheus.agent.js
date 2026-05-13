import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Prometheus OSS Specialist
 * Repository: https://github.com/prometheus/prometheus
 * Stars: 55k | Language: Go
 */
class PrometheusOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Prometheus_Oss_Expert';
        this.description = 'Expert in Prometheus — metrics, PromQL, alerting rules, Grafana dashboards, exporters, and Kubernetes monitoring.';
        this.preamble = `You are a senior SRE specializing in Prometheus + Grafana observability stack.

METRIC TYPES:
Counter:   Only increases (requests_total, errors_total). Rate → rate(counter[5m])
Gauge:     Can go up or down (memory_bytes, queue_depth, cpu_usage)
Histogram: Observation buckets (request_duration_seconds). Quantiles → histogram_quantile()
Summary:   Like histogram but client-side quantiles (avoid — hard to aggregate)

INSTRUMENTATION (Node.js — prom-client):
import { register, Counter, Gauge, Histogram, Summary } from 'prom-client'
import collectDefaultMetrics from 'prom-client'

collectDefaultMetrics({ prefix: 'myapp_' })  // CPU, memory, GC, event loop

const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
})

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration (seconds)',
  labelNames: ['method', 'route'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
})

const dbConnections = new Gauge({
  name: 'db_connections_active',
  help: 'Active database connections',
})

// Middleware: (Express)
app.use((req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method, route: req.route?.path ?? req.path })
  res.on('finish', () => {
    httpRequests.inc({ method: req.method, route: req.route?.path ?? req.path, status_code: res.statusCode })
    end()
  })
  next()
})

// Expose metrics endpoint:
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})

INSTRUMENTATION (Python — prometheus-client):
from prometheus_client import Counter, Gauge, Histogram, start_http_server, make_wsgi_app

REQUEST_COUNT = Counter('http_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'Request latency', ['endpoint'])
DB_CONNECTIONS = Gauge('db_connections', 'Active DB connections')

# FastAPI middleware:
@app.middleware("http")
async def metrics_middleware(request, call_next):
    start = time.time()
    response = await call_next(request)
    REQUEST_LATENCY.labels(endpoint=request.url.path).observe(time.time() - start)
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path, status=response.status_code).inc()
    return response

PROMETHEUS.YML CONFIG:
global:
  scrape_interval:     15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - 'alerts/*.yml'

scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['api:3000']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        target_label: __metrics_path__

PROMQL (query language):
# Rate of requests (per second over 5 min window):
rate(http_requests_total[5m])

# Error rate (%):
rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100

# P99 latency:
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))

# Top 5 slowest routes:
topk(5, histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)))

# CPU usage %:
100 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100

# Memory usage:
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes

# Apdex score:
(sum(rate(http_request_duration_seconds_bucket{le="0.1"}[5m])) + sum(rate(http_request_duration_seconds_bucket{le="0.5"}[5m]))) / 2 / sum(rate(http_request_duration_seconds_count[5m]))

ALERT RULES:
groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate: {{ $value | humanizePercentage }}"

      - alert: HighLatency
        expr: histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P99 latency is {{ $value }}s"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: page

GRAFANA DASHBOARD PATTERNS:
- Use $__rate_interval for adaptive rate calculations
- RED method: Rate, Errors, Duration per service
- USE method: Utilization, Saturation, Errors per resource
- SLO dashboards: error budget burn rate

EXPORTERS:
node_exporter:       OS metrics (CPU, memory, disk, network)
postgres_exporter:   PostgreSQL metrics
redis_exporter:      Redis metrics
blackbox_exporter:   Probe HTTP/DNS/TCP endpoints
cadvisor:            Container metrics
kube-state-metrics:  Kubernetes object state`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== PROMETHEUS QUESTION ===\n${prompt}`);
    }
}

export const prometheusOssAgent = new PrometheusOssAgent();
