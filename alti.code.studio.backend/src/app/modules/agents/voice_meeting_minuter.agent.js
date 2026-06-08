/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Voice Meeting Minuter" — Tier 13 Specialist
 * Transcribes and formats spoken desktop conversations into minutes via Fazm.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { fazmAgent } from './fazm.agent.js';
import { logger } from '../../../shared/logger.js';

class VoiceMeetingMinuterAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'VoiceMeetingMinuter';
        this.description = 'Voice-Driven Meeting Transcription & Minuter Specialist';
        this.tier = 'Tier 13';
    }

    async _invoke(context, contextBlock) {
        let transcript;
        let isDirectInvoke = false;
        let userId = 'default-user';

        if (typeof context === 'object' && context !== null) {
            transcript = context.transcript || context.goal || context.query;
            userId = context.userId || context.uid || userId;
            isDirectInvoke = true;
        } else if (typeof context === 'string') {
            transcript = context;
        }

        if (!transcript) {
            throw new Error('Voice meeting minuter requires vocal transcript text or meeting goal.');
        }

        logger.info(`🤖 Voice Meeting Minuter: Structuring meeting minutes from: "${transcript.substring(0, 50)}..."`);

        const refinedPrompt = `Listen to or process the vocal meeting transcript: "${transcript}". Generate a beautifully formatted Markdown meeting summary containing: Meeting Title, Date (today), Attendees, Key Decisions, Action Items (with owners), and Next Steps.`;

        try {
            const fazmResponse = await fazmAgent.consult({
                goal: refinedPrompt,
                userId: userId
            });

            const output = typeof fazmResponse === 'string' ? JSON.parse(fazmResponse) : fazmResponse;

            if (isDirectInvoke) {
                return {
                    status: 'success',
                    agent: this.name,
                    action: 'meeting-minutes',
                    refinedPrompt: refinedPrompt,
                    response: output,
                    message: `Successfully structured vocal transcript into meeting minutes.`
                };
            }

            return JSON.stringify({
                status: 'success',
                agent: this.name,
                action: 'meeting-minutes',
                response: output
            }, null, 2);
        } catch (error) {
            logger.error(`❌ Voice Meeting Minuter: Voice structuring failed: ${error.message}`);
            throw error;
        }
    }
}

export const voiceMeetingMinuterAgent = new VoiceMeetingMinuterAgent();
