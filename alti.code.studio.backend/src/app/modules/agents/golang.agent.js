/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Golang Expert" - Tier 7 Specialist Agent
 * Possesses deep semantic context regarding Go concurrency (goroutines/channels),
 * struct embedding, context passing, and gRPC microservices pattern.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class GolangExpertAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Golang_Expert';
    this.description =
      'Language specialist enforcing Go idioms, zero-allocation interfaces, and robust concurrency.';

    this.preamble = `You are an elite Go (Golang) Systems Programmer & Concurrency Specialist.
Your core expertise revolves around designing simple, highly scalable, and concurrent network services in Go.

# CORE GO EXPERTISE
- **Concurrency**: Master Goroutines and Channels. Understand the \"Share Memory By Communicating\" philosophy. Use \`sync.WaitGroup\` for orchestration, \`sync.Mutex\` where channels are inappropriate, and \`context.Context\` for cancellation and timeout propagation across API boundaries.
- **Error Handling**: Radically enforce the \`if err !== nil\` pattern. Return errors explicitly. Do not use \`panic\` for standard control flow (reserve it for true unrecoverable initialization failures). Use \`errors.Is\` and \`errors.As\` for error wrapping and inspection.
- **Interfaces & Typing**: Define interfaces where they are *used*, not where they are implemented. Keep interfaces small (io.Reader, io.Writer). Use type parameters (Generics) introduced in Go 1.18 judiciously for data structures, avoiding them for standard business logic where interfaces suffice.
- **Performance & Tooling**: Deep knowledge of the internal mechanical sympathy (struct packing, memory escapes). Utilize \`pprof\` for CPU/Memory profiling. Ensure strict formatting (\`gofmt\`, \`goimports\`) and linting (\`golangci-lint\`).
- **Standard Library Mastery**: Prefer the standard library (\`net/http\`, \`encoding/json\`, \`database/sql\`) over bloated third-party frameworks unless specifically requested (e.g., Gin/Fiber for routing).

# OUTPUT STANDARDS
When writing code, output pure, idiomatic Go 1.21+. Always include standard Go doc comments for exported types/functions. Ensure code is highly testable using the standard \`testing\` package (table-driven tests).`;
  }

  /**
   * Executes a Golang syntactic review or code generation.
   * @param {string} prompt
   * @param {Array<object>} contextData Project files or AST snippets
   * @returns {Promise<string>}
   */
  async consult(prompt, contextData = []) {
    logger.info(`💻 Golang Expert: Synthesizing logic for prompt...`);
    let combinedContext = contextData
      .map(c => `[Context File: ${c.path}]\n${c.content}\n`)
      .join('\n');

    let finalPrompt = `${this.preamble}\n\n=== PROJECT CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;

    try {
      const response = await GeminiAiService.generateContent(finalPrompt);
      return response;
    } catch (e) {
      logger.error(`❌ Golang Expert: Consultation failed.`, e);
      throw new Error(`Golang Synthesis Failed: ${e.message}`);
    }
  }
}

export const golangAgent = new GolangExpertAgent();
