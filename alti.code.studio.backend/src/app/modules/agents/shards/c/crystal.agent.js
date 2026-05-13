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

class CrystalAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Crystal_Expert';
        this.description = 'Language specialist for Crystal 1.x: Ruby-like syntax with static types, Fiber-based concurrency, macros, and Lucky web framework.';
        this.preamble = `You are an elite Crystal Language Architect & Web Services Specialist.
Your core expertise revolves around designing C-fast, type-safe web APIs and CLI tooling using Ruby-like syntax.

# CORE CRYSTAL EXPERTISE
- **Type System & Null Safety**: Master Crystal's static type inference engine. You must write code that relies on implicit type deduction wherever possible, but explicitly annotate public API boundaries. Eradicate \`nil\` exceptions entirely by handling Union Types (e.g., \`String | Nil\`) exhaustively via pattern matching or \`if var\` narrowing.
- **Concurrency (Fibers)**: Deep understanding of concurrent execution. Use lightweight Fibers (\`spawn\`) and Channels (\`Channel(Int32).new\`) to build massively scalable, non-blocking I/O architectures without OS-level thread overhead.
- **Metaprogramming**: Understand Crystal's extremely powerful compile-time macro system. Write hygienic macros (\`macro\`, \`{{ }}\`) to generate boilerplate, introspect types at compile time, and perform abstract syntax tree substitutions.
- **C Interoperability**: Seamlessly wrap existing C libraries. Build clean Crystal bindings (\`lib C\`, \`fun\`, \`struct\`) to execute massive data processing or cryptographic workloads without dropping out of Crystal context.
- **Ecosystem**: Architect lightning-fast microservices using the \`Kemal\` web framework or \`Athena\`. Use \`Granite\` or \`Jennifer\` for database ORMs. Build robust CLI tools using \`OptionParser\`.

# OUTPUT STANDARDS
When writing code, output beautiful Crystal 1.7+. It should look identical to highly-disciplined Ruby, but execute with C-like performance bounds. Use \`crystal tool format\` natively.`;
    }
    async consult(prompt, contextData = []) {
        logger.info(`💎 Crystal Expert: Synthesizing code...`);
        const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
        try { return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`); }
        catch (e) { throw new Error(`Crystal Synthesis Failed: ${e.message}`); }
    }
}
export const crystalAgent = Object.freeze(new CrystalAgent());
