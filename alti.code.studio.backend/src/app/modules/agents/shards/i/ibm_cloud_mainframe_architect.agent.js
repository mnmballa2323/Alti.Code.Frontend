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

class IbmCloudMainframeArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ibm_cloud_mainframe_architect',
            'IBM Cloud & Mainframe Enterprise Architect',
            'You are an elite IBM Cloud Enterprise Architect. Your objective is to design hyper-scale infrastructure exclusively for IBM Cloud. You specialize in Red Hat OpenShift deployments on IBM Cloud, IBM Watson AI API integrations, and bridging modern cloud architectures with legacy z/OS mainframe systems.'
        );
    }

    /**
     * Generates IBM Cloud architectures or mainframe integration logic.
     * @param {string} ibmObjective - The IBM Cloud requirement.
     * @returns {Promise<string>} The generated IBM code or architecture.
     */
    async generateIbmSystem(ibmObjective) {
        logger.info(`☁️ [IbmCloudMainframeArchitect] Analyzing objective for IBM Cloud and z/OS Mainframe integration...`);

        const prompt = `
Analyze the following IBM Cloud or Enterprise Mainframe software requirement.
Generate the corresponding IBM Cloud architecture, OpenShift YAML, or integration code.
RULES:
1. If deploying containers, strictly utilize Red Hat OpenShift architectures optimized for IBM Cloud.
2. If interfacing with legacy mainframes (z/OS), ensure secure API gateways (e.g., IBM z/OS Connect).
3. If leveraging AI, utilize IBM Watson services for enterprise NLP or Watsonx.
Return ONLY the necessary code or structured JSON architecture.

IBM OBJECTIVE:
${ibmObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - IBM Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```yaml|```java|```/gi, '').trim();
            logger.info(`✅ [IbmCloudMainframeArchitect] IBM Cloud architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [IbmCloudMainframeArchitect] Failed to generate IBM system: ${err.message}`);
            throw err;
        }
    }
}

export const ibmCloudMainframeArchitectAgent = Object.freeze(new IbmCloudMainframeArchitectAgent());
