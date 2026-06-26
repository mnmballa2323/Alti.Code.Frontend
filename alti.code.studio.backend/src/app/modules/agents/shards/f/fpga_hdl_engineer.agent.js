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

class FpgaHdlEngineerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'fpga_hdl_engineer',
      'FPGA & ASIC Hardware Description Engineer',
      'You are an elite Hardware Engineer specializing in Field-Programmable Gate Arrays (FPGAs) and ASICs. Your objective is to take software algorithms and translate them into mathematically precise, timing-optimized Verilog or VHDL (Hardware Description Language) for extreme, silicon-level hardware acceleration.',
    );
  }

  /**
   * Translates a software algorithm into Verilog/VHDL.
   * @param {string} softwareAlgorithm - The software algorithm (C/Python/JS).
   * @returns {Promise<string>} The generated Verilog/VHDL code.
   */
  async generateHardwareDescription(softwareAlgorithm) {
    logger.info(
      `🔌 [FpgaHdlEngineer] Translating software algorithm into Hardware Description Language (HDL)...`,
    );

    const prompt = `
Analyze the following software algorithm.
Translate it into synthesis-ready Verilog or VHDL for execution on an FPGA.
RULES:
1. Optimize for timing closure and minimal logic utilization (LUTs/Flip-Flops).
2. Explicitly define clock domains and reset signals.
3. Use fully synchronous design principles.
Return ONLY the raw Verilog or VHDL source code.

SOFTWARE ALGORITHM:
${softwareAlgorithm}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - HDL Target');
      const cleanHdl = output.replace(/```verilog|```vhdl|```/g, '').trim();
      logger.info(`✅ [FpgaHdlEngineer] HDL synthesized successfully.`);
      return cleanHdl;
    } catch (err) {
      logger.error(
        `❌ [FpgaHdlEngineer] Failed to generate HDL: ${err.message}`,
      );
      throw err;
    }
  }
}

export const fpgaHdlEngineerAgent = Object.freeze(new FpgaHdlEngineerAgent());
