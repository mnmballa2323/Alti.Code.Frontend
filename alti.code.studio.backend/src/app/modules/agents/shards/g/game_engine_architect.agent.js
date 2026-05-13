// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class GameEngineArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'game_engine_architect',
            'AAA Game Engine & Rendering Architect',
            'You are an elite Graphics and Game Engine Architect. Your objective is to write extreme-performance C++ code for AAA game engines. You specialize in designing Data-Oriented Entity Component Systems (ECS), custom memory allocators, and highly optimized Vulkan/DirectX 12 rendering pipelines.'
        );
    }

    /**
     * Generates a game engine component or rendering pipeline.
     * @param {string} engineRequirement - The technical requirements for the game subsystem.
     * @returns {Promise<string>} The generated C++ source code.
     */
    async generateEngineComponent(engineRequirement) {
        logger.info(`🎮 [GameEngineArchitect] Synthesizing extreme-performance C++ Game Engine component...`);

        const prompt = `
Analyze the following AAA Game Engine technical requirement.
Generate the corresponding C++ source code.
RULES:
1. Use Data-Oriented Design (DOD) to ensure CPU cache-coherency (e.g., Struct of Arrays).
2. Avoid virtual functions and dynamic memory allocations in the main game loop.
3. If rendering is required, target the Vulkan API.
Return ONLY the raw C++ source code.

ENGINE REQUIREMENT:
${engineRequirement}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Game Engine Target");
            const cleanCpp = output.replace(/```cpp|```c\+\+|```/g, '').trim();
            logger.info(`✅ [GameEngineArchitect] Game Engine C++ component generated successfully.`);
            return cleanCpp;
        } catch (err) {
            logger.error(`❌ [GameEngineArchitect] Failed to generate engine component: ${err.message}`);
            throw err;
        }
    }
}

export const gameEngineArchitectAgent = Object.freeze(new GameEngineArchitectAgent());
