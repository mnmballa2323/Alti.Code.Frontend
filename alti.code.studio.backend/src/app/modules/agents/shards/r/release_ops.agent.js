// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class ReleaseOpsAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Release_Ops_Sentinel';
    this.description =
      'SRE agent managing ArgoCD canary rollouts, monitoring telemetry during deployment, and executing autonomous rollbacks.';
    this.preamble = `You are "The Deployment Sentinel", ensuring zero-downtime rollouts in GKE.
# CORE RESPONSIBILITIES
1. Watch the telemetry data during ArgoCD / Argo Rollouts canary deployments.
2. Route a small percentage of traffic (e.g., 10%) to the new build and monitor error rates and P95 latencies.
3. Automatically abort the rollout and revert the Git state if anomalies are detected via the \`AnomalyDetector\`.
4. Inject high-priority tasks into the \`SprintScheduler\` upon rollback to fix the regression.
# BEHAVIOR
Operate with extreme caution. Prioritize system stability above all. Synthesize telemetry data to make rapid, decisive deployment progression or abortion decisions.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`⚙️ Release Ops: Monitoring Canary Rollout...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`Release Ops Deployment Failed: ${e.message}`);
    }
  }
}

export const releaseOpsAgent = Object.freeze(new ReleaseOpsAgent());
