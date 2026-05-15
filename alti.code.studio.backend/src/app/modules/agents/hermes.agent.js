import { spawn } from 'child_process';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

class HermesAgentBridge {
    constructor() {
        this.hermesPath = path.resolve(process.cwd(), 'submodules/hermes-agent/cli.py');
        this.pythonPath = path.resolve(process.cwd(), 'submodules/hermes-agent/.venv/bin/python');
    }

    /**
     * Executes the Hermes Agent autonomously using the local Python environment.
     * @param {string} prompt - The task for the AI for Code agent.
     * @returns {Promise<string>}
     */
    async executeTask(prompt) {
        return new Promise((resolve, reject) => {
            logger.info(`🤖 Initiating Hermes Agent (alti_coder) Task: ${prompt}`);
            
            // Execute the Hermes agent via CLI directly inside the workspace
            const hermesProcess = spawn(this.pythonPath, [
                this.hermesPath,
                'run',
                prompt
            ], {
                cwd: path.resolve(process.cwd(), 'submodules/hermes-agent'),
                env: {
                    ...process.env,
                    // Inject GCP credentials for sovereign cloud mode
                    GOOGLE_CLOUD_PROJECT: config.gcp_project_id || process.env.GOOGLE_CLOUD_PROJECT,
                    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
                }
            });

            let output = '';
            let errorOutput = '';

            hermesProcess.stdout.on('data', (data) => {
                const chunk = data.toString();
                output += chunk;
                logger.debug(`[Hermes] ${chunk.trim()}`);
            });

            hermesProcess.stderr.on('data', (data) => {
                const chunk = data.toString();
                errorOutput += chunk;
                logger.warn(`[Hermes STDERR] ${chunk.trim()}`);
            });

            hermesProcess.on('close', (code) => {
                if (code === 0) {
                    logger.info(`✅ Hermes Agent Task Completed Successfully.`);
                    resolve(output);
                } else {
                    logger.error(`❌ Hermes Agent failed with exit code ${code}.`);
                    reject(new Error(`Hermes execution failed:\n${errorOutput}`));
                }
            });
        });
    }
}

export const hermesAgentBridge = new HermesAgentBridge();
