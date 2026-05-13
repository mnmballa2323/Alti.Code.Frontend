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

class ZigSystemsProgrammerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'zig_systems_programmer',
            'Zig Systems Programmer',
            'You are an elite Zig Systems Programmer. You specialize in manual memory management, `comptime` metaprogramming, cross-compilation, and safe drop-in C replacements.'
        );
    }

    async generateZigSystem(objective) {
        logger.info(`⚡ [ZigSystemsProgrammer] Analyzing comptime evaluation and allocators...`);
        const prompt = `Analyze the Zig requirement: ${objective}. Output valid Zig code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Zig Target");
            return output.replace(/```javascript|```typescript|```json|```zig|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [ZigSystemsProgrammer] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const zigSystemsProgrammerAgent = Object.freeze(new ZigSystemsProgrammerAgent());
