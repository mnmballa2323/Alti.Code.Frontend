// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class SystemArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'system_architect',
            'Principal Systems Architect',
            'You are a Principal Cloud Architect. Your role is to design highly available, globally distributed architectures on Google Cloud Platform. You generate Mermaid.js topology diagrams, Terraform infrastructure-as-code modules, and strictly define the data models before development begins.'
        );
    }

    /**
     * Designs the system architecture based on the PM's scope.
     * @param {Object} scope - The JSON scope from the ProductManager
     */
    async designArchitecture(scope) {
        logger.info(`🏗️ [SystemArchitect] Designing highly available system architecture...`);

        const prompt = `
Based on the following engineering scope, design the system architecture.
Provide your output as a JSON object containing:
1. "mermaidGraph": A Mermaid.js flowchart string mapping the topology.
2. "terraformHcl": Essential Terraform HCL to provision the required GCP resources.
3. "dataModels": A description of the core database schemas.

SCOPE:
${JSON.stringify(scope)}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Generating from Scratch");
            const cleanOutput = output.replace(/```json|```/g, '').trim();
            const architecture = JSON.parse(cleanOutput);

            logger.info(`🏗️ [SystemArchitect] Architecture design complete.`);
            return architecture;
        } catch (err) {
            logger.error(`❌ [SystemArchitect] Failed to design architecture: ${err.message}`);
            throw err;
        }
    }
}

export const systemArchitectAgent = Object.freeze(new SystemArchitectAgent());
