# Pub/Sub Message Backlog Growing

## Severity: P2
## Detection
- **Cloud Monitoring metric**: `pubsub.googleapis.com/subscription/num_undelivered_messages` > 10,000
- **Oldest unacked message age**: `pubsub.googleapis.com/subscription/oldest_unacked_message_age` > 300s
- **Alerting policy**: `inso-code-pubsub-backlog` fires when undelivered messages exceed threshold
- **Dashboard**: Check **Inso Code — Async Processing** dashboard
- **Subscriber logs**: Cloud Run subscriber service showing errors or no activity

## Symptoms
- Asynchronous operations are delayed (code analysis, report generation, notifications)
- Users report features that "hang" or never complete (e.g., project scans, AI analysis jobs)
- Cloud Run subscriber instances show high error rates or zero instances running
- Pub/Sub subscription metrics show flat or zero `pull_message_operation_count`
- Dead-letter topic starts receiving messages

## Root Cause
- **Subscriber crash loop**: Cloud Run subscriber service failing on startup or crashing on every message
- **Slow processing**: Vertex AI calls timing out, causing message acknowledgement delays
- **Poison message**: A single malformed message causes repeated nack → redelivery loops
- **Subscriber scaling issue**: Cloud Run min-instances=0 and autoscaler not reacting fast enough
- **IAM permission change**: Subscriber lost `pubsub.subscriber` role
- **Pub/Sub push endpoint misconfiguration**: Push URL changed or service account rotated

## Immediate Response (< 5 min)
1. **Check backlog size and growth rate**:
   ```bash
   gcloud pubsub subscriptions describe alti-code-analysis-sub \
     --project=inso-code \
     --format="value(messageRetentionDuration, ackDeadlineSeconds)"

   # Check current backlog
   gcloud monitoring metrics read \
     "pubsub.googleapis.com/subscription/num_undelivered_messages" \
     --project=inso-code --interval="5m"
   ```
2. **Check subscriber health**:
   ```bash
   gcloud run services describe inso-code-subscriber \
     --region=us-central1 --project=inso-code \
     --format="value(status.conditions)"
   ```
3. **Check subscriber logs for errors**:
   ```bash
   gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="inso-code-subscriber" AND severity>=ERROR' \
     --project=inso-code --limit=20 --freshness=15m
   ```
4. **Identify poison messages** (if applicable):
   ```bash
   gcloud pubsub subscriptions pull alti-code-analysis-sub \
     --project=inso-code --limit=5 --auto-ack=false \
     --format=json
   ```

## Resolution
1. **If subscriber is crashed** — restart the service:
   ```bash
   # Force a new revision deployment
   gcloud run services update inso-code-subscriber \
     --region=us-central1 \
     --update-env-vars="RESTART_TIMESTAMP=$(date +%s)" \
     --project=inso-code
   ```

2. **If poison messages are blocking** — move them to dead-letter:
   ```bash
   # Configure dead-letter topic if not already set
   gcloud pubsub subscriptions update alti-code-analysis-sub \
     --dead-letter-topic=projects/inso-code/topics/alti-dead-letter \
     --max-delivery-attempts=5 \
     --project=inso-code
   ```

3. **Scale up subscribers** to process the backlog:
   ```bash
   gcloud run services update inso-code-subscriber \
     --region=us-central1 \
     --min-instances=3 \
     --max-instances=20 \
     --concurrency=10 \
     --project=inso-code
   ```

4. **If IAM permissions issue** — re-grant subscriber role:
   ```bash
   gcloud pubsub subscriptions add-iam-policy-binding alti-code-analysis-sub \
     --member="serviceAccount:inso-code-subscriber@inso-code.iam.gserviceaccount.com" \
     --role="roles/pubsub.subscriber" \
     --project=inso-code
   ```

5. **If backlog is unrecoverable** (stale messages) — seek and destroy:
   ```bash
   # Seek to timestamp to skip old messages (DESTRUCTIVE)
   gcloud pubsub subscriptions seek alti-code-analysis-sub \
     --time="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
     --project=inso-code
   ```

## Verification
- Confirm backlog is decreasing:
  ```bash
  watch -n 10 "gcloud pubsub subscriptions describe alti-code-analysis-sub \
    --project=inso-code --format='value(numUndeliveredMessages)'"
  ```
- Verify subscriber instances are healthy and processing:
  ```bash
  gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="inso-code-subscriber" AND textPayload=~"processed"' \
    --project=inso-code --limit=10 --freshness=5m
  ```
- Check dead-letter topic for accumulated poison messages
- Monitor async feature completion from the user perspective

## Prevention
- Always configure dead-letter topics on all subscriptions with `max-delivery-attempts=5`
- Set `min-instances=1` on subscriber Cloud Run services to avoid cold-start delays
- Implement idempotent message handlers with deduplication
- Add message schema validation at publish time to prevent poison messages
- Set up alerting at 1,000 undelivered messages (warning) and 10,000 (critical)
- Configure `message_retention_duration` to avoid unbounded backlog growth
- Implement circuit breakers for downstream Vertex AI calls in message handlers

## Escalation
- **After 15 min with growing backlog**: Page the on-call backend engineer
- **If dead-letter queue is also growing**: Escalate to senior backend engineer
- **If Pub/Sub service itself is degraded**: Check [Google Cloud Status Dashboard](https://status.cloud.google.com/) and open a support case
- **Slack channel**: `#alti-incidents`
- **Runbook owner**: Backend Engineering team
