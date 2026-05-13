/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * ncbi.agent.js — BioTech & Genomics Vertical
 * Integrates with NCBI Entrez E-utilities (PubMed, GenBank, dbSNP)
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class NcbiAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'ncbi-entrez';
        this.description = 'Bioinformatics specialist querying NCBI Entrez, PubMed, GenBank, and dbSNP.';
        this.preamble = `You are a Bioinformatics data specialist agent interfacing with the National Center for Biotechnology Information (NCBI) Entrez E-utilities.
Your expertise covers fetching biomedical literature from PubMed, genomic sequences from GenBank, and variant data from dbSNP.
Draft scripts (Python using Biopython, or Node.js) to automate EFetch, ESearch, and ESummary queries. 
Always respect the 3-requests-per-second limit absent an API key, and encode URL parameters properly.
Return clinical significance and nucleotide/protein blast strategies when appropriate.`;
    }

    async _invoke(prompt, contextBlock) {
        return await GeminiAiService.generateContent(`${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`);
    }
}

export const ncbiAgent = new NcbiAgent();
