# Secret Manager Rotation Failure

## Severity: P2
## Detection
- **Cloud Function errors**: `cloudfunctions.googleapis.com/function/execution_count` with status `error` for rotation functions
- **Eventarc trigger failures**: Eventarc trigger logs show failed deliveries for `SECRET_ROTATE` events
- **Secret Manager audit logs**: `SecretManagerService.AddSecretVersion` not appearing on schedule
- **Alerting policy**: `alti-code-studio-secret-rotation-failure` fires when rotation function errors > 0
- **Dashboard**: Check **Alti Code Studio — Security Operations** dashboard, panel "Secret Rotation Status"
- **Staleness check**: Secret versions older than rotation policy period

## Symptoms
- Secrets are not rotated on schedule (stale versions detected)
- Cloud Function rotation logs show errors or no recent invocations
- Dependent services may start failing if downstream systems have already rotated credentials
- Database connections fail if DB password was rotated externally but Secret Manager wasn't updated
- API integrations break due to expired or rotated API keys not reflected in Secret Manager

## Root Cause
- **Rotation function bug**: Code error in the Cloud Function that performs the rotation
- **IAM permissions**: Rotation function's service account lost `secretmanager.versions.add` or downstream API permissions
- **Dependent service unavailable**: The service whose credentials are being rotated is down or rate-limiting
- **Eventarc trigger misconfiguration**: Trigger deleted, disabled, or pointing to wrong function
- **Timeout**: Rotation function exceeds Cloud Function timeout during credential exchange
- **Network policy**: VPC Service Controls or firewall rules blocking rotation function's outbound calls

## Immediate Response (< 5 min)
1. **Check rotation function execution logs**:
   ```bash
   gcloud logging read 'resource.type="cloud_function" AND resource.labels.function_name=~"secret-rotation" AND severity>=ERROR' \
     --project=alti-code-studio --limit=20 --freshness=24h
   ```
2. **List secret versions to identify stale secrets**:
   ```bash
   # Check all secrets and their latest version dates
   for secret in $(gcloud secrets list --project=alti-code-studio --format="value(name)"); do
     echo "=== $secret ==="
     gcloud secrets versions list "$secret" --project=alti-code-studio --limit=3 --format=table
   done
   ```
3. **Check Eventarc trigger status**:
   ```bash
   gcloud eventarc triggers list \
     --project=alti-code-studio --location=us-central1 \
     --filter="name:secret-rotation"
   ```
4. **Check rotation function's IAM permissions**:
   ```bash
   gcloud functions describe secret-rotation-function \
     --region=us-central1 --project=alti-code-studio \
     --format="value(serviceAccountEmail)"

   # Then check its roles
   gcloud projects get-iam-policy alti-code-studio \
     --flatten="bindings[].members" \
     --filter="bindings.members:secret-rotation-sa@alti-code-studio.iam.gserviceaccount.com" \
     --format=table
   ```

## Resolution
1. **If rotation function has a bug** — check, fix, and redeploy:
   ```bash
   # View the function source
   gcloud functions describe secret-rotation-function \
     --region=us-central1 --project=alti-code-studio \
     --format="value(sourceUploadUrl)"

   # Redeploy after fixing
   gcloud functions deploy secret-rotation-function \
     --region=us-central1 \
     --runtime=nodejs20 \
     --source=./functions/secret-rotation/ \
     --entry-point=rotateSecret \
     --trigger-eventarc \
     --service-account=secret-rotation-sa@alti-code-studio.iam.gserviceaccount.com \
     --project=alti-code-studio
   ```

2. **If IAM permissions are missing** — re-grant required roles:
   ```bash
   # Grant Secret Manager admin to rotation SA
   gcloud secrets add-iam-policy-binding alti-db-password \
     --member="serviceAccount:secret-rotation-sa@alti-code-studio.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretVersionAdder" \
     --project=alti-code-studio

   # Grant access to dependent service (e.g., AlloyDB)
   gcloud projects add-iam-policy-binding alti-code-studio \
     --member="serviceAccount:secret-rotation-sa@alti-code-studio.iam.gserviceaccount.com" \
     --role="roles/alloydb.admin"
   ```

3. **If Eventarc trigger is broken** — recreate it:
   ```bash
   gcloud eventarc triggers create secret-rotation-trigger \
     --location=us-central1 \
     --destination-run-service=secret-rotation-function \
     --destination-run-region=us-central1 \
     --event-filters="type=google.cloud.secretmanager.secret.v1.rotationNeeded" \
     --service-account=secret-rotation-sa@alti-code-studio.iam.gserviceaccount.com \
     --project=alti-code-studio
   ```

4. **Perform manual rotation** for the stale secret:
   ```bash
   # Generate a new credential (example: database password)
   NEW_PASSWORD=$(openssl rand -base64 32)

   # Add new secret version
   echo -n "$NEW_PASSWORD" | gcloud secrets versions add alti-db-password \
     --data-file=- --project=alti-code-studio

   # Update the dependent service with the new credential
   gcloud alloydb users set-password alti-app-user \
     --cluster=alti-code-studio-cluster \
     --region=us-central1 \
     --password="$NEW_PASSWORD" \
     --project=alti-code-studio
   ```

5. **Restart dependent services** to pick up the new secret:
   ```bash
   gcloud run services update alti-code-studio-backend \
     --region=us-central1 \
     --update-env-vars="SECRET_REFRESH_TIMESTAMP=$(date +%s)" \
     --project=alti-code-studio
   ```

## Verification
- Confirm the new secret version is active:
  ```bash
  gcloud secrets versions list alti-db-password \
    --project=alti-code-studio --limit=3 --format=table
  ```
- Test the rotation function manually:
  ```bash
  gcloud functions call secret-rotation-function \
    --region=us-central1 --project=alti-code-studio \
    --data='{"secretName":"projects/alti-code-studio/secrets/alti-db-password"}'
  ```
- Verify dependent services are working with the new credential
- Check that the Eventarc trigger is active and delivering events
- Monitor rotation function logs for the next scheduled rotation cycle

## Prevention
- Set up alerting on rotation function execution failures
- Monitor secret version age: alert if any secret version > rotation period + 24 hours
- Implement rotation function health checks as part of CI/CD
- Use Secret Manager's built-in rotation scheduling with notifications
- Test rotation functions in staging before deploying to production
- Grant rotation service accounts the minimum required IAM roles
- Set Cloud Function timeout to 5 minutes (accommodate slow credential exchanges)
- Document all secrets, their rotation schedules, and dependent services

## Escalation
- **If a credential is expired and services are down**: Treat as P1 — page on-call SRE
- **If manual rotation fails**: Escalate to security engineering lead
- **If Secret Manager API is unresponsive**: Open a GCP Support case
- **Slack channel**: `#alti-security`
- **Runbook owner**: Security Engineering team
