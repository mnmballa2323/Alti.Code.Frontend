# Vertex AI Quota Exhaustion

## Severity: P1
## Detection
- **HTTP 429 errors**: `googleapi: Error 429: Resource exhausted` in application logs
- **Cloud Monitoring metric**: `serviceruntime.googleapis.com/quota/exceeded` for Vertex AI
- **Alerting policy**: `inso-code-vertex-quota-exhausted` fires on repeated 429s
- **Dashboard**: Check **Inso Code — AI Pipeline** dashboard, panel "Vertex AI Error Rate"
- **User reports**: AI-powered features (code analysis, generation, chat) return errors or timeouts

## Symptoms
- AI features return `"error": "Model temporarily unavailable"` or generic 500s
- Vertex AI calls fail with `RESOURCE_EXHAUSTED: Quota exceeded for aiplatform.googleapis.com`
- Response latency spikes as retry logic kicks in before ultimately failing
- Users see "AI features are temporarily degraded" banners
- Background AI jobs (code review, analysis) stop progressing

## Root Cause
- **Traffic spike**: Sudden surge in user requests triggering high volume of Vertex AI calls
- **Inefficient prompts**: Large context windows or redundant prompts consuming tokens rapidly
- **Missing prompt caching**: Identical system prompts re-sent without leveraging Vertex AI context caching
- **Retry storms**: Aggressive retry logic amplifying failed requests into quota exhaustion
- **Quota not scaled**: Project quota not increased to match growth in active users
- **Batch job overlap**: Scheduled batch analysis jobs running concurrently with peak user traffic

## Immediate Response (< 5 min)
1. **Confirm quota exhaustion**:
   ```bash
   gcloud logging read 'resource.type="aiplatform.googleapis.com/Endpoint" AND severity>=ERROR AND textPayload=~"RESOURCE_EXHAUSTED"' \
     --project=inso-code --limit=20 --freshness=10m
   ```
2. **Check current quota usage**:
   ```bash
   gcloud alpha services quota list \
     --service=aiplatform.googleapis.com \
     --project=inso-code \
     --filter="metric:aiplatform.googleapis.com"
   ```
3. **Enable degraded mode** — disable non-critical AI features:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --update-env-vars="AI_DEGRADED_MODE=true,DISABLE_BACKGROUND_ANALYSIS=true" \
     --project=inso-code
   ```
4. **Kill non-essential batch jobs** consuming quota:
   ```bash
   # Cancel running batch prediction jobs
   gcloud ai batch-prediction-jobs list \
     --region=us-central1 --project=inso-code \
     --filter="state=JOB_STATE_RUNNING" --format="value(name)" | \
     xargs -I{} gcloud ai batch-prediction-jobs cancel {}
   ```

## Resolution
1. **Request a quota increase** (takes effect in minutes to hours):
   ```bash
   # Via Console: IAM & Admin → Quotas → filter "aiplatform"
   # Or via gcloud:
   gcloud alpha services quota update \
     --service=aiplatform.googleapis.com \
     --consumer=projects/inso-code \
     --metric=aiplatform.googleapis.com/online_prediction_requests_per_minute \
     --value=600 \
     --unit=1/min/{project}
   ```

2. **Enable Vertex AI context caching** to reduce token consumption:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --update-env-vars="VERTEX_CONTEXT_CACHING=true,VERTEX_CACHE_TTL=3600" \
     --project=inso-code
   ```

3. **Implement exponential backoff with jitter** — verify retry config:
   ```bash
   # Check current retry configuration
   gcloud run services describe inso-code-backend \
     --region=us-central1 --format=json | \
     jq '.spec.template.spec.containers[0].env[] | select(.name | startswith("VERTEX_RETRY"))'
   ```
   Update if needed:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --update-env-vars="VERTEX_RETRY_MAX_ATTEMPTS=3,VERTEX_RETRY_INITIAL_DELAY_MS=1000,VERTEX_RETRY_MAX_DELAY_MS=30000" \
     --project=inso-code
   ```

4. **Add request-level rate limiting** in the application:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --update-env-vars="VERTEX_RATE_LIMIT_RPM=300,VERTEX_RATE_LIMIT_QUEUE_SIZE=100" \
     --project=inso-code
   ```

5. **Re-enable AI features** once quota is restored:
   ```bash
   gcloud run services update inso-code-backend \
     --region=us-central1 \
     --update-env-vars="AI_DEGRADED_MODE=false,DISABLE_BACKGROUND_ANALYSIS=false" \
     --project=inso-code
   ```

## Verification
- Confirm 429 errors have stopped:
  ```bash
  gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="inso-code-backend" AND textPayload=~"429"' \
    --project=inso-code --limit=5 --freshness=10m
  ```
- Test AI features end-to-end from the frontend
- Verify quota headroom is sufficient:
  ```bash
  gcloud alpha services quota list \
    --service=aiplatform.googleapis.com \
    --project=inso-code --format=table
  ```
- Monitor the AI Pipeline dashboard for 30 minutes post-recovery

## Prevention
- Set up proactive quota alerting at 70% utilization
- Enable Vertex AI context caching for all system prompts
- Schedule batch AI jobs during off-peak hours (UTC 06:00–10:00)
- Implement application-level rate limiting with queuing for AI requests
- Request quota increases proactively before anticipated growth milestones
- Use model routing: send simple tasks to smaller/cheaper models (e.g., Gemini Flash)
- Cache AI responses for identical inputs with a configurable TTL

## Escalation
- **After 5 min with all AI features down**: Page on-call SRE — `inso-code-p1`
- **If quota increase request is stuck**: Open a Google Cloud Support case (P1)
- **If Vertex AI service is degraded globally**: Check [Google Cloud Status](https://status.cloud.google.com/)
- **Slack channel**: `#alti-incidents`
- **Runbook owner**: AI/ML Engineering team
