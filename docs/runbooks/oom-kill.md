# Out of Memory (OOM Kill) on Cloud Run

## Severity: P2
## Detection
- **Cloud Run metrics**: `run.googleapis.com/container/memory/utilizations` > 95% sustained
- **Container restarts**: `run.googleapis.com/container/instance_count` shows repeated scaling with short-lived instances
- **Log entry**: `Memory limit of XXX MiB exceeded with YYY MiB used. Consider increasing the memory limit.`
- **Alerting policy**: `inso-code-oom-alert` fires in Cloud Monitoring
- **Dashboard**: Check **Inso Code — Resource Utilization** dashboard

## Symptoms
- Cloud Run instances restart frequently (visible in Revision details)
- API responses return `503 Service Unavailable` during restarts
- Users experience intermittent errors — requests succeed on healthy instances, fail on OOM'd ones
- Cloud Run logs show `terminated: container memory usage exceeded limit`
- Node.js `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory`

## Root Cause
- **Memory leak**: Unreleased references in long-lived objects (event listeners, closures, caches)
- **Large payload processing**: Unbounded file uploads or large AI response bodies held in memory
- **Unbounded in-memory cache**: Application-level caches (LRU, Map) growing without eviction
- **Concurrency spike**: Too many concurrent requests each holding significant memory
- **Node.js heap defaults**: V8 heap limit not set, defaults to ~1.5 GB which may exceed container limit
- **Large dependency tree**: Heavy npm packages loaded at startup consuming base memory

## Immediate Response (< 5 min)
1. **Confirm OOM is occurring** — check recent logs:
   ```bash
   gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="inso-code-backend" AND textPayload=~"memory"' \
     --project=inso-code --limit=20 --freshness=10m
   ```
2. **Check current memory allocation**:
   ```bash
   gcloud run services describe inso-code-backend \
     --region=us-central1 --format="value(spec.template.spec.containers[0].resources.limits.memory)"
   ```
3. **Temporarily increase memory limit** to stop the bleeding:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --memory=2Gi \
     --project=inso-code
   ```
4. **Scale max instances down** if a runaway leak is suspected:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --max-instances=5 \
     --project=inso-code
   ```

## Resolution
1. **Set Node.js heap limit** to stay within container memory:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --update-env-vars="NODE_OPTIONS=--max-old-space-size=1536" \
     --memory=2Gi \
     --project=inso-code
   ```

2. **Identify the leak** — enable heap profiling in a staging environment:
   ```bash
   # Add heap snapshot endpoint (staging only)
   gcloud run services update inso-code-backend-staging \
     --region=us-central1 \
     --update-env-vars="ENABLE_HEAP_PROFILING=true" \
     --project=inso-code
   ```
   Then capture a heap snapshot:
   ```bash
   curl -s https://staging-api.alticode.studio/debug/heapdump > heap.heapsnapshot
   ```
   Open in Chrome DevTools → Memory tab → Load snapshot → Look for retained objects.

3. **If caused by large payloads** — add streaming and size limits:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --update-env-vars="MAX_REQUEST_BODY_SIZE=10485760,STREAM_AI_RESPONSES=true" \
     --project=inso-code
   ```

4. **If caused by unbounded cache** — set max cache size or switch to Redis:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --update-env-vars="IN_MEMORY_CACHE_MAX_MB=256,USE_REDIS_CACHE=true" \
     --project=inso-code
   ```

5. **Right-size the container** after fixing the root cause:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --memory=1Gi \
     --cpu=2 \
     --concurrency=80 \
     --project=inso-code
   ```

## Verification
- Monitor memory utilization for 30 minutes — should stay below 80%:
  ```bash
  gcloud monitoring metrics list --filter='metric.type="run.googleapis.com/container/memory/utilizations"' \
    --project=inso-code
  ```
- Confirm zero container restarts:
  ```bash
  gcloud run revisions list --service=inso-code-backend \
    --region=us-central1 --project=inso-code --limit=5
  ```
- Run a load test against staging to validate the fix under pressure
- Check error rate returns to baseline on the dashboard

## Prevention
- Always set `NODE_OPTIONS=--max-old-space-size=<75% of container memory>`
- Enforce `MAX_REQUEST_BODY_SIZE` limits on all endpoints
- Use Memorystore Redis for caching instead of in-memory caches
- Stream large AI responses instead of buffering entire responses
- Set up memory utilization alerts at 75% and 90% thresholds
- Run periodic load tests with memory profiling enabled
- Add `--cpu-boost` to reduce startup memory pressure:
  ```bash
  gcloud run services update inso-code-backend \
    --region=us-central1 --cpu-boost --project=inso-code
  ```

## Escalation
- **After 10 min of repeated OOM**: Page the on-call backend engineer
- **If memory leak is confirmed but source unknown**: Escalate to senior backend engineer
- **If caused by Vertex AI SDK memory issue**: File a bug on the `google-cloud-node` GitHub repo
- **Slack channel**: `#alti-incidents`
- **Runbook owner**: Backend Engineering team
