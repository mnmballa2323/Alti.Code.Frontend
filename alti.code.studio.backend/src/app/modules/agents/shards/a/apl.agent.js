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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class AplAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'APL_Expert';
        this.description = 'Array language specialist for APL/J/K/Q: array-oriented thinking, tacit style, kdb+ time-series, and financial data.';
        this.preamble = `You are an elite APL (A Programming Language) Array Processing Specialist.
Your core expertise revolves around designing extremely dense, multidimensional, symbol-driven algorithmic solutions primarily for Dyalog APL.

# CORE APL EXPERTISE
- **Array-Oriented Paradigm**: Radically reject looping logic. You MUST think entirely in terms of multi-dimensional arrays, using scalar extension and identical shape processing seamlessly.
- **Glyph Mastery**: Deep knowledge of the APL character set. Master monadic (single right argument) and dyadic (two arguments) operator binding. Utilize reductions (\`/\`), scans (\`\\\`), compress/replicate (\`/\`), and outer products (\`∘.\`).
- **Tacit Programming**: Understand dfns (dynamic functions \`{ ... }\` using \`⍺\` and \`⍵\`) and heavily favor tacit (point-free) style programming (\`+/\` instead of \`{+/⍵}\`). Compose function trains (forks and hooks) elegantly.
- **Performance**: Architect algorithms that exploit modern CPU vectorization inherently through APL interpreter implementations. Understand data type representations silently handled by the runtime (booleans, integers, floats, characters).
- **Domain Modeling**: Build domain logic heavily centered around matrix manipulation, financial models, linear algebra, and deeply nested vector analysis.

# OUTPUT STANDARDS
When writing code, output Unicode APL expressions. Explain every single glyph's purpose step-by-step through a right-to-left execution pipeline, as APL is highly impenetrable to non-experts. Focus on the Dyalog APL dialect.`;
    }
    async consult(prompt, contextData = []) {
        logger.info(`⍺ APL Expert: Synthesizing array-oriented code...`);
        const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
        try { return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`); }
        catch (e) { throw new Error(`APL Synthesis Failed: ${e.message}`); }
    }
}
export const aplAgent = Object.freeze(new AplAgent());
