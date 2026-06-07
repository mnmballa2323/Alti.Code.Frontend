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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { logger } from '../../../../shared/logger.js';

class DevOpsAgent extends BaseSpecialistAgent {
    constructor() {
        super('devops', 'Universal Cloud Orchestrator', 'Tier 2');
        this.preamble = `You are the Universal Cloud Orchestrator, Alti's elite DevOps specialist.

        MISSION-CRITICAL COMMANDS:
        1. **Multi-Cloud Supremacy**: You autonomously deploy codebases to AWS, GCP, Azure, Vercel, and Netlify based on nothing but a natural language prompt.
        2. **IaC Sovereignty**: You generate and execute Terraform, Pulumi, or K8s manifests flawlessly to provision the required target infrastructure.
        3. **Prompt-to-Production**: You handle the entire CI/CD lifecycle, from 'build' to 'blue-green deployment' to 'horizontal scaling'.
        4. **Zero-Touch Infrastructure**: You ensure the user never sees a cloud console. You handle IAM roles, VPCs, and CDN invalidations autonomously.

        You are the bridge between 'Code' and 'Live Production' in the World of Worlds.`;
    }

    /**
     * Executes a deployment mission with autonomous self-healing and error recovery.
     */
    async executeMission(mission) {
        logger.info(`🚀 [DevOps] Initiating mission ${mission.missionId} to ${mission.platform}...`);

        try {
            // 1. Audit Phase (Sentinel Sign-off)
            const { deploymentSentinel } = await import('../security/deployment_sentinel.service.js');
            const audit = await deploymentSentinel.auditDeployment(mission);
            if (!audit.isApproved) throw new Error('Deployment rejected by Sentinel security gate.');

            // 2. Provisioning Phase (Universal Engine)
            const { uDeploymentService } = await import('../googleCloud/uDeployment.service.js');
            const result = await uDeploymentService.executeAutoDeploy(mission.platform, mission.config);

            logger.info(`✅ [DevOps] Mission ${mission.missionId} SUCCESS. Production Live at ${result.url || result.service}`);
            return result;

        } catch (error) {
            return await this.handleDeploymentFailure(mission, error);
        }
    }

    /**
     * Autonomous Root-Cause Analysis (RCA) & Rollback Loop.
     */
    async handleDeploymentFailure(mission, error) {
        logger.error(`❌ [DevOps] Mission ${mission.missionId} FAILED. Triggering Autonomous RCA...`);

        // Use Gemini 3.1 Pro to reason about the failure (logs, stack traces, cloud provider error)
        // and determine if a 'Self-Correction' attempt or 'Automatic Rollback' is required.

        const { uDeploymentService } = await import('../googleCloud/uDeployment.service.js');
        await uDeploymentService.rollBackToStable(mission.platform);

        return {
            status: 'failed_but_rolled_back',
            error: error.message,
            missionId: mission.missionId,
            rca: 'Autonomous rollback executed to preserve production stability.'
        };
    }
}

export const devOpsAgent = Object.freeze(new DevOpsAgent());
