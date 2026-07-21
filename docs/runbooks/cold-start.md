# Cloud Run Cold Start Latency Spike

## Severity: P2
## Detection
- **Cloud Monitoring metric**: `run.googleapis.com/request_latencies` p99 > 10,000ms
- **Instance scaling events**: `run.googleapis.com/container/instance_count` shows rapid scale-from-zero
- **Alerting policy**: `inso-code-cold-start-latency` fires on sustained p99 > 10s
- **Dashboard**: Check **Inso Code — API Performance** dashboard, panel "Request Latency Percentiles"
- **User reports**: First requests after idle periods are extremely slow

## Symptoms
- First API request after a period of inactivity takes 10–30 seconds
- Users experience "loading forever" on first interaction
- Cloud Run logs show long gaps between `Container started` and first request handled
- Lighthouse scores drop due to slow TTFB on server-rendered pages
- Health check endpoints intermittently timeout during scale-up

## Root Cause
- **min-instances=0**: No warm instances available; every scale-up event requires a full cold start
- **Large container image**: Image size > 500MB causes slow pull from Artifact Registry
- **Heavy initialization**: Application loads large models, connects to multiple databases, or runs migrations on startup
- **No CPU boost**: Container starts at reduced CPU allocation, slowing initialization
- **VPC connector startup**: Serverless VPC Access connector adds network setup latency
- **Dependency resolution**: Node.js `require()` chains loading hundreds of modules at startup

## Immediate Response (< 5 min)
1. **Check current instance count and scaling config**:
   ```bash
   gcloud run services describe inso-code-backend \
     --region=us-central1 --project=inso-code \
     --format="value(spec.template.metadata.annotations['autoscaling.knative.dev/minScale'],spec.template.metadata.annotations['autoscaling.knative.dev/maxScale'])"
   ```
2. **Set min-instances immediately** to keep warm instances:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --min-instances=2 \
     --project=inso-code
   ```
3. **Enable CPU boost** for faster startup:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --cpu-boost \
     --project=inso-code
   ```
4. **Check container image size**:
   ```bash
   gcloud artifacts docker images describe \
     us-central1-docker.pkg.dev/inso-code/alti-images/inso-code-backend:latest \
     --project=inso-code
   ```

## Resolution
1. **Set appropriate min-instances** based on traffic patterns:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --min-instances=3 \
     --max-instances=50 \
     --cpu-boost \
     --project=inso-code
   ```

2. **Optimize container image size** — switch to a slim base:
   ```dockerfile
   # In Dockerfile — use multi-stage build
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build

   FROM node:20-alpine AS runner
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/node_modules ./node_modules
   CMD ["node", "dist/main.js"]
   ```
   Then rebuild and deploy:
   ```bash
   gcloud builds submit --tag us-central1-docker.pkg.dev/inso-code/alti-images/inso-code-backend:latest \
     --project=inso-code
   gcloud run deploy inso-code-backend \
     --image=us-central1-docker.pkg.dev/inso-code/alti-images/inso-code-backend:latest \
     --region=us-central1 --project=inso-code
   ```

3. **Defer heavy initialization** — lazy-load non-critical modules:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --update-env-vars="LAZY_LOAD_AI_MODELS=true,DEFER_DB_MIGRATIONS=true" \
     --project=inso-code
   ```

4. **Configure startup probe** to signal readiness properly:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --startup-cpu-boost \
     --cpu-throttling=false \
     --project=inso-code
   ```

5. **Enable session affinity** to reduce repeated cold starts per user:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --session-affinity \
     --project=inso-code
   ```

## Verification
- Measure p99 latency over the next 30 minutes:
  ```bash
  gcloud monitoring metrics read \
    "run.googleapis.com/request_latencies" \
    --project=inso-code --interval="30m" \
    --filter='resource.labels.service_name="inso-code-backend"'
  ```
- Confirm min-instances are running:
  ```bash
  gcloud run services describe inso-code-backend \
    --region=us-central1 --format="value(status.traffic[0].latestRevision)"
  ```
- Test cold-start time by deploying a new revision and timing first request
- Verify container startup time in Cloud Run logs: look for `Listening on port` timestamp

## Prevention
- Maintain `min-instances >= 2` for production services
- Keep container images < 300MB using multi-stage Docker builds
- Always enable `--cpu-boost` for latency-sensitive services
- Implement lazy loading for heavy dependencies (AI SDKs, analytics)
- Use Cloud Scheduler to send keep-alive pings during low-traffic periods:
  ```bash
  gcloud scheduler jobs create http alti-keepalive \
    --schedule="*/5 * * * *" \
    --uri="https://api.alticode.studio/api/health" \
    --http-method=GET \
    --project=inso-code
  ```
- Profile and optimize application startup time as part of CI/CD

## Escalation
- **If p99 latency remains > 10s after min-instances fix**: Escalate to backend engineering
- **If container pull times are slow**: Check Artifact Registry status; open GCP support case
- **If VPC connector is the bottleneck**: Escalate to platform/networking team
- **Slack channel**: `#alti-incidents`
- **Runbook owner**: Platform Engineering team
