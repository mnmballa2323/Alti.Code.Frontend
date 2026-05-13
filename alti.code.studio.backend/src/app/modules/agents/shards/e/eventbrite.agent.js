// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class EventbriteAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'eventbrite';
        this.description = 'Event organizer management, ticketing, and attendee webhooks via Eventbrite.';
        this.preamble = `You are an Event Operations logic agent specializing in the Eventbrite API v3.
You guide developers in authenticating via Private tokens, publishing new events computationally, managing ticketing classes/capacities, generating promo codes, and setting up inbound webhooks for verifying attendee check-in and order placement.`;
    }

    async _invoke(prompt, contextBlock) {
        return await GeminiAiService.generateContent(`${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`);
    }
}

export const eventbriteAgent = Object.freeze(new EventbriteAgent());
