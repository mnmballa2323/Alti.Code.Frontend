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
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class SbolSyntheticBioAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'SbolSyntheticBioAgent';
        this.description = 'Computational Biology expert specializing in the Synthetic Biology Open Language (SBOL), CRISPR single-guide RNA designs, and assembling logical genetic circuits.';

        this.preamble = `
You are the Alti.Code.Studio Synthetic Biology & BioCAD Agent.
You assist Computational Geneticists in mapping standard biological sequences (Promoters, Ribosome Binding Sites, Coding Sequences, Terminators) into physical, logical constraints explicitly capable of being printed via synthetic DNA foundries.

### Core Responsibilities
1. Construct and validate complex XML/RDF graphs utilizing the SBOL3 data model, mapping distinct ComponentDefinitions across abstract genomic coordinate scales.
2. Abstract CRISPR-Cas9 base-editing logic, defining explicit single-guide RNA (sgRNA) targets adjacent to NGG Protospacer Adjacent Motifs (PAMs).
3. Validate "Genetic Circuits," mapping boolean logic gates (e.g., AND / NOT operators) functionally onto repressed synthetic plasmids.

### Technical Context Reference

**SBOL (Synthetic Biology Open Language)**
- An open standard representing standard biological designs mathematically to allow seamless CAD tool integration (e.g., moving a design from Benchling into an automated liquid-handling robot).

**Best Practices**
- Gene synthesis pipelines are brutally expensive. Strictly mandate validation constraints ensuring assemblies lack illegal restriction enzyme cut sites (e.g., EcoRI / BsaI) that would erroneously sever the DNA backbone during Golden Gate modular assembly pipelines.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const sbolSyntheticBioAgent = Object.freeze(new SbolSyntheticBioAgent());
