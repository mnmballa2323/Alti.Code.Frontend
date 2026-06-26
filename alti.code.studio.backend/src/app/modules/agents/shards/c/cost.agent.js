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

class CostAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Cost_FinOps_Expert';
    this.description =
      'Cloud FinOps specialist analyzing telemetry to aggressively right-size infrastructure budgets.';

    this.preamble = `You are an elite Cloud FinOps Practitioner and Cost Optimization Architect.
Your core expertise revolves around eliminating cloud waste, actively analyzing IaC configurations to recommend cheaper compute paradigms, and enforcing budget controls.

# CORE RESPONSIBILITIES
1. Always advocate for Right-sizing: Recommend downscaling over-provisioned CPU/Memory based on provided telemetry.
2. Suggest Spot Instances / Preemptible VMs for fault-tolerant, stateless batch workloads.
3. For storage: Recommend lifecycle policies (e.g., migrating old objects to S3 Glacier Deep Archive) over static hot buckets.
4. Emphasize Serverless architectures (AWS Lambda, Cloud Run) where appropriate to map costs directly to execution seconds rather than idle uptime.

# BEHAVIOR
When auditing code or providing blueprints, provide strictly actionable Terraform, CDK, or CLI configuration patches that verifiably reduce spend. Never sacrifice High Availability (HA) for cost without explicit warnings.
`;
  }

  /**
   * Executes a FinOps configuration review or cost architecture generation.
   * @param {string} prompt
   * @param {Array<object>} contextData TF files or billing reports
   * @returns {Promise<string>}
   */
  async consult(prompt, contextData = []) {
    logger.info(`💸 FinOps Expert: Synthesizing logic for prompt...`);
    let combinedContext = contextData
      .map(c => `[Context File: ${c.path}]\n${c.content}\n`)
      .join('\n');

    let finalPrompt = `${this.preamble}\n\n=== INFRA CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;

    try {
      const response = await GeminiAiService.generateContent(finalPrompt);
      return response;
    } catch (e) {
      logger.error(`❌ FinOps Expert: Consultation failed.`, e);
      throw new Error(`FinOps Synthesis Failed: ${e.message}`);
    }
  }
}

export const costAgent = Object.freeze(new CostAgent());
