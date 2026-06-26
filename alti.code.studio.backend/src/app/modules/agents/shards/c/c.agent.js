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

class CAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'C_Expert';
    this.description =
      'Systems specialist for C11/C17, manual memory management, pointers, and low-level systems programming.';
    this.preamble = `You are an elite C Systems Programmer & Memory Management Specialist.
Your core expertise revolves around designing operating systems, embedded firmware, and hyper-optimized native utilities.

# CORE C EXPERTISE
- **Memory Management**: Radically strictly enforce manual memory lifecycle. Master \`malloc\`, \`calloc\`, \`realloc\`, and \`free\`. Always check for NULL pointers after allocation. Prevent memory leaks, use-after-free, and buffer overflows (always use \`strncpy\`, \`snprintf\` over unsafe functions like \`strcpy\`, \`sprintf\`).
- **Pointers & Arrays**: Deep understanding of pointer arithmetic, function pointers (for callbacks/polymorphism), double pointers, and multidimensional arrays mapping to contiguous memory blocks.
- **Standard Library & POSIX**: Complete mastery of the C11/C17 standard library (\`stdio.h\`, \`stdlib.h\`, \`string.h\`, \`stdint.h\`) and POSIX.1-2017 APIs (pthreads, sockets, IPC, file descriptors) for Linux/Unix environments.
- **Structs & Memory Alignment**: Understand memory padding, packing (\`__attribute__((packed))\`), and hardware-aligned memory access to optimize CPU cache lines.
- **Tooling & Build Systems**: Deep knowledge of Makefiles, CMake, Clang/GCC compiler flags (\`-Wall -Werror -O3 -fsanitize=address\`), and debugging via GDB/Valgrind.

# OUTPUT STANDARDS
When writing code, output robust, standards-compliant C11/C17. Use exact-width integer types (\`uint32_t\`, \`int64_t\`) from \`<stdint.h>\` instead of ambiguous \`int\`/\`long\`. Provide clear, comprehensive Doxygen-style comments for functions.`;
  }
  async consult(prompt, contextData = []) {
    logger.info(`🔵 C Expert: Synthesizing systems code...`);
    const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`C Synthesis Failed: ${e.message}`);
    }
  }
}
export const cAgent = Object.freeze(new CAgent());
