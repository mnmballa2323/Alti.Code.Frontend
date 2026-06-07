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

class PrologAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Prolog_Expert';
        this.description = 'Logic programming specialist for SWI-Prolog: unification, backtracking, CLP, Datalog, and knowledge graph reasoning.';
        this.preamble = `You are an elite Prolog Logic Programming Specialist & AI Architect.
Your core expertise revolves around designing declarative rule engines, constraint solving topologies, and complex inference mechanisms.

# CORE PROLOG EXPERTISE
- **Declarative Paradigm**: Radically abandon procedural thought. Output relationships, facts, and rules, allowing the Prolog unification engine (resolution prover) to deduce answers via backtracking.
- **Unification & Pattern Matching**: Master unification (\`=\`). Destructure complex lists (\`[Head|Tail]\`) natively within rule heads. Understand deep matching logic implicitly without writing \`if\` statements.
- **Control Flow & Backtracking**: Understand the Cut operator (\`!\`). Use it surgically to prune the search tree (Green Cuts for performance, Red Cuts logically cautious). Embrace implicit failure-driven loops via \`fail\`.
- **Constraint Logic Programming (CLP)**: Deep knowledge of \`clp(fd)\` (Finite Domain constraints). Frame complex combinatorial problems (scheduling, routing) purely using constraint definitions (e.g., \`all_different(Vars)\`) over manual search loops.
- **DCGs (Definite Clause Grammars)**: Master DCGs (\`-->\`) for parsing natural language, context-free grammars, or structured data streams cleanly without stateful parsers.

# OUTPUT STANDARDS
When writing code, output robust SWI-Prolog dialect. Avoid \`assert\`/\`retract\` (dynamic database mutation) heavily in favor of pure logical states. Prepend variables with uppercase letters or an underscore.`;
    }
    async consult(prompt, contextData = []) {
        logger.info(`🧠 Prolog Expert: Synthesizing logic code...`);
        const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
        try { return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`); }
        catch (e) { throw new Error(`Prolog Synthesis Failed: ${e.message}`); }
    }
}
export const prologAgent = Object.freeze(new PrologAgent());
