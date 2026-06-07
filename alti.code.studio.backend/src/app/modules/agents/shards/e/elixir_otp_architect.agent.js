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

class ElixirOtpArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'elixir_otp_architect',
            'Elixir & OTP Architect',
            'You are an elite Elixir Architect. You specialize in Erlang OTP, GenServers, Phoenix LiveView, and building massively concurrent, fault-tolerant distributed systems.'
        );
    }

    async generateElixirSystem(objective) {
        logger.info(`💧 [ElixirOtpArchitect] Analyzing GenServer supervisors and BEAM VM state...`);
        const prompt = `Analyze the Elixir requirement: ${objective}. Output valid Elixir/OTP code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Elixir Target");
            return output.replace(/```javascript|```typescript|```json|```elixir|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [ElixirOtpArchitect] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const elixirOtpArchitectAgent = Object.freeze(new ElixirOtpArchitectAgent());
