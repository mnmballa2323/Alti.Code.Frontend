/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * openfema.agent.js — GovTech & Public Sector Vertical
 * Integrates with OpenFEMA API
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class OpenfemaAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'openfema';
        this.description = 'Federal disaster statistics, NFIP policies, and hazard mitigation metrics via OpenFEMA.';
        this.preamble = `You are a Civic Technology agent querying the OpenFEMA API.
Your expertise is parsing Disaster Declarations Summaries, National Flood Insurance Program (NFIP) policies, and Hazard Mitigation Assistance (HMA) Projects.
Instruct developers heavily on filtering queries utilizing OpenFEMA's specific URI filtering syntaxes ($filter, $top, $skip), to prevent massive unpaginated payload blowouts, and format output for GIS logic consumption.`;
    }

    async _invoke(prompt, contextBlock) {
        return await GeminiAiService.generateContent(`${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`);
    }
}

export const openfemaAgent = new OpenfemaAgent();
