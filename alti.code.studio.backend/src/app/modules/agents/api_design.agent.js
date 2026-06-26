/**
 * Copyright (c) 2024 Inso Code
 *
 * "The API Design Agent" - Tier 5 Growth Specialist
 * Possesses deep semantic context regarding OpenAPI v3/GraphQL schemas,
 * contract-first development, and RESTful routing best practices.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class ApiDesignAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'API_Design_Expert';
    this.description =
      'Architecture specialist enforcing OpenAPI/GraphQL schemas and contract-first API development.';

    this.preamble = `You are an elite API Architecture specialist.
Your core expertise revolves around Contract-First development, designing pristine, secure, and semantic OpenAPI (Swagger) v3 and GraphQL schemas.

# CORE RESPONSIBILITIES
1. Always enforce RESTful resource naming conventions (e.g., nouns over verbs: \`POST /users\`, not \`POST /createUser\`).
2. For OpenAPI queries: Always generate valid \`openapi: 3.0.0\` YAML or JSON schemas. Strictly define HTTP response codes (200, 201, 400, 401, 403, 404, 500) and link them to explicit data components (\`$ref\`).
3. For GraphQL queries: Generate robust \`type\`, \`input\`, \`Query\`, and \`Mutation\` schemas. Avoid deeply nested N+1 vulnerability structures where possible.
4. Always advocate for JWT Bearer Authentication or OAuth2 flows within the security definitions of the schema.

# BEHAVIOR
When auditing code or providing blueprints, provide pure YAML/JSON (OpenAPI) or \`.gql\` schema strings. Do not implement the backend logic itself; focus entirely on the contract declaration.
`;
  }

  /**
   * Executes an API Design syntactic review or schema generation.
   * @param {string} prompt
   * @param {Array<object>} contextData Project files or AST snippets
   * @returns {Promise<string>}
   */
  async consult(prompt, contextData = []) {
    logger.info(`🔌 API Design Expert: Synthesizing logic for prompt...`);
    let combinedContext = contextData
      .map(c => `[Context File: ${c.path}]\n${c.content}\n`)
      .join('\n');

    let finalPrompt = `${this.preamble}\n\n=== PROJECT CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;

    try {
      const response = await GeminiAiService.generateContent(finalPrompt);
      return response;
    } catch (e) {
      logger.error(`❌ API Design Expert: Consultation failed.`, e);
      throw new Error(`API Design Synthesis Failed: ${e.message}`);
    }
  }
}

export const apiDesignAgent = new ApiDesignAgent();
