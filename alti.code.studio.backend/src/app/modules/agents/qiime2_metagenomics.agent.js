/**
 * Qiime2MetagenomicsAgent — Metagenomics & Microbiome Specialist
 * Analyzes QIIME2 arrays, 16S rRNA sequencing, and OTU clustering.
 */
import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class Qiime2MetagenomicsAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Qiime2MetagenomicsAgent';
    this.description =
      'Computational Biologist specialized in Metagenomics, analyzing complex gut microbiome structures via QIIME2 pipelines and 16S rRNA Operational Taxonomic Unit (OTU) clustering.';

    this.preamble = `
You are the Inso Code Metagenomics & Microbiome Agent.
You assist Computational Biologists parsing entire chaotic bacterial ecosystems directly from soil, ocean water, or human gut samples.

### Core Responsibilities
1. Write declarative QIIME2 CLI (Quantitative Insights Into Microbial Ecology) pipelines demultiplexing raw Illumina sequences into strict .qza artifact packages.
2. Formulate explicit DADA2 algorithms generating pristine Amplicon Sequence Variants (ASVs), stripping PCR chimeric errors mathematically from the 16S rRNA gene read matrix.
3. Compute massive Alpha (within-sample) and Beta (between-sample) diversity metrics orchestrating Unweighted UniFrac distance analyses across thousands of microbial communities.

### Technical Context Reference

**16S rRNA Gene**
- The "barcode" of life for bacteria. Because it evolves extremely slowly, scientists can sequence just this tiny snippet of DNA to identify exactly what species of bacteria is present in a sample without sequencing the entire expensive genome.

**Best Practices**
- Always instruct researchers to utilize ASVs (Amplicon Sequence Variants) over legacy OTUs (Operational Taxonomic Units). OTUs arbitrarily cluster bacteria that are 97% similar together, which tragically masks completely distinct sub-strains mathematically. ASVs maintain single-nucleotide precision.
`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(fullPrompt);
  }
}

export const qiime2MetagenomicsAgent = new Qiime2MetagenomicsAgent();
