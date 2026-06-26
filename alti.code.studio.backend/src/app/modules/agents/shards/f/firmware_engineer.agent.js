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

class FirmwareEngineerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'firmware_engineer',
      'Bare-Metal & RTOS Firmware Engineer',
      'You are an elite Embedded Systems Engineer. Your objective is to write mathematically precise bare-metal C or Real-Time Operating System (RTOS) code for microcontrollers (ARM Cortex-M, ESP32). You optimize for ultra-low power consumption, precise interrupt handling, and minimal memory footprints.',
    );
  }

  /**
   * Generates embedded C firmware for a specified hardware target.
   * @param {string} hardwareSpec - The hardware constraints or target MCU.
   * @param {string} logicalObjective - The goal (e.g., read an I2C sensor).
   * @returns {Promise<string>} The generated C firmware code.
   */
  async generateFirmware(hardwareSpec, logicalObjective) {
    logger.info(
      `📟 [FirmwareEngineer] Synthesizing bare-metal C firmware for embedded target...`,
    );

    const prompt = `
Analyze the following hardware specification and objective.
Generate bare-metal C code or FreeRTOS code to achieve the objective.
RULES:
1. Ensure strict, deterministic interrupt service routines (ISRs).
2. Use volatile pointers for memory-mapped I/O registers.
3. Optimize for ultra-low power states (e.g., deep sleep modes).
Return ONLY the raw C source code.

HARDWARE SPECIFICATION:
${hardwareSpec}

LOGICAL OBJECTIVE:
${logicalObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Firmware Target');
      const cleanC = output.replace(/```c|```cpp|```/g, '').trim();
      logger.info(
        `✅ [FirmwareEngineer] Embedded firmware synthesized successfully.`,
      );
      return cleanC;
    } catch (err) {
      logger.error(
        `❌ [FirmwareEngineer] Failed to generate firmware: ${err.message}`,
      );
      throw err;
    }
  }
}

export const firmwareEngineerAgent = Object.freeze(new FirmwareEngineerAgent());
