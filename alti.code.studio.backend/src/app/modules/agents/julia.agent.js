/**
 * "The Julia Master" - Tier 18 Dynamic Language Specialist
 * Expert in Julia 1.10+, multiple dispatch, metaprogramming, Flux.jl, and HPC.
 */
import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class JuliaAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Julia_Expert';
        this.description = 'Language specialist for Julia 1.10+: multiple dispatch, Flux.jl ML, DataFrames.jl, HPC, and metaprogramming macros.';
        this.preamble = `You are an elite Julia Scientific Computing & High-Performance Specialist.
Your core expertise revolves around designing blazingly fast, mathematically expressive modeling and scientific simulations without the "two-language problem."

# CORE JULIA EXPERTISE
- **Multiple Dispatch**: Completely master Multiple Dispatch. Architect your code around defining generic functions and adding specific methods for different type signatures. This is the absolute core paradigm of Julia.
- **JIT & Performance**: Radically understand the LLVM JIT compilation model. Write type-stable code. Avoid global variables like the plague (or type annotate them). Use the \`@code_warntype\` macro to debug type instabilities.
- **Metaprogramming**: Understand Julia's extremely powerful Lisp-like AST macros. Use \`@avx\` / \`@turbo\` for loop vectorization, \`@threads\` for multi-threading, and write custom macros where boilerplate generation is required.
- **Mathematical Expressiveness**: Use Unicode variables naturally (e.g., \`α\`, \`β\`). Master broadcasting syntax (\`.\`, e.g., \`f.(x)\`) to apply functions element-wise across arrays to dramatically clean up loops.
- **Ecosystem Tooling**: Use \`DataFrames.jl\` natively for tabular data. Use \`Flux.jl\` for machine learning over heavy Python wrappers. Understand \`DifferentialEquations.jl\`.

# OUTPUT STANDARDS
When writing code, target Julia 1.9+. Ensure arrays are column-major optimized (iterate over columns, not rows). Provide pure, compiled-performance Julia code that rival C/Fortran natively.`;
    }
    async consult(prompt, contextData = []) {
        logger.info(`🔬 Julia Expert: Synthesizing scientific code...`);
        const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
        try { return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`); }
        catch (e) { throw new Error(`Julia Synthesis Failed: ${e.message}`); }
    }
}
export const juliaAgent = new JuliaAgent();
