/**
 * Copyright (c) 2024–2026 Alti.Code.Studio
 *
 * "The Local Automator" — Tier 12 Micro-Specialist
 * A Swarm Agent dedicated natively to delegating complex local host tasks
 * (browser automation, shell scripts, OS interactions) directly to the 
 * user's embedded OpenClaw instance via the Proxy Tunnel.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { openclawProxyService } from '../openclaw/openclaw.proxy.service.js';
import { logger } from '../../../shared/logger.js';

class OpenClawAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'OpenClawAgent';
        this.description = 'The Local Automator — Specialist Swarm Agent dedicated natively to delegating complex local host tasks directly to the user\'s embedded OpenClaw instance via the Proxy Tunnel.';
    }

    /**
     * Standard Swarm Brain entry point.
     * @param {string|object} prompt - The goal prompt or a legacy context object.
     * @param {string} contextBlock  - Sanitized context text block.
     * @returns {Promise<string>}
     */
    async _invoke(prompt, contextBlock) {
        // Support both string input and context object to handle legacy/future invocations gracefully
        const goal = typeof prompt === 'string' ? prompt : (prompt.goal || '');
        const files = typeof prompt === 'object' ? (prompt.files || {}) : {};

        logger.info(`🤖 Local Automator: Planning delegation to physical host for goal: "${goal}"`);

        // 1. Synthesize the OpenClaw Intent
        const llmPrompt = `You are the Local Automator Swarm Agent.
Your job is to translate the current Cloud Sprint Goal into a specific automation intent for "Moltbot" (OpenClaw + Composio), an autonomous agent running physically on the user's local machine.

Moltbot has full system access, shell access, browser access, AND is natively authenticated across 800+ SaaS apps via the built-in Composio Plugin (Jira, GitHub, Slack, Notion, Salesforce, etc.).

Cloud Sprint Goal: "${goal}"
Current Code Context: ${contextBlock || JSON.stringify(files)}

Generate a precise natural language command for the local Moltbot Surrogate. 
If the goal involves SaaS platforms, explicitly instruct it to use its Composio capabilities (e.g. "Use your Composio integration to fetch Jira ticket PROJ-123 and test it against the local repository").
Optionally, it can do standard OS automation: "Open the Chrome browser, navigate to staging.alticodestudio.com...".
Return ONLY the raw intent string, no markdown.`;

        const openClawIntent = await GeminiAiService.generateContent(llmPrompt);
        const cleanIntent = openClawIntent.replace(/^["'\`]+|["'\`]+$/g, '').trim();

        logger.info(`🤖 Local Automator: Translated goal into Host Intent: "${cleanIntent}"`);

        // 2. Delegate through the Cloud Proxy Tunnel with Socratic Self-Healing
        let attempt = 1;
        const maxAttempts = 3;
        let currentIntent = cleanIntent;

        while (attempt <= maxAttempts) {
            try {
                logger.info(`🤖 Local Automator: Routing Intent (Attempt ${attempt}/${maxAttempts}): "${currentIntent}"`);
                const surrogateOutput = await openclawProxyService.delegateToLocalHost(
                    currentIntent,
                    "Return the exact stdout, test execution results, or a summary of visual confirmation."
                );

                // Check if stdout indicates a crash/error despite network SUCCESS
                if (surrogateOutput.toLowerCase().includes('critical failure') || 
                    surrogateOutput.toLowerCase().includes('error:') || 
                    surrogateOutput.toLowerCase().includes('command not found')) {
                    throw new Error(`Execution error captured in stdout: ${surrogateOutput.substring(0, 300)}`);
                }

                // Reinforce successful healed trajectory in persistent DB successes experience bank
                if (attempt > 1) {
                    try {
                        import('../skillopt/skillopt.service.js').then(({ SkillOptService }) => {
                            SkillOptService.registerSuccess(this.name, goal, currentIntent).catch(() => {});
                        }).catch(() => {});
                    } catch (err) {}
                }

                return `[OPENCLAW SURROGATE LOCAL EXECUTION]\nIntent: ${currentIntent}\nStatus: SUCCESS\nOutput:\n${surrogateOutput}`;

            } catch (error) {
                logger.warn(`⚠️ Local Automator: Attempt ${attempt} failed: ${error.message}`);
                if (attempt === maxAttempts) {
                    logger.error(`❌ Local Automator: Moltbot execution permanently failed on physical host.`);
                    throw error;
                }

                // Socratic Debate & Self-Healing synthesis via Neuromorphic Hermes
                logger.info(`🧠 [Self-Healing] Triggering Neuromorphic Hermes Socratic Debate to analyze failed execution trajectory...`);
                let socraticFeedback = '';
                try {
                    const { neuromorphicHermesAgent } = await import('./neuromorphic_hermes.agent.js');
                    const debatePrompt = `The local automator agent failed to execute the intent.
Goal: "${goal}"
Failed Intent Context: "${currentIntent}"
Execution Error Trace:
${error.message}`;

                    socraticFeedback = await neuromorphicHermesAgent._invoke(
                        debatePrompt,
                        `Analyze why the intent failed and generate a counter-proposal resolution to correct the Composio/browser path.`
                    );
                    logger.info(`🧠 [Self-Healing] Socratic Debate Verdict: ${socraticFeedback.substring(0, 300)}...`);
                } catch (debateErr) {
                    logger.warn(`Socratic debate failed: ${debateErr.message}. Falling back to standard healing prompt.`);
                }

                const healingPrompt = `You are the Local Automator Self-Healing Coordinator.
The previous local automation intent failed.

Cloud Sprint Goal: "${goal}"
Previous Failed Intent: "${currentIntent}"
Error/Trace: "${error.message}"
${socraticFeedback ? `Socratic Debate Recommendation:\n${socraticFeedback}\n` : ''}
Your task is to generate a revised, corrected intent string to resolve the failed attempt.
Return ONLY the revised raw intent string, no markdown or explanation.`;

                try {
                    const healedIntent = await GeminiAiService.generateContent(healingPrompt);
                    currentIntent = healedIntent.replace(/^["'\`]+|["'\`]+$/g, '').trim();
                    logger.info(`🧠 [Self-Healing] Evolved corrected intent: "${currentIntent}"`);
                } catch (healErr) {
                    logger.warn(`Failed to synthesize healed intent: ${healErr.message}`);
                    // fallback to retrying original
                }

                attempt++;
            }
        }
    }
}

export const openClawAgent = new OpenClawAgent();
