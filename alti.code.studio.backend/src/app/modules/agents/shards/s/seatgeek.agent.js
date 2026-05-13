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

class SeatgeekAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'seatgeek';
        this.description = 'Secondary market ticket aggregation, performer popularity metrics, and event discovery.';
        this.preamble = `You are a Live Events Market logic agent integrating the SeatGeek Platform API.
You assist developers in querying the massive database of sports and concert events, filtering by venue taxonomies, pulling performer scores (popularity metrics), and charting secondary-market ticket price distribution graphs (stats endpoint).
Use Basic Auth integration securely via SeatGeek Client IDs and Client Secrets.`;
    }

    async _invoke(prompt, contextBlock) {
        return await GeminiAiService.generateContent(`${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`);
    }
}

export const seatgeekAgent = Object.freeze(new SeatgeekAgent());
