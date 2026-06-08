/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Voice Calendar Scheduler" — Tier 13 Specialist
 * Transcribes and automates calendar event bookings via Fazm.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { fazmAgent } from './fazm.agent.js';
import { logger } from '../../../shared/logger.js';

class VoiceCalendarSchedulerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'VoiceCalendarScheduler';
        this.description = 'Voice-Driven Calendar Event Scheduler Specialist';
        this.tier = 'Tier 13';
    }

    async _invoke(context, contextBlock) {
        let scheduleRequest;
        let isDirectInvoke = false;
        let userId = 'default-user';

        if (typeof context === 'object' && context !== null) {
            scheduleRequest = context.scheduleRequest || context.goal || context.query;
            userId = context.userId || context.uid || userId;
            isDirectInvoke = true;
        } else if (typeof context === 'string') {
            scheduleRequest = context;
        }

        if (!scheduleRequest) {
            throw new Error('Voice calendar scheduler requires calendar event scheduling instructions.');
        }

        logger.info(`🤖 Voice Calendar Scheduler: Mapping schedule request: "${scheduleRequest}"`);

        const refinedPrompt = `Listen to or process the vocal calendar scheduling prompt: "${scheduleRequest}". Extract meeting title, date, start time, end time, and invitee emails, draft a calendar invite payload, execute the calendar add action, and return confirmation details.`;

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
                    action: 'calendar-schedule',
                    refinedPrompt: refinedPrompt,
                    response: output,
                    message: `Successfully scheduled calendar event from vocal command.`
                };
            }

            return JSON.stringify({
                status: 'success',
                agent: this.name,
                action: 'calendar-schedule',
                response: output
            }, null, 2);
        } catch (error) {
            logger.error(`❌ Voice Calendar Scheduler: Voice scheduling failed: ${error.message}`);
            throw error;
        }
    }
}

export const voiceCalendarSchedulerAgent = new VoiceCalendarSchedulerAgent();
