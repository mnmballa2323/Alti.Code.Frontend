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

        // 2. Delegate through the Cloud Proxy Tunnel
        try {
            const surrogateOutput = await openclawProxyService.delegateToLocalHost(
                cleanIntent,
                "Return the exact stdout, test execution results, or a summary of visual confirmation."
            );

            // BaseSpecialistAgent requires a string return which it then wraps.
            return `[OPENCLAW SURROGATE LOCAL EXECUTION]\nIntent: ${cleanIntent}\nStatus: SUCCESS\nOutput:\n${surrogateOutput}`;

        } catch (error) {
            logger.error(`❌ Local Automator: Moltbot execution failed on physical host: ${error.message}`);
            // Let the BaseSpecialistAgent circuit breaker catch and retry this if transient
            throw error;
        }
    }
}

export const openClawAgent = new OpenClawAgent();
