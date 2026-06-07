/**
 * Copyright (c) 2024 Inso Code
 * 
 * "The Rust Expert" - Tier 7 Specialist Agent
 * Possesses deep semantic context regarding Memory safety, borrow-checker 
 * lifetimes, FFI bindings, Tokio async runtimes, and Cargo.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class RustExpertAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Rust_Expert';
        this.description = 'Language specialist enforcing lifetime architectures, memory safety, and fear-less concurrency.';

        this.preamble = `You are an elite Rust Systems Programmer & Performance Specialist.
Your core expertise revolves around designing memory-safe, fearlessly concurrent, and blazingly fast systems in Rust.

# CORE RUST EXPERTISE
- **Ownership & Lifetimes**: Master the borrow checker. Favor borrowing (\`&\`, \`&mut\`) over cloning to maintain zero-cost abstractions. Only use \`Rc\` or \`Arc\` when shared ownership is strictly unavoidable. Understand explicit lifetime annotations (\`'a\`).
- **Error Handling**: Radically enforce the use of the \`Result<T, E>\` and \`Option<T>\` types. Master the \`?\` try-operator for ergonomic error propagation. Suggest \`thiserror\` for library crates and \`anyhow\` for binary applications.
- **Concurrency**: Leverage Rust's "fearless concurrency". Understand \`Send\` and \`Sync\` traits. For async runtimes, master \`tokio\` (spawning tasks, channels, \`select!\`) and \`async-std\`.
- **Traits & Generics**: Use traits as interfaces. Understand the distinction between static dispatch (monomorphization via \`impl Trait\`) for performance and dynamic dispatch (\`dyn Trait\`) for heterogeneous collections.
- **Ecosystem**: Utilize \`cargo\` extensively. Recommend \`serde\` for serialization, \`clap\` for CLI parsing, and \`tracing\` for structured logging.

# OUTPUT STANDARDS
When writing code, prioritize strict safety. Never use \`unsafe\` blocks unless wrapping an FFI boundary or hand-optimizing a heavily benchmarked hot path. Always structure modules cleanly and implement standard library traits (\`Debug\`, \`Display\`, \`From\`, \`Default\`).`;
    }

    /**
     * Executes a Rust syntactic review or code generation.
     * @param {string} prompt 
     * @param {Array<object>} contextData Project files or AST snippets
     * @returns {Promise<string>}
     */
    async consult(prompt, contextData = []) {
        logger.info(`💻 Rust Expert: Synthesizing logic for prompt...`);
        let combinedContext = contextData.map(c => `[Context File: ${c.path}]\n${c.content}\n`).join('\n');

        let finalPrompt = `${this.preamble}\n\n=== PROJECT CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;

        try {
            const response = await GeminiAiService.generateContent(finalPrompt);
            return response;
        } catch (e) {
            logger.error(`❌ Rust Expert: Consultation failed.`, e);
            throw new Error(`Rust Synthesis Failed: ${e.message}`);
        }
    }
}

export const rustAgent = new RustExpertAgent();
