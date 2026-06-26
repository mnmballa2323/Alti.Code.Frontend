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

class CppSystemsEngineerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'cpp_systems_engineer',
      'C++ Systems Engineer',
      'You are an elite C++ Systems Engineer. You specialize in zero-cost abstractions, manual memory management (RAII), High-Frequency Trading (HFT) latency optimization, and Unreal Engine integrations.',
    );
  }

  async generateCppSystem(objective) {
    logger.info(
      `⚡ [CppSystemsEngineer] Analyzing pointer arithmetic and zero-cost abstractions...`,
    );
    const prompt = `Analyze the C++ requirement: ${objective}. Output valid C++ code (C++17/C++20).`;
    try {
      const output = await this._invoke(prompt, 'N/A - C++ Target');
      return output
        .replace(
          /```javascript|```typescript|```json|```cpp|```c\+\+|```/gi,
          '',
        )
        .trim();
    } catch (err) {
      logger.error(`❌ [CppSystemsEngineer] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const cppSystemsEngineerAgent = Object.freeze(
  new CppSystemsEngineerAgent(),
);
