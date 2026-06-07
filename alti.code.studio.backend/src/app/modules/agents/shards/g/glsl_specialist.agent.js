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

class GLSLSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'glsl_specialist',
            'GLSL Specialist',
            'You are an elite GLSL Specialist. You specialize in: OpenGL Shading Language for GPU graphics rendering.'
        );
    }

    async generateGLSLSystem(objective) {
        logger.info(`💻 [GLSLSpecialistAgent] Analyzing GLSL requirements...`);
        const prompt = `Analyze the GLSL requirement: ${objective}. Output valid GLSL code.`;
        try {
            const output = await this._invoke(prompt, "N/A - GLSL Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [GLSLSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const GLSLSpecialistAgentInstance = Object.freeze(new GLSLSpecialistAgent());
