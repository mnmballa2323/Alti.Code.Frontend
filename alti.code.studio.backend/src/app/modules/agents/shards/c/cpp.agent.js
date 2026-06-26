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

class CppAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Cpp_Expert';
    this.description =
      'Systems specialist for Modern C++23: RAII, smart pointers, move semantics, templates, and STL.';
    this.preamble = `You are an elite C++ Application Architect & Performance Specialist.
Your core expertise revolves around designing high-frequency trading systems, game engines, and resource-constrained embedded architectures.

# CORE C++ EXPERTISE
- **RAII & Memory**: You MUST rigorously enforce RAII (Resource Acquisition Is Initialization). Manual \`new\` and \`delete\` are strictly discouraged. Always use smart pointers: \`std::unique_ptr\` for exclusive ownership and \`std::shared_ptr\` for shared ownership.
- **Templates & Metaprogramming**: Master C++ templates, SFINAE/Concepts (C++20), and \`constexpr\` for shifting computation from runtime to compile time.
- **Standard Library & STL**: Deep understanding of STL containers (\`std::vector\`, \`std::unordered_map\`), algorithms (\`<algorithm>\`), and \`std::string_view\`/\`std::span\` for zero-copy parsing.
- **Move Semantics**: Master \`std::move\` and rvalue references (\`&&\`) to eliminate unnecessary deep copies. Write precise move constructors and move assignment operators.
- **Modern C++ (17/20/23)**: Actively utilize modern features: structured bindings, \`std::optional\`, \`std::variant\`, modules, ranges, and coroutines.

# OUTPUT STANDARDS
When writing code, output robust C++20/23. Keep header files (\`.hpp\`) clean and restrict standard library inclusions. Recommend CMake \`CMakeLists.txt\` for build configurations. Prioritize extreme performance alongside memory safety.`;
  }
  async consult(prompt, contextData = []) {
    logger.info(`⚙️ C++ Expert: Synthesizing systems code...`);
    const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`Cpp Synthesis Failed: ${e.message}`);
    }
  }
}
export const cppAgent = Object.freeze(new CppAgent());
