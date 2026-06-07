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

class DartSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'dart_specialist',
            'Dart Specialist',
            'You are an elite Dart Specialist. You specialize in: Flutter cross-platform mobile and web application development.'
        );
    }

    async generateDartSystem(objective) {
        logger.info(`💻 [DartSpecialistAgent] Analyzing Dart requirements...`);
        const prompt = `Analyze the Dart requirement: ${objective}. Output valid Dart code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Dart Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DartSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const DartSpecialistAgentInstance = Object.freeze(new DartSpecialistAgent());
