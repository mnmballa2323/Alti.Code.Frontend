/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Voice Desktop Launcher" — Tier 13 Specialist
 * Maps spoken verbal intents to local system application launches via Fazm.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { fazmAgent } from './fazm.agent.js';
import { logger } from '../../../shared/logger.js';

class VoiceDesktopLauncherAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'VoiceDesktopLauncher';
        this.description = 'Voice-Driven Desktop Application Launcher Specialist';
        this.tier = 'Tier 13';
    }

    async _invoke(context, contextBlock) {
        let command;
        let isDirectInvoke = false;
        let userId = 'default-user';

        if (typeof context === 'object' && context !== null) {
            command = context.command || context.goal || context.query;
            userId = context.userId || context.uid || userId;
            isDirectInvoke = true;
        } else if (typeof context === 'string') {
            command = context;
        }

        if (!command) {
            throw new Error('Voice desktop launcher requires a verbal command description.');
        }

        logger.info(`🤖 Voice Desktop Launcher: Mapping voice command: "${command}"`);

        const refinedVoicePrompt = `Translate the spoken voice command "${command}" into a desktop launch script, launch that application on the host operating system, and return a status confirmation.`;

        try {
            const fazmResponse = await fazmAgent.consult({
                goal: refinedVoicePrompt,
                userId: userId
            });

            const output = typeof fazmResponse === 'string' ? JSON.parse(fazmResponse) : fazmResponse;

            if (isDirectInvoke) {
                return {
                    status: 'success',
                    agent: this.name,
                    action: 'voice-launch',
                    refinedPrompt: refinedVoicePrompt,
                    response: output,
                    message: `Successfully executed voice desktop launcher command.`
                };
            }

            return JSON.stringify({
                status: 'success',
                agent: this.name,
                action: 'voice-launch',
                response: output
            }, null, 2);
        } catch (error) {
            logger.error(`❌ Voice Desktop Launcher: Voice automation failed: ${error.message}`);
            throw error;
        }
    }
}

export const voiceDesktopLauncherAgent = new VoiceDesktopLauncherAgent();
