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

class CloudRunDeployerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_run_deployer',
            'GCP Cloud Run Deployment Specialist',
            'You are a Google Cloud Platform DevOps Engineer. You specialize in taking generated code, creating highly optimized Dockerfiles, and orchestrating zero-downtime deployments to GCP Cloud Run.'
        );
    }

    /**
     * Synthesizes deployment configurations for Cloud Run.
     * @param {string} sourceCode - The fully completed application code
     */
    async deployToCloudRun(sourceCode) {
        logger.info(`☁️ [CloudRunDeployer] Synthesizing GCP deployment strategy...`);

        const prompt = `
Analyze the provided application source code.
Generate the following required files to deploy this service to Google Cloud Run:
1. An extremely optimized multi-stage Dockerfile.
2. A cloudbuild.yaml configuration for CI/CD.
3. The exact gcloud CLI command required to deploy it.

Output strictly as a JSON object: { "dockerfile": "...", "cloudbuild": "...", "command": "..." }
        `;

        try {
            const output = await this._invoke(prompt, sourceCode);
            const cleanOutput = output.replace(/```json|```/g, '').trim();
            const deploymentSpec = JSON.parse(cleanOutput);

            logger.info(`☁️ [CloudRunDeployer] Deployment specs generated successfully.`);
            return deploymentSpec;
        } catch (err) {
            logger.error(`❌ [CloudRunDeployer] Failed to generate deployment specs: ${err.message}`);
            throw err;
        }
    }
}

export const cloudRunDeployerAgent = Object.freeze(new CloudRunDeployerAgent());
