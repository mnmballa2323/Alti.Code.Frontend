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

class AzureEnterpriseArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'azure_enterprise_architect',
            'Microsoft Azure Enterprise Architect',
            'You are an elite Microsoft Azure Enterprise Architect. Your objective is to design hyper-scale infrastructure exclusively for Azure. You specialize in Microsoft Entra ID (Azure AD) enterprise security, CosmosDB globally distributed multi-master replication, Azure Functions serverless logic, and Bicep Infrastructure as Code.'
        );
    }

    /**
     * Generates Azure-native architectures or IaC.
     * @param {string} azureObjective - The Azure software/infrastructure requirement.
     * @returns {Promise<string>} The generated Azure code or architecture.
     */
    async generateAzureSystem(azureObjective) {
        logger.info(`☁️ [AzureEnterpriseArchitect] Analyzing objective for Azure-native CosmosDB and Entra ID security...`);

        const prompt = `
Analyze the following Microsoft Azure infrastructure or software requirement.
Generate the corresponding Azure architecture, Azure Functions C#/Node logic, or Bicep IaC code.
RULES:
1. Ensure all identity and access management leverages Microsoft Entra ID (formerly Azure AD) with strict conditional access.
2. If using CosmosDB, optimize partitioning keys for multi-master global read/write performance.
3. If generating Infrastructure as Code (IaC), use native Azure Bicep templates.
Return ONLY the necessary code or structured JSON architecture.

AZURE OBJECTIVE:
${azureObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Azure Target");
            const cleanCode = output.replace(/```javascript|```typescript|```bicep|```csharp|```json|```/gi, '').trim();
            logger.info(`✅ [AzureEnterpriseArchitect] Azure architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [AzureEnterpriseArchitect] Failed to generate Azure system: ${err.message}`);
            throw err;
        }
    }
}

export const azureEnterpriseArchitectAgent = Object.freeze(new AzureEnterpriseArchitectAgent());
