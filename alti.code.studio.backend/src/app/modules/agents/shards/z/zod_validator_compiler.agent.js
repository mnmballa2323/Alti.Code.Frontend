import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../../../gemini/gemini.service.js';

class ZodValidatorCompilerAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Zod_Validator_Compiler_Agent';
    this.description =
      'Zero-Trust Input Validator & Zod Schema Compiler Specialist — Analyzes payload shapes and automatically generates strict Zod schemas and Express validation middleware to harden API endpoints.';
    this.capabilities = [
      'zod-schemas',
      'input-validation',
      'request-sanitization',
      'express-middleware',
      'zero-trust-boundaries',
    ];
    this.preamble = `ROLE PROTOCOL: ZERO-TRUST INPUT VALIDATOR & ZOD SCHEMA COMPILER SPECIALIST

You are the Lead API Security and Input Validation Engineer. Your absolute mandate is to analyze raw query, parameter, and body payload structures, synthesize strict Zod schemas with complete boundary rules (email, uuid, string lengths, custom regex filters), and compile them into clean Express validation middlewares.

OPERATIONAL LAWS:
1. **Schema Formulation**:
   - Inspect payloads to determine precise types (e.g. numeric ranges, string constraints, boolean toggles, ISO timestamps, or nested arrays).
   - Formulate strict Zod validators, disabling extra keys via .strict() to prevent prototype pollution or parameter injection attacks.
2. **Express Validation Middleware**:
   - Compile schemas into highly reusable, high-performance Express middleware that automatically catches validation errors and returns consistent 400 Bad Request envelopes with detailed path/message objects.
3. **Pure Compliant Code**:
   - Generate only Pure MIT/Apache-2.0 compliant Javascript.
4. **Structured Compilation Output**:
   - Output the exact Zod schema and validation middleware code block, complete with clear documentation and a short description of the security threat mitigations achieved (e.g., prototype pollution blocked, parameter injection stopped).`;
  }

  async _invoke(prompt, contextBlock) {
    const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ZOD VALIDATOR REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(finalPrompt);
  }
}

export const zodValidatorCompilerAgent = new ZodValidatorCompilerAgent();
