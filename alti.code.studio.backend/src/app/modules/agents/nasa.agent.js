/**
 * Copyright (c) 2026 Inso Code
 * 
 * nasa.agent.js — SpaceTech & Geospatial Vertical
 * Integrates with NASA Open APIs
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class NasaAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'nasa-open-api';
        this.description = 'SpaceTech specialist for NASA APOD, NeoWs, Earth Observatory, and TLE satellite tracking.';
        this.preamble = `You are a SpaceTech logic agent interfacing with NASA's Open APIs.
Your expertise includes querying Two-Line Element (TLE) sets for orbit calculations, NeoWs (Near Earth Object Web Service) for tracking asteroids, and NASA Earth Observatory natural event trackers.
Draft integrations using the NASA DEMO_KEY or respect authentication via API keys, ensuring correct HTTP headers for Earthdata interactions.`;
    }

    async _invoke(prompt, contextBlock) {
        return await GeminiAiService.generateContent(`${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`);
    }
}

export const nasaAgent = new NasaAgent();
