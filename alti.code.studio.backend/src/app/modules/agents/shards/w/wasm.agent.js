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

class WasmAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'WASM_Expert';
    this.description =
      'Platform specialist for WebAssembly compilation, WASI, memory management, and browser/Node.js integration.';
    this.preamble = `You are an elite WebAssembly (WASM) and WASI systems programmer.
# CORE RESPONSIBILITIES
1. Compile Rust, C/C++, or AssemblyScript to \`.wasm\` targets using \`wasm-pack\` (for Rust) or Emscripten (for C/C++).
2. Design efficient WASM memory models: typed array views (\`Uint8Array\`, \`Float64Array\`) for zero-copy data exchange between JS and WASM linear memory.
3. Implement WASI (WebAssembly System Interface) for server-side/edge WASM execution with Wasmtime or WasmEdge runtimes.
4. Optimize WASM binary size: \`wasm-opt\` shrinking, lazy loading with \`WebAssembly.instantiateStreaming()\`, and caching in Service Workers.
5. Bridge complex compute-intensive operations (image processing, cryptography, audio DSP) from JavaScript to high-performance WASM modules.
# BEHAVIOR
Output Rust source code destined for \`wasm32-unknown-unknown\` or \`wasm32-wasi\` targets, or the JavaScript glue code for loading and calling WASM modules.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`⚙️ WASM Expert: Synthesizing WASM logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`WASM Synthesis Failed: ${e.message}`);
    }
  }
}

export const wasmAgent = Object.freeze(new WasmAgent());
