/**
 * Copyright (c) 2024 Inso Code
 *
 * "The System Preferences Tuner" — Tier 13 Specialist
 * Automates local operating system settings GUI adjustments via Simular Agent S.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { agentSAgent } from './agent_s.agent.js';
import { logger } from '../../../shared/logger.js';

class SystemPreferencesTunerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'SystemPreferencesTuner';
        this.description = 'The System Settings & Preferences GUI Tuner Specialist';
        this.tier = 'Tier 13';
    }

    async _invoke(context, contextBlock) {
        let goal;
        let isDirectInvoke = false;

        if (typeof context === 'object' && context !== null) {
            goal = context.goal || context.task;
            isDirectInvoke = true;
        } else if (typeof context === 'string') {
            goal = context;
        }

        if (!goal) {
            throw new Error('System preferences tuner requires a settings change prompt.');
        }

        logger.info(`🤖 System Preferences Tuner: Translating tuner intent: "${goal}"`);

        const refinedGUIPrompt = `Open the operating system preferences or system settings application, navigate to the panels matching the task "${goal}" (adjusting display settings, dark mode toggle, or audio properties), apply the changes, and close the window.`;

        try {
            const guiResponse = await agentSAgent.consult({
                goal: refinedGUIPrompt,
                dryRun: context.dryRun !== undefined ? context.dryRun : true,
                maxSteps: context.maxSteps || 10
            });

            const output = typeof guiResponse === 'string' ? JSON.parse(guiResponse) : guiResponse;

            if (isDirectInvoke) {
                return {
                    status: 'success',
                    agent: this.name,
                    action: 'settings-tune',
                    refinedPrompt: refinedGUIPrompt,
                    guiResponse: output,
                    message: `Successfully executed system preferences tuning GUI workflow.`
                };
            }

            return JSON.stringify({
                status: 'success',
                agent: this.name,
                action: 'settings-tune',
                guiResponse: output
            }, null, 2);
        } catch (error) {
            logger.error(`❌ System Preferences Tuner: Automation failed: ${error.message}`);
            throw error;
        }
    }
}

export const systemPreferencesTunerAgent = new SystemPreferencesTunerAgent();
