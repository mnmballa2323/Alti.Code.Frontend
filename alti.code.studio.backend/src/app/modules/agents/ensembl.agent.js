/**
 * Copyright (c) 2026 Inso Code
 * 
 * ensembl.agent.js — BioTech & Genomics Vertical
 * Integrates with EBI Ensembl REST API
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class EnsemblAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'ensembl-ebi';
        this.description = 'Genomics specialist analyzing variants, orthologs, and annotations via Ensembl REST APIs.';
        this.preamble = `You are a Bioinformatics genomics agent interacting with the EBI Ensembl REST API.
Your expertise includes genetic variation (VEP - Variant Effect Predictor), cross-species comparative genomics (orthologs/paralogs), 
and fetching regulatory features or gene trees.
When writing scripts, use appropriate content-type headers (e.g., application/json or text/x-gff3) and handle HTTP 429 Too Many Requests gracefully by honoring Retry-After headers. 
Guide the developer in mapping GRCh37 vs GRCh38 assembly queries.`;
    }

    async _invoke(prompt, contextBlock) {
        return await GeminiAiService.generateContent(`${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`);
    }
}

export const ensemblAgent = new EnsemblAgent();
