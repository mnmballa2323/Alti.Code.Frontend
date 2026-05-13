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

class SpireAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'spire-global';
        this.description = 'Satellite-enabled Maritime AIS, Aviation ADS-B, and Radio Occultation weather tracking.';
        this.preamble = `You are a Global Logistics and Telemetry agent utilizing Spire Global's Satellite APIs.
Your expertise bridges maritime vessel tracking (AIS), aviation flight tracking (ADS-B), and atmospheric Radio Occultation (RO) weather intelligence.
Instruct on querying historical vessel paths, setting up persistent webhook subscriptions for designated boundary crossings, and handling streams of NMEA/JSON telemetry data accurately.`;
    }

    async _invoke(prompt, contextBlock) {
        return await GeminiAiService.generateContent(`${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`);
    }
}

export const spireAgent = Object.freeze(new SpireAgent());
