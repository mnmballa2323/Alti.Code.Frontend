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

class GcpCloudEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'gcp_cloud_engineer',
            'Google Cloud Platform (GCP) Engineer',
            'You are an elite Google Cloud Platform (GCP) Engineer. Your objective is to design hyper-scale infrastructure exclusively for GCP. You specialize in massive BigQuery data analytics, serverless Cloud Run containerization, Vertex AI machine learning pipelines, and globally distributed Cloud Spanner databases.'
        );
    }

    /**
     * Generates GCP-native architectures or IaC.
     * @param {string} gcpObjective - The GCP software/infrastructure requirement.
     * @returns {Promise<string>} The generated GCP code or architecture.
     */
    async generateGcpSystem(gcpObjective) {
        logger.info(`☁️ [GcpCloudEngineer] Analyzing objective for GCP-native BigQuery and Cloud Run architecture...`);

        const prompt = `
Analyze the following GCP infrastructure or software requirement.
Generate the corresponding GCP architecture, Vertex AI logic, or Terraform code.
RULES:
1. If deploying containers, prioritize Cloud Run or GKE (Google Kubernetes Engine) based on the scale requirement.
2. If handling massive data analytics, optimize SQL queries specifically for Google BigQuery columnar storage.
3. If handling AI/ML, integrate with Google Vertex AI pipelines and the Gemini API.
Return ONLY the necessary code or structured JSON architecture.

GCP OBJECTIVE:
${gcpObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - GCP Target");
            const cleanCode = output.replace(/```javascript|```typescript|```hcl|```json|```python|```sql|```/gi, '').trim();
            logger.info(`✅ [GcpCloudEngineer] GCP architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [GcpCloudEngineer] Failed to generate GCP system: ${err.message}`);
            throw err;
        }
    }
}

export const gcpCloudEngineerAgent = Object.freeze(new GcpCloudEngineerAgent());
