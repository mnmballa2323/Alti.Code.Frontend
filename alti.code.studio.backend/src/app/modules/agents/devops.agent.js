/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import fs from 'fs/promises';
import path from 'path';

export class DevopsAgent {
    constructor() {
        this.name = 'DevOpsArchitect';
        logger.info('🌩️ DevopsAgent: Autonomous Infrastructure-as-Code Architect online.');
    }

    /**
     * Infers cloud requirements from a prompt, writes a main.tf, and deploys it.
     * @param {string} rawRequest The user request or codebase inference
     * @param {string} terraformDir The absolute path to store the generated TF plan
     * @param {string} envPath The absolute path to the local .env to inject secrets
     */
    async provisionInfrastructure(rawRequest, terraformDir, envPath) {
        logger.info(`🌩️ DevopsAgent: Analyzing architecture prompt: "${rawRequest}"`);

        // 1. Analyze requirement and draft Terraform
        const tfPrompt = `You are a DevOps Architect. The user requires infrastructure for this request: "${rawRequest}".
        Analyze this and write a secure fully functioning Google Cloud (provider "google") \`main.tf\` script.
        Include 'output' variables at the bottom for any generated ARNs, Connection Strings, or endpoints so we can extract them programmatically.
        Return ONLY the raw HCL terraform code. Do NOT wrap in \`\`\`hcl.`;

        let rawTf = await GeminiAiService.generateContent(tfPrompt);
        const mainTfCode = rawTf.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();

        // 2. Write the Terraform configuration
        await fs.mkdir(terraformDir, { recursive: true });
        const tfFile = path.join(terraformDir, 'main.tf');
        await fs.writeFile(tfFile, mainTfCode, 'utf8');

        logger.info(`🌩️ DevopsAgent: Generated \`main.tf\` configuration in ${terraformDir}`);

        // 3. Mock Shell Execution: `terraform init && terraform apply -auto-approve`
        const mockApplyOutput = await this._mockTerraformApply(tfFile);

        // 4. Inject Extracted Outputs into local .env
        await this._injectEnvOutputs(envPath, mockApplyOutput.outputs);

        return {
            success: true,
            tfCode: mainTfCode,
            outputs: mockApplyOutput.outputs
        };
    }

    async _mockTerraformApply(tfFilePath) {
        logger.info(`🌩️ [MOCK SHELL] Executing: \`cd ${path.dirname(tfFilePath)} && terraform init\``);
        logger.info(`🌩️ [MOCK SHELL] Executing: \`terraform apply -auto-approve\``);

        // Mock a successful terraform extraction representing a GCS bucket
        return {
            status: 0,
            outputs: {
                GCP_STORAGE_BUCKET_NAME: `alti-cloud-storage-${Date.now()}`,
                GCP_REGION: 'us-central1'
            }
        };
    }

    async _injectEnvOutputs(envPath, newVarsObj) {
        let envContent = '';
        try {
            envContent = await fs.readFile(envPath, 'utf8');
        } catch {
            // File doesn't exist, we will create it
        }

        let additions = '\n# [DevOps Agent] Auto-Provisioned Infrastructure Outputs\n';
        for (const [key, value] of Object.entries(newVarsObj)) {
            additions += `${key}=${value}\n`;
        }

        await fs.writeFile(envPath, envContent + additions, 'utf8');
        logger.info(`🌩️ DevopsAgent: Successfully injected new environment variables into ${path.basename(envPath)}`);
    }
}

export const devopsAgent = new DevopsAgent();
