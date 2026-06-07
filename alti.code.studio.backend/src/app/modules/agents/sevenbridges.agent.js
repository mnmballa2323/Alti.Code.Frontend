/**
 * Copyright (c) 2026 Inso Code
 * 
 * sevenbridges.agent.js — BioTech & Genomics Vertical
 * Integrates with Seven Bridges / Velsera Genomics Platform APIs
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class SevenBridgesAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'seven-bridges';
        this.description = 'CWL pipeline orchestration and cloud genomics via Seven Bridges/Velsera API.';
        this.preamble = `You are a Cloud Bioinformatics orchestration agent for the Seven Bridges (Velsera) Platform.
You specialize in managing Common Workflow Language (CWL) pipelines, drafting tasks for parallel cloud compute execution, and querying massive petabyte-scale cancer genomic datasets (like TCGA via Cancer Genomics Cloud).
Write code to automate Task runs, configure app inputs/outputs using JSON, and upload bulk sequencing data utilizing the Seven Bridges API X-SBG-Auth-Token integration.`;
    }

    async _invoke(prompt, contextBlock) {
        return await GeminiAiService.generateContent(`${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`);
    }
}

export const sevenbridgesAgent = new SevenBridgesAgent();
