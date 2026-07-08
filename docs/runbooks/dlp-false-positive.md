# DLP Scan Blocking Legitimate Content

## Severity: P3
## Detection
- **User reports**: Users report that legitimate code snippets, documents, or chat messages are blocked
- **DLP finding logs**: `dlp.googleapis.com/finding` entries with `LIKELY` or `VERY_LIKELY` on benign content
- **Application logs**: `Content blocked by DLP policy` errors in `alti-code-studio-backend` logs
- **Alerting policy**: `alti-code-studio-dlp-false-positive-rate` fires when block rate exceeds 5% of scans
- **Dashboard**: Check **Alti Code Studio — Content Moderation** dashboard, panel "DLP Block Rate"

## Symptoms
- Users cannot submit code that contains patterns resembling sensitive data (e.g., test UUIDs, sample API keys in docs)
- Chat messages with code snippets are rejected with "Content policy violation" errors
- File uploads fail with "Potentially sensitive content detected"
- Code review comments containing example credentials (in documentation context) are stripped
- Users complain about overzealous content filtering

## Root Cause
- **Overly broad info types**: DLP configured with too many info types or low likelihood thresholds
- **Custom detector misconfiguration**: Custom regex detectors matching common code patterns (hex strings, Base64)
- **Missing exclusion rules**: No exclusion rules for known-safe patterns (test fixtures, example data)
- **Likelihood threshold too low**: Using `POSSIBLE` instead of `LIKELY` or `VERY_LIKELY`
- **Context not considered**: DLP scanning raw text without understanding code context
- **Template mismatch**: Inspection template not tailored for a code-centric platform

## Immediate Response (< 5 min)
1. **Identify the blocked content** — check DLP findings:
   ```bash
   gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="alti-code-studio-backend" AND jsonPayload.message=~"DLP" AND severity>=WARNING' \
     --project=alti-code-studio --limit=20 --freshness=1h
   ```
2. **Check the DLP inspection template**:
   ```bash
   gcloud dlp inspect-templates list \
     --project=alti-code-studio --format=table
   ```
3. **Review the specific finding** that caused the block:
   ```bash
   gcloud dlp inspect-templates describe alti-code-studio-inspect-template \
     --project=alti-code-studio --format=yaml
   ```
4. **Temporarily lower blocking severity** if critical user flows are affected:
   ```bash
   gcloud run services update alti-code-studio-backend \
     --region=us-central1 \
     --update-env-vars="DLP_BLOCK_THRESHOLD=VERY_LIKELY,DLP_LOG_ONLY_MODE=true" \
     --project=alti-code-studio
   ```

## Resolution
1. **Adjust the likelihood threshold** to reduce false positives:
   ```bash
   # Update the inspection template to only flag VERY_LIKELY findings
   gcloud dlp inspect-templates update alti-code-studio-inspect-template \
     --project=alti-code-studio \
     --min-likelihood=VERY_LIKELY
   ```

2. **Add exclusion rules** for known-safe patterns:
   ```bash
   # Create an updated template with exclusion rules
   cat > /tmp/dlp-template-update.json << 'EOF'
   {
     "inspectConfig": {
       "ruleSet": [{
         "infoTypes": [{"name": "GENERIC_ID"}, {"name": "API_KEY"}],
         "rules": [{
           "exclusionRule": {
             "regex": {
               "pattern": "(test|example|sample|mock|fake|placeholder|YOUR_API_KEY)"
             },
             "matchingType": "MATCHING_TYPE_FULL_MATCH"
           }
         }]
       }]
     }
   }
   EOF

   gcloud dlp inspect-templates update alti-code-studio-inspect-template \
     --project=alti-code-studio \
     --template-content-file=/tmp/dlp-template-update.json
   ```

3. **Remove overly broad info types** that cause noise in a code platform:
   ```bash
   # Review current info types
   gcloud dlp inspect-templates describe alti-code-studio-inspect-template \
     --project=alti-code-studio --format=json | \
     jq '.inspectConfig.infoTypes[].name'

   # Remove problematic info types (e.g., GENERIC_ID catches UUIDs in code)
   # Update the template via Console or API to remove: GENERIC_ID, PHONE_NUMBER
   ```

4. **Add context-aware rules** — only scan user-generated text, not code blocks:
   ```bash
   gcloud run services update alti-code-studio-backend \
     --region=us-central1 \
     --update-env-vars="DLP_SKIP_CODE_BLOCKS=true,DLP_SCAN_COMMENTS_ONLY=false" \
     --project=alti-code-studio
   ```

5. **Disable log-only mode** after confirming reduced false positives:
   ```bash
   gcloud run services update alti-code-studio-backend \
     --region=us-central1 \
     --update-env-vars="DLP_LOG_ONLY_MODE=false,DLP_BLOCK_THRESHOLD=VERY_LIKELY" \
     --project=alti-code-studio
   ```

## Verification
- Test with the previously blocked content — confirm it passes:
  ```bash
  curl -X POST https://api.alticode.studio/api/v1/content/scan \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"content": "<previously blocked content>"}'
  ```
- Verify DLP findings log shows reduced false positives
- Monitor the Content Moderation dashboard for 24 hours
- Ask the reporting user to confirm their content is no longer blocked
- Check that legitimate sensitive content IS still detected (no regression)

## Prevention
- Use `VERY_LIKELY` as the default blocking threshold for code platforms
- Maintain an exclusion list for known-safe patterns (test data, documentation examples)
- Regularly review DLP findings for false positive patterns (weekly triage)
- Separate DLP policies for different content types (code vs. chat vs. uploads)
- Implement a user feedback loop: "Report false positive" button triggers review
- Test DLP policy changes against a corpus of known-safe code samples before deployment
- Document all custom DLP detectors with their intended purpose and expected patterns

## Escalation
- **If blocking is widespread affecting many users**: Escalate to security engineering lead
- **If custom detectors need redesign**: Schedule a review with the security team
- **If DLP API itself is behaving unexpectedly**: Open a GCP Support case
- **Slack channel**: `#alti-security`
- **Runbook owner**: Security Engineering team
