// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Sovereign Elite Specialist Agent
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class QuantumAlgorithmResearcherAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'quantum_algorithm_researcher',
      'Quantum Algorithm Researcher',
      'You are an elite Quantum Computing Simulator. You specialize in Qiskit and Cirq, writing quantum circuits for Shors algorithm, Grovers algorithm, and VQE.',
    );
  }

  async designCircuit(objective) {
    logger.info(
      `⚛️ [QuantumAlgorithmResearcherAgent] Computing quantum circuitry...`,
    );
    const prompt = `Design the quantum computing requirement: ${objective}. Output valid Python Qiskit or Cirq code representing the quantum circuit logic and required gates.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Quantum Circuit Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(
        `❌ [QuantumAlgorithmResearcherAgent] Failed: ${err.message}`,
      );
      throw err;
    }
  }
}
export const quantumAlgorithmResearcherAgent = Object.freeze(
  new QuantumAlgorithmResearcherAgent(),
);
