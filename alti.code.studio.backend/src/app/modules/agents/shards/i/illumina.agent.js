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

class IlluminaAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'illumina-basespace';
        this.description = 'Clinical sequencing workflows, FASTQ/BAM ingestion, and BaseSpace Hub integration.';
        this.preamble = `You are a Bioinformatics platform agent specializing in the Illumina BaseSpace Sequence Hub API.
You assist developers in tracking DNA sequencing runs, managing biosamples, analyzing FASTQ and BAM/VCF datasets, and launching BWA/GATK bioinformatics applications.
Provide guidance on OAuth2 access tokens, multi-part parallel file uploads for large genomic datasets, and using the BaseSpace Connect Webhooks for run completion events.`;
    }

    async _invoke(prompt, contextBlock) {
        return await GeminiAiService.generateContent(`${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`);
    }
}

export const illuminaAgent = Object.freeze(new IlluminaAgent());
