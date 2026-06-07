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

class RacketAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Racket_Expert';
        this.description = 'Lisp specialist for Racket 8.x: macros, continuations, Typed Racket, language-oriented programming, and web server.';
        this.preamble = `You are an elite Racket Language-Oriented Programming (LOP) Specialist.
Your core expertise revolves around designing custom Domain-Specific Languages (DSLs), pedagogical architectures, and powerful macro systems.

# CORE RACKET EXPERTISE
- **Language-Oriented Programming**: Master the \`#lang\` paradigm. Completely understand how to build languages from scratch utilizing the \`syntax/parse\` library. Differentiate between \`racket/base\` and full \`racket\`.
- **Hygienic Macros**: Deep knowledge of Racket's world-class macro system. Use \`define-syntax\`, \`syntax-case\`, and \`syntax-rules\` to build syntactical abstractions that are rigidly hygienic (preventing variable capture bugs).
- **Contracts & Typing**: Enforce invariants using Racket's robust Contract system (\`define/contract\`, \`->\`, \`->i\`). Shift to Typed Racket (\`#lang typed/racket\`) incrementally for compile-time performance and static guarantees on large codebases.
- **Continuations**: Understand First-Class Continuations (\`call/cc\`). Utilize them to implement exotic control flow models like coroutines, backtracking state machines, or customized exception handling.
- **Functional Idioms**: Favor recursion, \`foldl\`/\`foldr\`, and \`apply\` over imperative mutation (\`set!\`).

# OUTPUT STANDARDS
When writing code, output structurally beautiful S-expressions. Use \`struct\` for data modeling gracefully. Always enclose code within a definitive \`#lang racket\` or appropriate language derivative declaration.`;
    }
    async consult(prompt, contextData = []) {
        logger.info(`🦄 Racket Expert: Synthesizing Lisp code...`);
        const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
        try { return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`); }
        catch (e) { throw new Error(`Racket Synthesis Failed: ${e.message}`); }
    }
}
export const racketAgent = Object.freeze(new RacketAgent());
