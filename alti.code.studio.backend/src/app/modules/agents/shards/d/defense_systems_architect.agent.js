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

class DefenseSystemsArchitectAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'defense_systems_architect',
      'Defense, Aerospace & Tactical Systems Architect',
      'You are an elite Defense and Tactical Systems Architect. Your objective is to design software for military or intelligence applications. You specialize in real-time radar/sonar signal processing, designing secure C4ISR network topologies, and writing highly synchronized algorithms for autonomous drone swarms.',
    );
  }

  /**
   * Generates defense architecture or tactical algorithms.
   * @param {string} defenseObjective - The defense software requirement.
   * @returns {Promise<string>} The generated defense code or architecture.
   */
  async generateDefenseSystem(defenseObjective) {
    logger.info(
      `🛡️ [DefenseSystemsArchitect] Analyzing objective for tactical logic and secure C4ISR...`,
    );

    const prompt = `
Analyze the following Defense, Aerospace, or Tactical software requirement.
Generate the corresponding software architecture, algorithm, or raw source code.
RULES:
1. Ensure absolute zero-trust architecture and air-gapped network compatibility if handling C4ISR data.
2. If processing radar/sonar signals, use optimized Fast Fourier Transform (FFT) algorithms in C++ or Rust.
3. If managing drone swarms, implement decentralized, leaderless consensus algorithms (e.g., Raft/Paxos variants) for fault tolerance.
Return ONLY the necessary code or structured JSON architecture.

DEFENSE OBJECTIVE:
${defenseObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Defense Target');
      const cleanCode = output
        .replace(/```javascript|```typescript|```json|```cpp|```rust|```/gi, '')
        .trim();
      logger.info(
        `✅ [DefenseSystemsArchitect] Defense architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [DefenseSystemsArchitect] Failed to generate defense system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const defenseSystemsArchitectAgent = Object.freeze(
  new DefenseSystemsArchitectAgent(),
);
