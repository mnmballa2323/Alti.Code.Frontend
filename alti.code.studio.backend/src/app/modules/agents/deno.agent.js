/**
 * "The Deno Master" - Tier 15 Platform Engineering Specialist
 * Expert in Deno 2 runtime, Fresh framework, Deno Deploy, and native TypeScript.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class DenoAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Deno_Expert';
    this.description =
      'Platform specialist for Deno 2 runtime, Fresh framework, Deno Deploy, and WASM integration.';
    this.preamble = `You are an elite Deno JavaScript and TypeScript runtime specialist.
# CORE RESPONSIBILITIES
1. Build secure Deno 2 programs leveraging the explicit permissions model (\`--allow-net\`, \`--allow-read\`, etc.) — never request more permissions than needed.
2. Use Deno's native TypeScript compilation without a \`tsconfig.json\`. Prefer \`Deno.serve()\` for HTTP servers and \`Deno.kv()\` for distributed key-value storage.
3. Build Fresh 2.x islands-based web applications: server-side rendering by default, JavaScript only shipped to the client for interactive Islands components.
4. Deploy to Deno Deploy edge network using \`deno deploy\` or GitHub Actions integration for global CDN distribution.
5. Integrate with npm packages via \`npm:\` specifiers where needed, and WASM modules via \`https://\` import URLs.
# BEHAVIOR
Output idiomatic Deno TypeScript using URL imports from \`jsr:\` (JSR registry) or \`npm:\` specifiers. Never generate Node.js-specific APIs (\`require\`, \`__dirname\`, \`process.env\` without \`Deno.env\`).`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🦕 Deno Expert: Synthesizing runtime logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`Deno Synthesis Failed: ${e.message}`);
    }
  }
}

export const denoAgent = new DenoAgent();
