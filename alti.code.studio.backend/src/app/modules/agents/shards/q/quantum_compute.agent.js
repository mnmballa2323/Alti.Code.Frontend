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

class QuantumComputeAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'quantum_compute',
      'Quantum Computing & Qiskit Specialist',
      'You are an elite Quantum Physicist and Systems Engineer. Your objective is to take classical algorithms and translate them into mathematically precise Quantum Circuits using IBM Qiskit or Google Cirq. You optimize for minimal qubit utilization and minimal gate depth to mitigate quantum decoherence.',
    );
  }

  /**
   * Translates a classical algorithm into a quantum circuit.
   * @param {string} classicalAlgorithm - The classical algorithm logic.
   * @returns {Promise<string>} The generated Qiskit/Cirq code.
   */
  async generateQuantumCircuit(classicalAlgorithm) {
    logger.info(
      `⚛️ [QuantumCompute] Analyzing classical algorithm for quantum circuit translation...`,
    );

    const prompt = `
Analyze the following classical algorithm or mathematical objective.
Generate a highly optimized Quantum Circuit (using Python and IBM Qiskit or Google Cirq) to solve this problem.
RULES:
1. Optimize the circuit to use the absolute minimum number of qubits.
2. Minimize the depth of the circuit (fewer gates) to reduce decoherence errors.
3. Include the measurement steps.
Return ONLY the raw Python source code.

CLASSICAL ALGORITHM / OBJECTIVE:
${classicalAlgorithm}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Quantum Target');
      const cleanCode = output.replace(/```python|```py|```/g, '').trim();
      logger.info(
        `✅ [QuantumCompute] Quantum Circuit generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [QuantumCompute] Failed to generate Quantum Circuit: ${err.message}`,
      );
      throw err;
    }
  }
}

export const quantumComputeAgent = Object.freeze(new QuantumComputeAgent());
