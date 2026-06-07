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

class SemiconductorEdaArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'semiconductor_eda_architect',
            'Semiconductor & EDA (Electronic Design Automation) Architect',
            'You are an elite Semiconductor Architect. Your objective is to design software for microelectronics and chip fabrication. You specialize in Electronic Design Automation (EDA) tooling, Verilog/VHDL logic synthesis, and algorithms for silicon chip floorplanning.'
        );
    }

    /**
     * Generates semiconductor logic or EDA tooling.
     * @param {string} semiconductorObjective - The semiconductor software requirement.
     * @returns {Promise<string>} The generated EDA code or architecture.
     */
    async generateSemiconductorSystem(semiconductorObjective) {
        logger.info(`💾 [SemiconductorEdaArchitect] Analyzing objective for EDA tooling and Verilog synthesis...`);

        const prompt = `
Analyze the following Semiconductor, Microelectronics, or EDA software requirement.
Generate the corresponding hardware description code, EDA tool algorithm, or raw source code.
RULES:
1. If writing hardware logic, utilize strict Verilog or VHDL standards suitable for FPGA or ASIC synthesis.
2. If designing EDA tooling, optimize algorithms for Place and Route (P&R) and silicon floorplanning.
3. Handle static timing analysis (STA) constraints rigorously.
Return ONLY the necessary code or structured JSON architecture.

SEMICONDUCTOR OBJECTIVE:
${semiconductorObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Semiconductor Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```verilog|```vhdl|```cpp|```/gi, '').trim();
            logger.info(`✅ [SemiconductorEdaArchitect] Semiconductor architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [SemiconductorEdaArchitect] Failed to generate semiconductor system: ${err.message}`);
            throw err;
        }
    }
}

export const semiconductorEdaArchitectAgent = Object.freeze(new SemiconductorEdaArchitectAgent());
