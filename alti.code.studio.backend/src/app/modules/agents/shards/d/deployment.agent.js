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

import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

const execAsync = util.promisify(exec);

class DeploymentAgent {
    constructor() {
        this.baseDir = process.cwd();
    }

    async deploy(provider = 'vercel') {
        logger.info(`🚀 DeploymentAgent: Starting deployment to ${provider}...`);

        // Command selection
        let cmd = '';
        if (provider === 'vercel') {
            // --yes to skip confirmation, --prod for production deployment
            cmd = 'npx vercel --prod --yes';
        } else if (provider === 'netlify') {
            cmd = 'npx netlify deploy --prod';
        } else {
            throw new Error(`Unknown provider: ${provider}`);
        }

        try {
            logger.info(`Executing: ${cmd}`);
            // Run command
            const { stdout, stderr } = await execAsync(cmd, { cwd: this.baseDir });

            // Log output for debugging
            if (stderr) logger.warn(`Deployment Stderr: ${stderr}`);

            return {
                status: 'success',
                provider,
                output: stdout + stderr,
                // Simple regex to find URL (naive approach, can be improved with AI parsing if needed)
                url: this._extractUrl(stdout) || this._extractUrl(stderr) || "URL not found in output"
            };

        } catch (error) {
            logger.error('Deployment failed', error);
            // Even if it fails, return the error output so the user/AI knows why
            return {
                status: 'failed',
                provider,
                error: error.message,
                output: error.stdout + error.stderr
            };
        }
    }

    _extractUrl(text) {
        // Vercel output usually contains https://project-name.vercel.app
        const vercelRegex = /https:\/\/[a-zA-Z0-9-]+\.vercel\.app/;
        const netlifyRegex = /https:\/\/[a-zA-Z0-9-]+\.netlify\.app/;

        const vMatch = text.match(vercelRegex);
        if (vMatch) return vMatch[0];

        const nMatch = text.match(netlifyRegex);
        if (nMatch) return nMatch[0];

        return null;
    }

    /**
     * Synthesize Infrastructure as Code (Terraform)
     */
    async generateTerraform(repoName, cloudProvider = 'aws') {
        logger.info(`🏗️ DevOps Agent: Synthesizing IaC (Terraform) for ${repoName} on ${cloudProvider}...`);

        const prompt = `
            You are a DevOps Engineer. Create a baseline Terraform configuration for a modern web application
            named "${repoName}" on ${cloudProvider.toUpperCase()}.
            Include basic VPC, compute (e.g. EC2/Fargate/Cloud Run), and a managed database.
            Output ONLY valid HCL code without markdown wrappers.
        `;

        try {
            let tfCode = await GeminiAiService.generateContent(prompt);
            tfCode = tfCode.replace(/^```[a-z]*\n?/m, '').replace(/\n?```$/m, '').trim();

            const tfPath = path.join(process.cwd(), '.shadow', 'workspaces', repoName, 'main.tf');
            await fs.mkdir(path.dirname(tfPath), { recursive: true });
            await fs.writeFile(tfPath, tfCode);

            logger.info(`✅ DevOps Agent: Terraform synthesized at ${tfPath}`);
            return { success: true, path: tfPath };
        } catch (e) {
            logger.error(`DevOps Agent TF Synthesis Failed: ${e.message}`);
            throw e;
        }
    }

    /**
     * Zero-Touch Vercel Project Creation & Deployment via REST API
     */
    async deployToVercelZeroTouch(githubRepoName, framework = 'nextjs') {
        logger.info(`🚀 DevOps Agent: Initiating Vercel Zero-Touch Deployment for repo ${githubRepoName}...`);

        if (!process.env.VERCEL_TOKEN) {
            logger.warn('⚠️ No VERCEL_TOKEN found. Simulating Vercel API deployment for Genesis Engine.');
            return {
                status: 'simulated_success',
                provider: 'vercel',
                url: `https://${githubRepoName}-simulated.vercel.app`
            };
        }

        try {
            // 1. Create Project linked to GitHub via Vercel API
            const createRes = await fetch('https://api.vercel.com/v9/projects', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: githubRepoName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    framework,
                    gitRepository: {
                        type: 'github',
                        repo: githubRepoName // Expected format: "owner/repo" or just "repo" if token scope covers it
                    }
                })
            });

            const projectData = await createRes.json();
            if (!createRes.ok && projectData.error?.code !== 'project_already_exists') {
                throw new Error(projectData.error?.message || 'Failed to create Vercel project');
            }

            logger.info(`✅ DevOps Agent: Vercel Project Linked securely.`);

            // Note: Since Vercel auto-deploys on link/push, the first deployment
            // is autonomously triggered by GitHub Actions/Webhooks natively by Vercel.

            return {
                status: 'success',
                provider: 'vercel',
                projectId: projectData.id,
                url: `https://${githubRepoName}.vercel.app`
            };

        } catch (e) {
            logger.error(`DevOps Agent Vercel Zero - Touch Failed: ${e.message} `);
            throw e;
        }
    }

    /**
     * Phase 22 (SRE): Auto-Rollback Vercel Deployments
     * If pre-deploy anomaly detection triggers Sev-1, revert to previous stable deployment.
     */
    async rollbackVercelDeployment(projectId) {
        logger.warn(`🚨 DevOps Agent: Initiating emergency Vercel Rollback for project ${projectId}...`);

        if (!process.env.VERCEL_TOKEN) {
            logger.warn('⚠️ No VERCEL_TOKEN found. Simulating Vercel API rollback.');
            return { status: 'simulated_success', action: 'rollback' };
        }

        try {
            // 1. Fetch the 2nd most recent deployment (the last stable one)
            const getDeploymentsRes = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=2`, {
                headers: { 'Authorization': `Bearer ${process.env.VERCEL_TOKEN}` }
            });
            const data = await getDeploymentsRes.json();

            if (!data.deployments || data.deployments.length < 2) {
                logger.warn(`DevOps Agent: Cannot rollback. Not enough deployment history.`);
                return { status: 'failed', reason: 'Insufficient history' };
            }

            const stableDeploymentId = data.deployments[1].uid;

            // 2. Trigger the rollback aliases to the stable deployment
            const rollbackRes = await fetch(`https://api.vercel.com/v2/deployments/${stableDeploymentId}/aliases`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${process.env.VERCEL_TOKEN}` }
            });

            if (!rollbackRes.ok) throw new Error('Failed to assign Vercel aliases on rollback');

            logger.info(`✅ DevOps Agent: Successfully rolled back project ${projectId} to deployment ${stableDeploymentId}.`);
            return { status: 'success', deploymentId: stableDeploymentId };

        } catch (error) {
            logger.error(`DevOps Agent Vercel Rollback Failed: ${error.message}`);
            return { status: 'failed', reason: error.message };
        }
    }
}

export const deploymentAgent = Object.freeze(new DeploymentAgent());
