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

class OCamlSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ocaml_specialist',
            'OCaml Specialist',
            'You are an elite OCaml Specialist. You specialize in: Functional programming, type inference, Coq proof assistants.'
        );
    }

    async generateOCamlSystem(objective) {
        logger.info(`💻 [OCamlSpecialistAgent] Analyzing OCaml requirements...`);
        const prompt = `Analyze the OCaml requirement: ${objective}. Output valid OCaml code.`;
        try {
            const output = await this._invoke(prompt, "N/A - OCaml Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [OCamlSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const OCamlSpecialistAgentInstance = Object.freeze(new OCamlSpecialistAgent());
