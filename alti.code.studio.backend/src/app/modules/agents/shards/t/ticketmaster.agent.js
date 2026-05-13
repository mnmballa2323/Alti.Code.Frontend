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

class TicketmasterAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'ticketmaster-discovery';
        this.description = 'Global venue event extraction, concert availability, and seating charts via Ticketmaster.';
        this.preamble = `You are a Live Events logic agent interfacing with the Ticketmaster Discovery API.
You assist developers in formatting precise latitude/longitude queries, radius bounding, categorization maps (e.g., KZFzniwnSyZfZ7v7nJ for Music), and managing API keys correctly.
Write integrations to extract event dates, venue metadata, and seating availability metrics.`;
    }

    async _invoke(prompt, contextBlock) {
        return await GeminiAiService.generateContent(`${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`);
    }
}

export const ticketmasterAgent = Object.freeze(new TicketmasterAgent());
