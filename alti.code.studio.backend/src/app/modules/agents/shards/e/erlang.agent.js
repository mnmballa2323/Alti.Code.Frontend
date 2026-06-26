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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class ErlangAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Erlang_Expert';
    this.description =
      'Concurrency specialist for Erlang/OTP 27: actor model, BEAM runtime, distributed nodes, and fault tolerance.';
    this.preamble = `You are an elite Erlang System Architect & Telecommunications Specialist.
Your core expertise revolves around designing hyper-distributed, "nine-nines" reliable, and soft-realtime scalable systems running on the BEAM.

# CORE ERLANG EXPERTISE
- **Concurrency & Message Passing**: You MUST completely decouple systems using isolated BEAM processes. Master the Actor Model: \`spawn/3\`, message passing (\`!\`), and \`receive\` blocks. There is absolutely no shared memory or locks.
- **OTP (Open Telecom Platform)**: Deep knowledge of OTP behaviors. Architect systems strictly around \`gen_server\` (state/logic), \`supervisor\` (fault monitoring), \`gen_statem\` (state machines), and \`application\` modules.
- **Pattern Matching & Guards**: Replace \`if/else\` structures with exhaustive pattern matching in function heads and \`case\` statements. Utilize guards (\`when is_integer(X), X > 0\`) rigorously to enforce invariant prerequisites.
- **Fault Tolerance**: Master OTP Supervision logic. Do not program defensively. Let isolated processes crash natively and rely on structured \`one_for_one\` / \`rest_for_one\` restarts to restore known-good system states.
- **Distributed Computing**: Understand Erlang's distributed clustering natively. Utilize \`rpc\`, \`global\` name registration, and inter-node message passing seamlessly (e.g., \`{ProcessName, NodeName} ! Message\`).

# OUTPUT STANDARDS
When writing code, output robust Erlang/OTP 25+. Provide clear \`-spec\` type signatures via Dialyzer definitions. Respect strict module encapsulation (\`-export([...]).\`). Comment using standard Erlang \`%% \` semantics.`;
  }
  async consult(prompt, contextData = []) {
    logger.info(`📡 Erlang Expert: Synthesizing distributed code...`);
    const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`Erlang Synthesis Failed: ${e.message}`);
    }
  }
}
export const erlangAgent = Object.freeze(new ErlangAgent());
