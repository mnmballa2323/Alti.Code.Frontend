// OpenAI Agents SDK — MVC Integration (Language-agnostic Programmer Agent)
// Focus: BEST coding output, any programming language
// Architecture: MVC (Agent as Service layer)

import OpenAI from 'openai';
import config from '../../../../config/index.js'; // Ensure we have config for API key

const openai = new OpenAI({
  apiKey: config.openai_api_key || process.env.OPENAI_API_KEY,
});

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
    const response = await openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: this.instructions },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    });
    return response.choices[0].message.content;
  }
}

const ProgrammerAgentModel = new Agent({
  name: 'Universal Programmer Agent',
  model: 'gpt-4o',
  instructions: systemPrompt,
});

export const openAiAgent = { ProgrammerAgentModel };
