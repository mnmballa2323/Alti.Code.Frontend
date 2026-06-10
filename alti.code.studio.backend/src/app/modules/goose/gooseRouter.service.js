import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

class GooseRouterService {
    constructor() {
        this.goosePath = '/Users/michaelmeram/.local/bin/goose';
    }

    /**
     * Determines if a prompt is a code modification or development task.
     * @param {string} prompt 
     * @returns {boolean}
     */
    shouldRouteToGoose(prompt) {
        const codeKeywords = [
            'write', 'create', 'edit', 'modify', 'change', 'update', 'delete', 'remove',
            'add', 'implement', 'fix', 'bug', 'error', 'refactor', 'optimize', 'patch',
            'build', 'run', 'test', 'compile', 'deploy', 'code', 'file', 'script'
        ];
        const lower = prompt.toLowerCase();
        return codeKeywords.some(keyword => lower.includes(keyword));
    }

    /**
     * Spawns a local Goose process to handle the task in the workspace.
     * @param {string} prompt 
     * @param {Array} context 
     * @param {Function} onProgress 
     * @returns {Promise<string>}
     */
    async executeTask(prompt, context = [], onProgress = null) {
        return new Promise((resolve, reject) => {
            logger.info(`🪶 GooseRouter: Intercepting task for Goose execution...`);
            if (onProgress) onProgress({ status: 'started', message: 'Goose Smart Routing activated' });

            const contextBlock = context.join('\n');
            const fullPrompt = contextBlock ? `${contextBlock}\n\nTask: ${prompt}` : prompt;

            // Setup environment variables for Goose
            const env = {
                ...process.env,
                GOOSE_PROVIDER: 'google',
                GOOGLE_API_KEY: config.gemini_secret_key || process.env.GEMINI_API_KEY,
                GOOSE_MODEL: config.gcp.model_name || 'gemini-1.5-pro',
            };

            // Use gcp_vertex_ai in production if GCP credentials exist
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_APPLICATION_CREDENTIALS !== 'dummy-gcp-creds.json') {
                env.GOOSE_PROVIDER = 'gcp_vertex_ai';
                env.GCP_PROJECT_ID = config.gcp.project_id;
                env.GCP_LOCATION = config.gcp.location;
            }

            logger.info(`🪶 GooseRouter: Spawning Goose CLI at ${this.goosePath} with provider: ${env.GOOSE_PROVIDER}, model: ${env.GOOSE_MODEL}`);
            
            // Spawn Goose run command
            const gooseProcess = spawn(this.goosePath, [
                'run',
                '--no-profile',
                '-q',
                '--no-session',
                '-t',
                fullPrompt
            ], {
                cwd: path.resolve(process.cwd(), '../'), // Run in workspace root
                env
            });

            let stdout = '';
            let stderr = '';

            gooseProcess.stdout.on('data', (data) => {
                const chunk = data.toString();
                stdout += chunk;
                if (onProgress) onProgress({ status: 'executing', message: 'Goose is working on the task...' });
                logger.debug(`[Goose STDOUT] ${chunk.trim()}`);
            });

            gooseProcess.stderr.on('data', (data) => {
                const chunk = data.toString();
                stderr += chunk;
                logger.warn(`[Goose STDERR] ${chunk.trim()}`);
            });

            gooseProcess.on('close', (code) => {
                if (code === 0) {
                    logger.info(`✅ Goose Task Completed Successfully.`);
                    resolve(stdout.trim() || 'Task executed successfully by Goose.');
                } else {
                    logger.error(`❌ Goose failed with exit code ${code}.`);
                    reject(new Error(`Goose execution failed (code ${code}):\n${stderr || stdout}`));
                }
            });

            gooseProcess.on('error', (err) => {
                logger.error(`❌ Goose failed to start: ${err.message}`);
                reject(err);
            });
        });
    }
}

export const gooseRouterService = new GooseRouterService();
