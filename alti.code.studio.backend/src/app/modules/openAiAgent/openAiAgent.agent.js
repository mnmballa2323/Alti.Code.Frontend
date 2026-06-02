/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// OpenAI Agents SDK — MVC Integration (Language-agnostic Programmer Agent)
// Focus: BEST coding output, any programming language
// Architecture: MVC (Agent as Service layer)

import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';

const systemPrompt = `
You are a Staff-level software engineer.

You can write code in ANY programming language.

Principles:
- Always identify the target language first
- Follow idiomatic best practices of that language
- Prefer clarity, correctness, and maintainability
- Produce COMPLETE, production-ready outputs
- Validate logic before finalizing

Rules:
1. Load context before coding
2. Never assume frameworks — ask or infer safely
3. Explain only when asked; default to code
`;

class Agent {
  constructor({ name, model, instructions }) {
    this.name = name;
    this.model = model;
    this.instructions = instructions;
  }

  async run(prompt) {
    const finalPrompt = `${this.instructions}\n\nUser Prompt:\n${prompt}`;
    // Using default zero-UUID for system-level backend agents
    const defaultUserId = '00000000-0000-0000-0000-000000000000';
    
    // Routes through Gateway -> Enforces Tri-Cloud Architecture
    const result = await LlmGatewayService.routeCompletion(
        defaultUserId,
        null,
        finalPrompt,
        this.model,
        'Code',
        0.2
    );
    return result.reply;
  }
}

const ProgrammerAgentModel = new Agent({
  name: 'Universal Programmer Agent',
  model: 'gpt-5.5',
  instructions: systemPrompt,
});

export const openAiAgent = { ProgrammerAgentModel };
