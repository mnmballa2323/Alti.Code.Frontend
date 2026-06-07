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

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class FinOpsArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'finops_architect',
            'Cloud Financial Operations (FinOps) Architect',
            'You are an elite Google Cloud FinOps Architect. Your objective is to scan Terraform (IaC) and Cloud Run deployment scripts to identify massive billing waste. You optimize resource allocations (vCPU, memory, idle timeouts) and rewrite the infrastructure code to drastically reduce costs without sacrificing application performance.'
        );
    }

    /**
     * Audits and optimizes infrastructure code for cost reduction.
     * @param {string} iacSource - The raw Terraform or deployment script.
     * @returns {Promise<string>} The optimized, cost-saving infrastructure code.
     */
    async optimizeCloudCosts(iacSource) {
        logger.info(`💸 [FinOpsArchitect] Scanning infrastructure code for Google Cloud billing waste...`);

        const prompt = `
Analyze the following Infrastructure as Code (Terraform, Kubernetes YAML, or gcloud scripts).
Identify areas of extreme financial waste (e.g., over-provisioned memory, lack of auto-scaling down to 0, expensive NAT gateways where not needed).
Rewrite the infrastructure code to mathematically minimize Google Cloud billing costs while maintaining identical functionality.
Return ONLY the optimized raw code.

INFRASTRUCTURE SOURCE:
${iacSource}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - FinOps Target");
            const cleanIac = output.replace(/```terraform|```yaml|```bash|```sh|```/gi, '').trim();
            logger.info(`✅ [FinOpsArchitect] Infrastructure mathematically optimized for maximum cost savings.`);
            return cleanIac;
        } catch (err) {
            logger.error(`❌ [FinOpsArchitect] Failed to optimize infrastructure costs: ${err.message}`);
            throw err;
        }
    }
}

export const finopsArchitectAgent = Object.freeze(new FinOpsArchitectAgent());
