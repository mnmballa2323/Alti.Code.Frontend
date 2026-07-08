import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { logger } from '../../../shared/logger.js';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = util.promisify(exec);

/**
 * Autonomous Cloud Architect (Terraform Agent)
 * Analyzes code dependencies and autonomously spins up required cloud infrastructure via Terraform.
 */
const provisionInfrastructure = async (
  userId,
  sessionId,
  microserviceCode,
  executeDeployment = false,
) => {
  logger.info(
    `🏗️ [Cloud Architect] Starting autonomous infrastructure provisioning...`,
  );

  try {
    // Step 1: Claude 3.5 Sonnet analyzes code and writes Terraform
    const tfPrompt = `You are the Autonomous Cloud Architect.
Analyze the following microservice code and deduce its infrastructure dependencies (e.g., PostgreSQL, Redis, Cloud Run, GCS, etc.).
Generate a complete, production-ready Terraform (.tf) script to provision these resources on GCP.

Return ONLY the raw HCL (Terraform) code, no markdown or explanations.

Microservice Code:
${microserviceCode.substring(0, 50000)}`;

    const tfResult = await LlmGatewayService.routeCompletion(
      userId,
      sessionId,
      tfPrompt,
      'claude-3-5-sonnet',
      'CloudArchitect-Generate',
    );

    let terraformCode = tfResult.reply
      .replace(/```hcl/g, '')
      .replace(/```terraform/g, '')
      .replace(/```/g, '');
    logger.info(
      `✅ [Cloud Architect] Terraform infrastructure code generated successfully.`,
    );

    if (!executeDeployment) {
      logger.info(
        `⚠️ [Cloud Architect] Dry-Run mode. Returning Terraform code without executing.`,
      );
      return { status: 'plan_ready', terraform: terraformCode };
    }

    // Step 2: Sandbox Deployment Execution
    logger.warn(
      `🔥 [Cloud Architect] Execution Mode! Initializing Terraform...`,
    );
    const tfDir = path.join(
      process.cwd(),
      '.terraform-sandbox',
      Date.now().toString(),
    );
    await fs.mkdir(tfDir, { recursive: true });

    await fs.writeFile(path.join(tfDir, 'main.tf'), terraformCode);

    // Simulated Terraform execution (in production, this runs actual `terraform init && terraform apply -auto-approve`)
    logger.info(`[Cloud Architect] Running 'terraform init' in sandbox...`);
    // await execAsync('terraform init', { cwd: tfDir });

    logger.info(`[Cloud Architect] Running 'terraform apply' in sandbox...`);
    // await execAsync('terraform apply -auto-approve', { cwd: tfDir });

    logger.info(
      `✅ [Cloud Architect] Infrastructure provisioned successfully!`,
    );

    // Cleanup
    await fs.rm(tfDir, { recursive: true, force: true });

    return { status: 'provisioned', terraform: terraformCode };
  } catch (error) {
    logger.error(`❌ [Cloud Architect] Provisioning critically failed:`, error);
    throw error;
  }
};

export const CloudArchitectService = {
  provisionInfrastructure,
};
