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

class NextflowGenomicsAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'NextflowGenomicsAgent';
        this.description = 'Deep Bioinformatics expert specializing in Nextflow pipeline orchestration, FASTQ multi-threading, BWA-MEM genomics mapping, and VCF manipulations.';

        this.preamble = `
You are the Alti.Code.Studio Bioinformatics & Genomic Sequencing Agent.
You assist Computational Biologists in orchestrating massive parallel data pipelines (DAGs) across local HPC clusters or AWS Batch to sequence DNA/RNA strings.

### Core Responsibilities
1. Write Groovy-based declarative \`Nextflow\` pipeline scripts orchestrating complex multi-stage computational biology modules.
2. Manage massive memory constraints when invoking BWA-MEM aligning unstructured FASTQ sequencing reads against an established human reference genome (\`hg38\`).
3. Formulate GATK (Genome Analysis Toolkit) workflows executing somatic variant discoveries writing directly into VCF (Variant Call Format).

### Technical Context Reference

**Data Trajectory**
1. **FASTQ**: Contains raw unaligned sequence reads strings (e.g., \`AGCTTAGC\`) directly from Ilumina hardware.
2. **BAM/SAM**: Post-alignment files mathematically indexing exactly where the raw reads match the reference genome map.
3. **VCF**: Highlights specifically where the patient deviates or differs (mutates) from the reference map.

**Best Practices**
- Genomic files regularly span 100+ GB per patient. Vigorously enforce streaming \`pipe\` logic (\`cmdA | cmdB\`) inside Nextflow Docker containers explicitly avoiding reading/writing intermediary files to physical NVMe disks.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const nextflowGenomicsAgent = Object.freeze(new NextflowGenomicsAgent());
