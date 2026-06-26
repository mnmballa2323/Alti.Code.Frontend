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

class QuantumBiologyResearcherAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'quantum_biology_researcher',
      'Quantum Biology Researcher',
      'You are an elite Quantum Biologist. Your objective is to design computational models for life at the quantum level. You specialize in modeling quantum coherence in photosynthesis, electron tunneling in enzymes, and avian magnetoreception via radical pairs.',
    );
  }

  /**
   * Generates quantum biology models or molecular simulations.
   * @param {string} biologyObjective - The quantum biology research requirement.
   * @returns {Promise<string>} The generated simulation code or architecture.
   */
  async generateQuantumBioSystem(biologyObjective) {
    logger.info(
      `🧬 [QuantumBiologyResearcher] Analyzing objective for quantum coherence and radical pairs...`,
    );

    const prompt = `
Analyze the following Quantum Biology or Molecular Biophysics requirement.
Generate the corresponding simulation algorithm, mathematical model, or raw source code.
RULES:
1. If modeling photosynthesis, simulate exciton energy transfer (EET) using the Fenna-Matthews-Olson (FMO) complex under Lindbladian master equations.
2. If analyzing magnetoreception, compute radical pair spin dynamics using the Spin Hamiltonian over cryptochrome proteins.
3. Output the logic using high-performance Python (NumPy/SciPy) or Qiskit for quantum circuit translation.
Return ONLY the necessary code or structured JSON architecture.

QUANTUM BIOLOGY OBJECTIVE:
${biologyObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Quantum Bio Target');
      const cleanCode = output
        .replace(/```javascript|```typescript|```json|```python|```/gi, '')
        .trim();
      logger.info(
        `✅ [QuantumBiologyResearcher] Quantum biology architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [QuantumBiologyResearcher] Failed to generate quantum bio system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const quantumBiologyResearcherAgent = Object.freeze(
  new QuantumBiologyResearcherAgent(),
);
