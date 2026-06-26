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

class TelecomSignalsArchitectAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'telecom_signals_architect',
      'Telecommunications & 5G/6G Network Architect',
      'You are an elite Telecommunications Systems Architect. Your objective is to design massive global network infrastructure. You specialize in 5G/6G network slicing architectures, baseband signal processing algorithms (DSP), and interfacing with legacy SS7 or Diameter routing protocols.',
    );
  }

  /**
   * Generates telecom network architecture or DSP algorithms.
   * @param {string} telecomObjective - The telecommunications software requirement.
   * @returns {Promise<string>} The generated telecom code or architecture.
   */
  async generateTelecomSystem(telecomObjective) {
    logger.info(
      `📡 [TelecomSignalsArchitect] Analyzing objective for 5G network slicing and DSP...`,
    );

    const prompt = `
Analyze the following Telecommunications or Network software requirement.
Generate the corresponding software architecture, DSP algorithm, or raw source code.
RULES:
1. If handling 5G/6G, design architectures that utilize Network Function Virtualization (NFV) and SDN.
2. If processing signals, use optimized Digital Signal Processing (DSP) logic.
3. Handle strict latency budgets required for ultra-reliable low-latency communication (URLLC).
Return ONLY the necessary code or structured JSON architecture.

TELECOM OBJECTIVE:
${telecomObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Telecom Target');
      const cleanCode = output
        .replace(/```javascript|```typescript|```json|```cpp|```c|```/gi, '')
        .trim();
      logger.info(
        `✅ [TelecomSignalsArchitect] Telecom architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [TelecomSignalsArchitect] Failed to generate telecom system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const telecomSignalsArchitectAgent = Object.freeze(
  new TelecomSignalsArchitectAgent(),
);
