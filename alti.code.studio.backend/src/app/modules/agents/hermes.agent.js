/**
 * Copyright (c) 2024–2026 Inso Code
 *
 * "The Hermes Vanguard"
 * A Specialist Agent wrapper mapping standard swarm brain pipelines to the
 * autonomous NousResearch Hermes CLI execution bridge.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { spawn } from 'child_process';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

class HermesAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'HermesAgent';
        this.description = 'The Hermes Vanguard CLI python executor bridge. Executes the autonomous self-improving Hermes Agent locally.';
        this.hermesPath = path.resolve(process.cwd(), 'submodules/hermes-agent/cli.py');
        this.pythonPath = path.resolve(process.cwd(), 'submodules/hermes-agent/.venv/bin/python');
    }

    /**
     * Standard Swarm Brain entry point.
     * @param {string} prompt       - The instruction prompt.
     * @param {string} contextBlock - Sanitized context text block.
     * @returns {Promise<string>}
     */
    async _invoke(prompt, contextBlock) {
        const fullPrompt = contextBlock ? `${contextBlock}\n\nTask: ${prompt}` : prompt;
        return this.executeTask(fullPrompt);
    }

    /**
     * Executes the Hermes Agent autonomously using the local Python environment.
     * @param {string} prompt - The task for the AI for Code agent.
     * @returns {Promise<string>}
     */
    async _runHermesCliProcess(prompt) {
        return new Promise((resolve, reject) => {
            logger.info(`🤖 Initiating Hermes Agent (alti_coder) Task: ${prompt.substring(0, 100)}...`);
            
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
                    reject(new Error(`Hermes execution failed:\n${errorOutput || output}`));
                }
            });
        });
    }

    /**
     * Executes the Hermes Agent task autonomously with a Socratic Debate & Repair Loop.
     * @param {string} prompt - The task for the AI for Code agent.
     * @returns {Promise<string>}
     */
    async executeTask(prompt) {
        let attempt = 1;
        const maxAttempts = 2;
        let currentPrompt = prompt;

        while (attempt <= maxAttempts) {
            try {
                const output = await this._runHermesCliProcess(currentPrompt);
                
                // Reinforce successful healed trajectory in persistent DB successes experience bank
                if (attempt > 1) {
                    try {
                        import('../skillopt/skillopt.service.js').then(({ SkillOptService }) => {
                            SkillOptService.registerSuccess(this.name, prompt, currentPrompt).catch(() => {});
                        }).catch(() => {});
                    } catch (err) {}
                }

                return output;
            } catch (error) {
                logger.warn(`⚠️ Hermes Agent: Task execution failed on Attempt ${attempt}/${maxAttempts}: ${error.message}`);
                if (attempt === maxAttempts) {
                    throw error;
                }

                // Socratic Debate & Repair using Neuromorphic Hermes Vanguard
                try {
                    logger.info(`🧠 [Self-Improving] Triggering Neuromorphic Hermes Socratic Debate to analyze failed execution trajectory...`);
                    const { neuromorphicHermesAgent } = await import('./neuromorphic_hermes.agent.js');
                    
                    const debatePrompt = `The Hermes autonomous coder agent failed to complete the task.
Task: "${prompt}"
Failed Prompt Context: "${currentPrompt}"
CLI Error Trace:
${error.message}`;

                    const debateResolution = await neuromorphicHermesAgent._invoke(
                        debatePrompt,
                        `Analyze the CLI crash and provide the concrete counter-proposal to resolve it.`
                    );

                    logger.info(`🧠 [Self-Improving] Socratic Debate Verdict: ${debateResolution.substring(0, 300)}...`);
                    
                    // Synthesize revised prompt including the socratic counter-proposal
                    currentPrompt = `${prompt}\n\n=== REINFORCED FEEDBACK FROM SOCRATIC DEBATE ===\nThe previous execution failed. Follow these structural adjustments:\n${debateResolution}\n================================================`;
                    
                    logger.info(`🧠 [Self-Improving] Evolved prompt trajectory completed. Retrying task...`);
                } catch (debateErr) {
                    logger.warn(`Socratic debate failed: ${debateErr.message}. Retrying with original prompt.`);
                }

                attempt++;
            }
        }
    }
}

export const hermesAgent = new HermesAgent();
export const hermesAgentBridge = hermesAgent;
