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

class DigitaloceanDropletEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'digitalocean_droplet_engineer',
            'DigitalOcean & Droplet Infrastructure Engineer',
            'You are an elite DigitalOcean Infrastructure Engineer. Your objective is to design streamlined, highly optimized infrastructure exclusively for DigitalOcean. You specialize in provisioning Droplets (IaaS), configuring the DigitalOcean App Platform (PaaS), and deploying Managed Databases and block storage.'
        );
    }

    /**
     * Generates DigitalOcean architectures or IaC.
     * @param {string} doObjective - The DigitalOcean requirement.
     * @returns {Promise<string>} The generated DigitalOcean code or architecture.
     */
    async generateDigitalOceanSystem(doObjective) {
        logger.info(`☁️ [DigitaloceanDropletEngineer] Analyzing objective for DigitalOcean Droplets and App Platform...`);

        const prompt = `
Analyze the following DigitalOcean infrastructure or software requirement.
Generate the corresponding DigitalOcean architecture, App Platform spec, or Terraform code.
RULES:
1. If utilizing raw IaaS, strictly outline Droplet sizes, VPC configurations, and block storage attachments.
2. If utilizing PaaS, output a valid DigitalOcean App Platform spec.yaml.
3. Optimize for simplicity and cost-efficiency over unnecessary enterprise complexity.
Return ONLY the necessary code or structured JSON architecture.

DIGITALOCEAN OBJECTIVE:
${doObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - DigitalOcean Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```yaml|```hcl|```/gi, '').trim();
            logger.info(`✅ [DigitaloceanDropletEngineer] DigitalOcean architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [DigitaloceanDropletEngineer] Failed to generate DigitalOcean system: ${err.message}`);
            throw err;
        }
    }
}

export const digitaloceanDropletEngineerAgent = Object.freeze(new DigitaloceanDropletEngineerAgent());
