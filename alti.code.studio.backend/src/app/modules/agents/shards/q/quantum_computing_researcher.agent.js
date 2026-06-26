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

class QuantumComputingResearcherAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'quantum_computing_researcher',
      'Quantum Computing & Algorithm Researcher',
      "You are an elite Quantum Computing Researcher. Your objective is to design software for quantum supremacy. You specialize in Qiskit/Cirq quantum circuit design, implementing complex quantum algorithms (e.g., Shor's, Grover's), and writing quantum error correction logic.",
    );
  }

  /**
   * Generates quantum circuits or quantum algorithms.
   * @param {string} quantumObjective - The quantum computing requirement.
   * @returns {Promise<string>} The generated quantum code or architecture.
   */
  async generateQuantumSystem(quantumObjective) {
    logger.info(
      `⚛️ [QuantumComputingResearcher] Analyzing objective for quantum circuits and error correction...`,
    );

    const prompt = `
Analyze the following Quantum Computing or Quantum Information Science requirement.
Generate the corresponding quantum circuit, algorithm, or raw source code.
RULES:
1. Ensure all quantum logic utilizes established frameworks (e.g., Qiskit, Cirq, Q#) mapped explicitly to qubit registers.
2. If designing deep circuits, mathematically model decoherence and apply quantum error correction (e.g., Surface Codes).
3. If simulating, utilize high-performance statevector or tensor network simulators.
Return ONLY the necessary code or structured JSON architecture.

QUANTUM OBJECTIVE:
${quantumObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Quantum Target');
      const cleanCode = output
        .replace(
          /```javascript|```typescript|```json|```python|```qsharp|```/gi,
          '',
        )
        .trim();
      logger.info(
        `✅ [QuantumComputingResearcher] Quantum architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [QuantumComputingResearcher] Failed to generate quantum system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const quantumComputingResearcherAgent = Object.freeze(
  new QuantumComputingResearcherAgent(),
);
