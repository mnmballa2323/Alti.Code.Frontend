# TLS Certificate Approaching Expiry

## Severity: P1 (if < 24 hours) / P2 (if < 7 days)
## Detection
- **Certificate Manager alerts**: `certificatemanager.googleapis.com/certificate/expiry_days` < 7
- **Uptime check failures**: HTTPS uptime checks on `api.alticode.studio` and `app.alticode.studio` fail with SSL errors
- **Alerting policy**: `alti-code-studio-cert-expiry` fires at 14-day, 7-day, and 1-day thresholds
- **Dashboard**: Check **Alti Code Studio — Infrastructure Health** dashboard, panel "Certificate Status"
- **Browser warnings**: Users report "Your connection is not private" (NET::ERR_CERT_DATE_INVALID)

## Symptoms
- Users see browser SSL warnings when accessing any Alti Code Studio domain
- API clients receive `SSL: CERTIFICATE_VERIFY_FAILED` errors
- Mobile apps fail to connect with TLS handshake errors
- CDN (Cloud CDN) returns 502 errors due to backend SSL failure
- Automated integrations (webhooks, CI/CD) fail silently

## Root Cause
- **Auto-renewal failure**: Google-managed certificate renewal failed due to DNS validation issues
- **DNS validation issue**: DNS records (CNAME or TXT) for domain validation are missing or misconfigured
- **Domain ownership change**: Domain transferred or DNS provider changed without updating validation records
- **Certificate Manager misconfiguration**: Certificate map entry not properly linked to target proxy
- **Rate limiting**: Let's Encrypt or Google CA rate-limited certificate issuance
- **CAA record blocking**: DNS CAA records preventing Google's CA from issuing certificates

## Immediate Response (< 5 min)
1. **Check certificate expiry date**:
   ```bash
   # Check via Certificate Manager
   gcloud certificate-manager certificates list \
     --project=alti-code-studio --format=table

   # Check live certificate
   echo | openssl s_client -servername api.alticode.studio -connect api.alticode.studio:443 2>/dev/null | \
     openssl x509 -noout -dates
   ```
2. **Check certificate provisioning status**:
   ```bash
   gcloud certificate-manager certificates describe alti-code-studio-cert \
     --project=alti-code-studio --format=yaml
   ```
3. **Check DNS validation records**:
   ```bash
   # Check CNAME validation record
   dig _acme-challenge.api.alticode.studio CNAME +short
   dig _acme-challenge.app.alticode.studio CNAME +short

   # Check CAA records
   dig alticode.studio CAA +short
   ```
4. **If < 1 hour to expiry** — activate emergency certificate:
   ```bash
   # Upload a manually obtained certificate as fallback
   gcloud certificate-manager certificates create alti-code-studio-cert-emergency \
     --certificate-file=./emergency-cert.pem \
     --private-key-file=./emergency-key.pem \
     --project=alti-code-studio
   ```

## Resolution
1. **If DNS validation records are missing** — add them:
   ```bash
   # Get required DNS records from Certificate Manager
   gcloud certificate-manager dns-authorizations describe alti-code-studio-dns-auth \
     --project=alti-code-studio --format="value(dnsResourceRecord)"

   # Add the CNAME record in Cloud DNS
   gcloud dns record-sets create _acme-challenge.api.alticode.studio \
     --zone=alticode-studio-zone \
     --type=CNAME \
     --rrdatas="<validation-target>." \
     --ttl=300 \
     --project=alti-code-studio
   ```

2. **If CAA records are blocking** — update them:
   ```bash
   gcloud dns record-sets update alticode.studio \
     --zone=alticode-studio-zone \
     --type=CAA \
     --rrdatas='0 issue "pki.goog"' \
     --ttl=300 \
     --project=alti-code-studio
   ```

3. **Trigger certificate re-provisioning**:
   ```bash
   # Delete and recreate the managed certificate
   gcloud certificate-manager certificates delete alti-code-studio-cert \
     --project=alti-code-studio --quiet

   gcloud certificate-manager certificates create alti-code-studio-cert \
     --domains="api.alticode.studio,app.alticode.studio,*.alticode.studio" \
     --dns-authorizations=alti-code-studio-dns-auth \
     --project=alti-code-studio
   ```

4. **Update certificate map** to point to the new certificate:
   ```bash
   gcloud certificate-manager maps entries update alti-code-studio-entry \
     --map=alti-code-studio-cert-map \
     --certificates=alti-code-studio-cert \
     --hostname="api.alticode.studio" \
     --project=alti-code-studio
   ```

5. **If using a load balancer** — verify the cert is attached:
   ```bash
   gcloud compute target-https-proxies describe alti-code-studio-https-proxy \
     --project=alti-code-studio --format="value(certificateMap)"
   ```

## Verification
- Confirm the new certificate is active:
  ```bash
  echo | openssl s_client -servername api.alticode.studio -connect api.alticode.studio:443 2>/dev/null | \
    openssl x509 -noout -dates -subject
  ```
- Test all domains in a browser — no SSL warnings
- Verify uptime checks are passing:
  ```bash
  gcloud monitoring uptime-check-configs list \
    --project=alti-code-studio --format=table
  ```
- Confirm Certificate Manager shows `ACTIVE` provisioning state

## Prevention
- Use Google-managed certificates with DNS authorization for automatic renewal
- Set up alerting at 30-day, 14-day, and 7-day expiry thresholds
- Ensure CAA records always include `pki.goog` for Google-managed certificates
- Monitor Certificate Manager provisioning state in CI/CD pipeline
- Document all domains and their certificate configurations
- Run a weekly automated check:
  ```bash
  gcloud certificate-manager certificates list \
    --project=alti-code-studio --format=json | \
    jq '.[] | select(.expireTime < (now + 2592000 | todate))'
  ```

## Escalation
- **If certificate expires within 1 hour**: Page on-call SRE immediately — `alti-code-studio-p1`
- **If Google-managed certificate provisioning fails**: Open a P1 GCP Support case
- **If DNS provider is unreachable**: Escalate to DNS/domain admin
- **Slack channel**: `#alti-incidents`
- **Runbook owner**: Platform Engineering team
