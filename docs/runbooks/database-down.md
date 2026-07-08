# PostgreSQL / AlloyDB Connection Failure

## Severity: P1
## Detection
- **Cloud SQL / AlloyDB metrics**: `cloudsql.googleapis.com/database/network/connections` drops to zero or spikes to max
- **Prisma connection errors**: `PrismaClientInitializationError: Can't reach database server` in Cloud Run logs
- **Uptime checks**: `/api/health` endpoint returning 503 with `"database": "unhealthy"`
- **Alerting policy**: `alti-code-studio-db-connection-failure` fires in Cloud Monitoring
- **Dashboard**: Check **Alti Code Studio — Database Health** dashboard in Cloud Monitoring

## Symptoms
- API requests return `500 Internal Server Error` with `"Database connection failed"`
- Frontend shows "Service Unavailable" or infinite loading spinners
- Prisma logs show `Connection pool timeout` or `ECONNREFUSED`
- Cloud Run instance logs show repeated `P1001: Can't reach database server at <host>:<port>`
- Background jobs (Pub/Sub subscribers) fail with database write errors

## Root Cause
- **Connection pool exhaustion**: All Prisma pool connections are in use; new requests queue and timeout
- **Instance restart / maintenance**: AlloyDB primary instance undergoing maintenance or automatic restart
- **Network partition**: VPC connector or Private Service Connect endpoint is misconfigured or down
- **IAM authentication failure**: Workload Identity credentials expired or misconfigured
- **Cloud SQL Auth Proxy crash**: Proxy sidecar crashed or lost connection to the control plane
- **Max connections exceeded**: PostgreSQL `max_connections` limit reached due to horizontal scaling

## Immediate Response (< 5 min)
1. **Confirm the outage scope** — check if all services are affected or just one:
   ```bash
   gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="alti-code-studio-backend" AND textPayload=~"PrismaClient"' \
     --project=alti-code-studio --limit=20 --format=json
   ```
2. **Check AlloyDB / Cloud SQL instance status**:
   ```bash
   gcloud alloydb instances list --cluster=alti-code-studio-cluster \
     --region=us-central1 --project=alti-code-studio
   ```
3. **Verify network connectivity** from Cloud Run to the database:
   ```bash
   gcloud run services describe alti-code-studio-backend \
     --region=us-central1 --format="value(spec.template.spec.containers[0].env)"
   ```
4. **Check active connections** on the database:
   ```sql
   SELECT count(*) AS total, state FROM pg_stat_activity GROUP BY state;
   ```
5. **Communicate**: Post in `#alti-incidents` Slack channel — "Investigating database connectivity issues."

## Resolution
1. **If connection pool exhaustion** — kill idle connections and restart the service:
   ```sql
   -- Terminate idle connections older than 5 minutes
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle' AND query_start < NOW() - INTERVAL '5 minutes';
   ```
   Then redeploy to reset connection pools:
   ```bash
   gcloud run services update alti-code-studio-backend \
     --region=us-central1 \
     --update-env-vars="DATABASE_POOL_SIZE=20,DATABASE_POOL_TIMEOUT=10" \
     --project=alti-code-studio
   ```

2. **If AlloyDB instance is down** — check for maintenance or trigger failover:
   ```bash
   # Check instance operations
   gcloud alloydb operations list --cluster=alti-code-studio-cluster \
     --region=us-central1 --project=alti-code-studio

   # Failover to read replica (if configured)
   gcloud alloydb instances failover alti-code-studio-primary \
     --cluster=alti-code-studio-cluster \
     --region=us-central1 --project=alti-code-studio
   ```

3. **If Cloud SQL Auth Proxy is crashed** — restart the proxy sidecar:
   ```bash
   # For Cloud Run with sidecar proxy
   gcloud run services update alti-code-studio-backend \
     --region=us-central1 \
     --update-containers="proxy=gcr.io/cloud-sql-connectors/cloud-sql-proxy:latest" \
     --project=alti-code-studio
   ```

4. **If network partition** — verify VPC connector status:
   ```bash
   gcloud compute networks vpc-access connectors describe alti-vpc-connector \
     --region=us-central1 --project=alti-code-studio
   ```

## Verification
- Confirm `/api/health` returns `200` with `"database": "healthy"`:
  ```bash
  curl -s https://api.alticode.studio/api/health | jq '.database'
  ```
- Verify active connection count is within normal range (< 80% of max):
  ```sql
  SELECT count(*) FROM pg_stat_activity;
  ```
- Check Cloud Run logs for successful database queries post-fix
- Monitor the **Alti Code Studio — Database Health** dashboard for 15 minutes

## Prevention
- Set `DATABASE_POOL_SIZE` to match Cloud Run max concurrency (pool per instance)
- Enable AlloyDB automated backups and high availability with read replicas
- Configure connection pool idle timeout (`DATABASE_POOL_TIMEOUT=10`)
- Set up Cloud Monitoring alerting for connection count > 80% of `max_connections`
- Use PgBouncer or AlloyDB Auth Proxy connection pooling to reduce direct connections
- Schedule maintenance windows during low-traffic periods

## Escalation
- **After 5 min**: Page the on-call SRE via PagerDuty — `alti-code-studio-p1`
- **After 15 min without resolution**: Escalate to the Platform Engineering lead
- **If AlloyDB control plane issue**: Open a P1 support case with Google Cloud Support
- **Slack channel**: `#alti-incidents`
- **Runbook owner**: Platform Engineering team
