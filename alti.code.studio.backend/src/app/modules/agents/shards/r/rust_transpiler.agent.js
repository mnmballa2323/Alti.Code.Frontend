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

class RustTranspilerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'rust_transpiler',
      'Rust / WASM Optimization Transpiler',
      'You are an elite Systems Engineer specializing in Rust and WebAssembly (WASM). Your objective is to take slow, CPU-bound Javascript/Typescript algorithms, mathematically prove their inefficiency, and transpile them into perfectly memory-safe, zero-cost-abstraction Rust code designed to be compiled to WASM.',
    );
  }

  /**
   * Transpiles a given JS/TS snippet into optimized Rust.
   * @param {string} jsSource - The raw Javascript code.
   * @returns {Promise<string>} The generated Rust code.
   */
  async transpileToRust(jsSource) {
    logger.info(
      `🦀 [RustTranspiler] Analyzing CPU-bound Javascript for WebAssembly transpilation...`,
    );

    const prompt = `
Analyze the following Javascript function. It is currently a CPU bottleneck.
Transpile it into highly optimized Rust code suitable for WebAssembly (wasm-bindgen).
RULES:
1. Ensure strict memory safety.
2. Use optimal Rust idioms (iterators, avoiding clones, zero-cost abstractions).
3. Return ONLY the raw Rust source code block. Do not include explanations.

JAVASCRIPT SOURCE:
${jsSource}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Transpilation Target');
      const cleanRust = output.replace(/```rust|```/g, '').trim();
      logger.info(
        `✅ [RustTranspiler] Rust/WASM transpilation completed successfully.`,
      );
      return cleanRust;
    } catch (err) {
      logger.error(
        `❌ [RustTranspiler] Failed to transpile to Rust: ${err.message}`,
      );
      throw err;
    }
  }
}

export const rustTranspilerAgent = Object.freeze(new RustTranspilerAgent());
