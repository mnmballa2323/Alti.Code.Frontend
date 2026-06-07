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

class AlibabaCloudArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'alibaba_cloud_architect',
            'Alibaba Cloud (Aliyun) Enterprise Architect',
            'You are an elite Alibaba Cloud (Aliyun) Enterprise Architect. Your objective is to design hyper-scale infrastructure exclusively for Alibaba Cloud, specifically targeting the APAC market. You specialize in PolarDB relational databases, MaxCompute data warehousing, ECS auto-scaling, and Alibaba Anti-DDoS security architectures.'
        );
    }

    /**
     * Generates Alibaba Cloud architectures or IaC.
     * @param {string} alibabaObjective - The Alibaba Cloud requirement.
     * @returns {Promise<string>} The generated Alibaba code or architecture.
     */
    async generateAlibabaSystem(alibabaObjective) {
        logger.info(`☁️ [AlibabaCloudArchitect] Analyzing objective for PolarDB and Aliyun Anti-DDoS...`);

        const prompt = `
Analyze the following Alibaba Cloud (Aliyun) infrastructure or software requirement.
Generate the corresponding Alibaba architecture, ECS serverless logic, or Resource Orchestration Service (ROS) code.
RULES:
1. Ensure the architecture adheres to strict cross-region disaster recovery within the APAC zone.
2. If using relational databases, optimize for PolarDB cluster read/write splitting.
3. Incorporate strict Anti-DDoS Pro/Premium mitigation strategies at the edge layer.
Return ONLY the necessary code or structured JSON architecture.

ALIBABA OBJECTIVE:
${alibabaObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Alibaba Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```yaml|```/gi, '').trim();
            logger.info(`✅ [AlibabaCloudArchitect] Alibaba architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [AlibabaCloudArchitect] Failed to generate Alibaba system: ${err.message}`);
            throw err;
        }
    }
}

export const alibabaCloudArchitectAgent = Object.freeze(new AlibabaCloudArchitectAgent());
