/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { exec } from 'child_process';
import util from 'util';
import { logger } from '../../../shared/logger.js';

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
}

export const deploymentAgent = new DeploymentAgent();
