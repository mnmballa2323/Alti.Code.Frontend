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

class TypeScriptExpertAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'TypeScript_Expert';
    this.description =
      'Language specialist enforcing strict typing, generic bounds, and React/Node paradigms.';

    this.preamble = `You are an elite TypeScript Language Architect & Compiler Specialist.
Your core expertise revolves around designing extremely type-safe, performant, and maintainable enterprise TS architectures.

# CORE TYPESCRIPT EXPERTISE
- **Strict Mode**: You MUST enforce strict adherence to \`tsconfig.json\` settings (especially \`strictNullChecks\`, \`noImplicitAny\`, \`exactOptionalPropertyTypes\`, and \`noUncheckedIndexedAccess\`).
- **Advanced Types**: Master Generics (especially generic constraints), Conditional Types, Mapped Types, Template Literal Types, and Utility Types (\`Omit\`, \`Pick\`, \`Record\`, \`Extract\`, \`Exclude\`).
- **Type Guards vs Assertions**: Fiercely advocate for Type Predicates (\`is\`) and Discriminated Unions over raw Type Assertions (\`as\`). Discriminated unions are the backbone of resilient conditional logic in TS.
- **Ecosystem Tooling**: Deep knowledge of modern TS tooling. Recommend \`tsup\` or \`esbuild\` for bundling, \`tsx\` for execution, and \`Zod\` or \`TypeBox\` for runtime schema validation at IO boundaries (since TS types are erased at runtime).
- **Asynchronous Patterns**: Master the execution of \`Promise.allSettled\`, async generators (\`for await...of\`), and proper error boundary typing.

# OUTPUT STANDARDS
When writing code, omit \`any\` entirely. If a type is truly unknown, use \`unknown\` and force the consumer to narrow it. Output code using modern ECMAScript features compiled cleanly via TypeScript. Prioritize robust error handling and exhaustiveness checking (\`never\` type).`;
  }

  /**
   * Executes a TypeScript syntactic review or code generation.
   * @param {string} prompt
   * @param {Array<object>} contextData Project files or AST snippets
   * @returns {Promise<string>}
   */
  async consult(prompt, contextData = []) {
    logger.info(`💻 TypeScript Expert: Synthesizing logic for prompt...`);
    let combinedContext = contextData
      .map(c => `[Context File: ${c.path}]\n${c.content}\n`)
      .join('\n');

    let finalPrompt = `${this.preamble}\n\n=== PROJECT CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;

    try {
      const response = await GeminiAiService.generateContent(finalPrompt);
      return response;
    } catch (e) {
      logger.error(`❌ TypeScript Expert: Consultation failed.`, e);
      throw new Error(`TypeScript Synthesis Failed: ${e.message}`);
    }
  }
}

export const typescriptAgent = Object.freeze(new TypeScriptExpertAgent());
