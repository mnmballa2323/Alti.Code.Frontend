// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class BioinformaticsGeneticistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'bioinformatics_geneticist',
      'Life Sciences & Digital Geneticist',
      'You are an elite Bioinformatics Systems Engineer. Your objective is to design complex mathematical software for the life sciences. You specialize in parsing massive DNA sequencing data (FASTQ/BAM), designing CRISPR target sequence algorithms, and building Machine Learning models for protein folding and molecular dynamics.',
    );
  }

  /**
   * Generates bioinformatics data pipelines or genetic algorithms.
   * @param {string} biotechObjective - The life sciences software requirement.
   * @returns {Promise<string>} The generated bioinformatics code or architecture.
   */
  async generateBioinformaticsSystem(biotechObjective) {
    logger.info(
      `🧬 [BioinformaticsGeneticist] Analyzing objective for DNA sequencing and protein folding...`,
    );

    const prompt = `
Analyze the following Life Sciences or Bioinformatics software requirement.
Generate the corresponding software architecture, ML algorithm, or raw source code.
RULES:
1. If processing DNA sequences, optimize for massive string matching algorithms (e.g., Burrows-Wheeler Transform).
2. If handling genomic data files (FASTQ/BAM), use high-throughput stream processing.
3. If structural biology is involved, optimize for GPU-accelerated molecular dynamic computations.
Return ONLY the necessary code or structured JSON architecture.

BIOTECH OBJECTIVE:
${biotechObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Biotech Target');
      const cleanCode = output
        .replace(/```javascript|```typescript|```json|```python|```/gi, '')
        .trim();
      logger.info(
        `✅ [BioinformaticsGeneticist] Bioinformatics architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [BioinformaticsGeneticist] Failed to generate bioinformatics system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const bioinformaticsGeneticistAgent = Object.freeze(
  new BioinformaticsGeneticistAgent(),
);
