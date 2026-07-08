# Memorystore Redis Eviction / Saturation

## Severity: P2
## Detection
- **Cloud Monitoring metric**: `redis.googleapis.com/stats/evicted_keys` > 0 sustained
- **Memory utilization**: `redis.googleapis.com/stats/memory/usage_ratio` > 90%
- **Alerting policy**: `alti-code-studio-redis-eviction` fires on eviction count > 0 or memory > 85%
- **Dashboard**: Check **Alti Code Studio — Cache Health** dashboard
- **Application logs**: Cache miss rate spikes; `MISSES` increasing relative to `HITS`

## Symptoms
- Application response times degrade as cache hit rate drops
- Users experience slower page loads and API responses
- Redis `INFO` shows `evicted_keys` incrementing rapidly
- Features relying on session data may log users out unexpectedly
- Rate limiting may become inconsistent (if backed by Redis)
- Background job deduplication fails, causing duplicate processing

## Root Cause
- **Cache size growth**: New features storing more data without corresponding memory increase
- **Missing TTLs**: Keys stored without expiration accumulate indefinitely
- **Large values**: Individual cache entries storing oversized payloads (serialized objects, large JSON)
- **Hot key problem**: Specific keys accessed at extremely high rates, causing memory fragmentation
- **Memory fragmentation**: Redis `mem_fragmentation_ratio` > 1.5 due to allocation patterns
- **Eviction policy mismatch**: Using `noeviction` or `volatile-lru` when `allkeys-lru` is needed

## Immediate Response (< 5 min)
1. **Check current memory usage and eviction count**:
   ```bash
   gcloud redis instances describe alti-code-studio-redis \
     --region=us-central1 --project=alti-code-studio \
     --format="value(memorySizeGb, currentLocationId)"
   ```
2. **Connect to Redis and check stats**:
   ```bash
   # Get connection info
   gcloud redis instances describe alti-code-studio-redis \
     --region=us-central1 --project=alti-code-studio \
     --format="value(host, port)"

   # Via redis-cli (from a Compute Engine VM in same VPC)
   redis-cli -h <REDIS_HOST> -p 6379 INFO memory
   redis-cli -h <REDIS_HOST> -p 6379 INFO stats | grep evicted
   ```
3. **Check eviction policy**:
   ```bash
   redis-cli -h <REDIS_HOST> -p 6379 CONFIG GET maxmemory-policy
   ```
4. **Identify largest keys**:
   ```bash
   redis-cli -h <REDIS_HOST> -p 6379 --bigkeys
   ```

## Resolution
1. **Scale up the instance** to stop immediate eviction:
   ```bash
   gcloud redis instances update alti-code-studio-redis \
     --region=us-central1 \
     --size=4 \
     --project=alti-code-studio
   ```

2. **Set appropriate eviction policy**:
   ```bash
   gcloud redis instances update alti-code-studio-redis \
     --region=us-central1 \
     --redis-config="maxmemory-policy=allkeys-lru" \
     --project=alti-code-studio
   ```

3. **Add TTLs to keys missing them** — deploy application fix:
   ```bash
   # Identify keys without TTL
   redis-cli -h <REDIS_HOST> -p 6379 --scan --pattern '*' | head -100 | while read key; do
     ttl=$(redis-cli -h <REDIS_HOST> -p 6379 TTL "$key")
     if [ "$ttl" = "-1" ]; then echo "NO TTL: $key"; fi
   done
   ```
   Then set TTLs on persistent keys:
   ```bash
   # Set 1-hour TTL on session keys
   redis-cli -h <REDIS_HOST> -p 6379 --scan --pattern 'session:*' | \
     xargs -I{} redis-cli -h <REDIS_HOST> -p 6379 EXPIRE {} 3600

   # Set 24-hour TTL on cache keys
   redis-cli -h <REDIS_HOST> -p 6379 --scan --pattern 'cache:*' | \
     xargs -I{} redis-cli -h <REDIS_HOST> -p 6379 EXPIRE {} 86400
   ```

4. **Clean up oversized keys**:
   ```bash
   # Delete known large/stale key patterns
   redis-cli -h <REDIS_HOST> -p 6379 --scan --pattern 'temp:*' | \
     xargs -I{} redis-cli -h <REDIS_HOST> -p 6379 DEL {}
   ```

5. **Update application cache configuration**:
   ```bash
   gcloud run services update alti-code-studio-backend \
     --region=us-central1 \
     --update-env-vars="REDIS_DEFAULT_TTL=3600,REDIS_MAX_VALUE_SIZE=1048576,REDIS_KEY_PREFIX=v2:" \
     --project=alti-code-studio
   ```

## Verification
- Confirm eviction has stopped:
  ```bash
  redis-cli -h <REDIS_HOST> -p 6379 INFO stats | grep evicted_keys
  # Wait 5 min and check again — value should not increase
  ```
- Verify memory usage is below 80%:
  ```bash
  redis-cli -h <REDIS_HOST> -p 6379 INFO memory | grep used_memory_human
  ```
- Check cache hit rate is recovering:
  ```bash
  redis-cli -h <REDIS_HOST> -p 6379 INFO stats | grep -E "keyspace_hits|keyspace_misses"
  ```
- Monitor the Cache Health dashboard for 30 minutes

## Prevention
- Enforce TTLs on all cache keys at the application layer — no key should have TTL = -1
- Set up alerting at 70% memory utilization (warning) and 85% (critical)
- Alert on `evicted_keys` > 0 as an early warning
- Implement cache value size limits (< 1MB per key)
- Use Redis key namespacing (`cache:`, `session:`, `ratelimit:`) for easy auditing
- Run a weekly `--bigkeys` scan as a scheduled Cloud Function
- Plan Redis instance size to accommodate 2x current usage for headroom
- Document expected cache key patterns and their TTLs

## Escalation
- **If eviction causes user-facing failures (auth, rate limiting)**: Page on-call SRE
- **If Memorystore instance is unresponsive**: Open a GCP Support case
- **If root cause is a code change introducing bad cache patterns**: Escalate to backend engineering
- **Slack channel**: `#alti-incidents`
- **Runbook owner**: Backend Engineering team
