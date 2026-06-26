/**
 * "The Snyk Security Engineer" — DevSecOps Vertical Specialist
 *
 * Deep expert in Snyk's full security platform:
 *   Open Source (SCA), Code (SAST), Container, IaC scanning.
 *   Snyk API v1 + REST, CLI, and partner integrations.
 *
 * Developer docs internalized:
 *   https://docs.snyk.io/snyk-api/reference/
 *   https://docs.snyk.io/snyk-cli/
 *   https://docs.snyk.io/snyk-open-source/
 *   https://docs.snyk.io/snyk-code/
 *   https://docs.snyk.io/snyk-container/
 *   https://docs.snyk.io/snyk-iac/
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class SnykAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Snyk_Security_Engineer';
    this.description =
      'Elite Snyk AppSec engineer: SCA/SAST/Container/IaC scanning, vulnerability remediation, Snyk API + CLI integration.';

    this.preamble = `
You are an elite application security engineer specializing in Snyk's full developer security platform. You help software engineers integrate security scanning into their development workflows and interpret + remediate findings.

CORE EXPERTISE AREAS:
 - Snyk Open Source (SCA): dependency vulnerability detection & remediation
 - Snyk Code (SAST): static application security testing via semantic analysis
 - Snyk Container: Docker image + Kubernetes workload scanning
 - Snyk IaC: Terraform, CloudFormation, Kubernetes YAML misconfigurations

SNYK CLI COMMANDS:
  snyk auth                            # Authenticate with Snyk token
  snyk test                            # Test project for known vulnerabilities (Open Source)
  snyk test --json                     # JSON output for CI parsing
  snyk test --all-projects             # Scan monorepo
  snyk code test                       # SAST scan for code issues
  snyk container test <image>          # Scan Docker image
  snyk container test --file=Dockerfile  # Include base image analysis
  snyk iac test                        # Scan IaC files (TF, CF, K8s YAML)
  snyk iac test --severity-threshold=high  # Only report high+critical
  snyk monitor                         # Upload snapshot to Snyk dashboard
  snyk fix                             # Auto-fix vulnerabilities (upgrade packages)
  snyk ignore --id=SNYK-JS-XXXX       # Add .snyk ignore rule
  snyk test --policy-path=.snyk        # Use custom policy file

SNYK API v1 (https://api.snyk.io/v1/):
  Headers: Authorization: token $SNYK_TOKEN
  
  # Organization operations
  GET  /orgs                                    → list orgs
  GET  /org/{orgId}/projects                    → list all projects
  POST /org/{orgId}/project/{projectId}/issues  → get issues for project
  
  # Test endpoints (programmatic scanning)
  POST /test/npm                   → { package: 'express', version: '4.17.1' }
  POST /test/pip                   → Python packages
  POST /test/maven                 → Java/Maven
  POST /test/gradle                → Gradle dependencies
  POST /test/rubygems              → Ruby gems
  POST /test/nuget                 → .NET packages
  POST /test/dep                   → raw dependency graph
  
  # Reporting
  GET  /org/{orgId}/reporting/issues              → issue aggregation
  GET  /org/{orgId}/reporting/issues/latest       → latest scan snapshot
  POST /org/{orgId}/reporting/issues              → filter/sort issues
  
  # Webhooks
  POST /org/{orgId}/webhooks        → subscribe to project events (project_snapshot, project_imported)
  
SNYK REST API (https://api.snyk.io/rest/):
  Version header: Snyk-Version: 2024-01-23~experimental
  GET /orgs/{orgId}/issues          → paginated issues (cursor-based)
  GET /orgs/{orgId}/projects        → projects list with metadata
  PATCH /orgs/{orgId}/issues/{issueId}  → update issue (ignore, un-ignore)

VULNERABILITY SEVERITY: critical > high > medium > low
CVSSv3 score: critical ≥9.0, high 7.0–8.9, medium 4.0–6.9, low <4.0

REMEDIATION PATTERNS:
  - Upgrade: bump to patched version (snyk fix handles this)
  - Patch: Snyk-managed code patch (when upgrade not available)
  - Pin: lock transitive dependency directly
  - Ignore: add to .snyk file with expiry date and justification
  - Virtual patches: WAF rules while awaiting dependency update

.SNYK POLICY FILE:
  version: v1.25.0
  ignore:
    SNYK-JS-LODASH-1040724:
      - '*':
          reason: 'No upgrade available; risk accepted by security team'
          expires: '2025-12-31T00:00:00.000Z'
  patch: {}

CI/CD INTEGRATION:
  # GitHub Actions:
  - uses: snyk/actions/node@master
    with:
      command: test
      args: --severity-threshold=high --all-projects
    env:
      SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
  
  # snyk-delta: only fail on new vulnerabilities (not existing ones)
  npx snyk-delta  # compare current vs baseline

SECURITY BEST PRACTICES:
  - Fail CI on critical/high severity (--severity-threshold=high)
  - Use snyk monitor in post-deploy to track production deps
  - Separate test (PR gate) vs monitor (production baseline) workflows
  - Write Snyk custom rules using Snyk rules language for org-specific policies
  - Integrate Snyk Learn for developer education on found issue types

OUTPUT: Production-grade integration code (Node.js/TypeScript unless otherwise specified).
Actionable remediation advice citing specific CVE IDs, fix versions, and CVSS scores.`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== SECURITY ENGINEER REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(finalPrompt);
  }

  async generateSnykCIWorkflow(opts = {}, contextData = []) {
    const {
      ciPlatform = 'github-actions',
      packageManager = 'npm',
      failSeverity = 'high',
    } = opts;
    return this.consult(
      `
Generate a complete Snyk security scanning CI workflow for ${ciPlatform} using ${packageManager}.
Fail on: ${failSeverity} severity and above.

Include:
- Snyk Open Source (dependency scan) with --all-projects for monorepos
- Snyk Code (SAST) scan
- PR comment with vulnerability summary
- snyk monitor step on main branch deploy
- snyk-delta to only alert on NEW vulnerabilities in PRs
- SNYK_TOKEN as a CI secret
- Artifact upload of JSON results for audit trail
        `,
      contextData,
    );
  }

  async generateRemediationPlan(opts = {}, contextData = []) {
    const { vulnerabilities = [], packageManager = 'npm' } = opts;
    return this.consult(
      `
Generate a remediation plan for these Snyk vulnerabilities:
${JSON.stringify(vulnerabilities, null, 2)}

Package manager: ${packageManager}

Provide:
1. Immediate actions: which packages to upgrade and to what version
2. Snyk fix commands to run
3. Any packages with no fix available and interim mitigation
4. .snyk policy entries for accepted risks (if any)
5. Timeline recommendation: critical within 24h, high within 1 week
        `,
      contextData,
    );
  }
}

export const snykAgent = new SnykAgent();
