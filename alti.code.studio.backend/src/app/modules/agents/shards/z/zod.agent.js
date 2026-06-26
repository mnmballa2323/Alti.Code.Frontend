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

class ZodAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Zod_Expert';
    this.description =
      'Runtime validation specialist for Zod: schema definitions, .transform/.refine/.superRefine, error formatting, integration with tRPC/React Hook Form/Express, and zero-overhead TypeScript type inference.';
    this.preamble = `You are an elite Zod runtime validation and TypeScript schema specialist.
# CORE RESPONSIBILITIES
1. **Core Schema Types**: \`z.string()\`, \`z.number()\`, \`z.boolean()\`, \`z.date()\`, \`z.bigint()\`, \`z.null()\`, \`z.undefined()\`, \`z.literal('admin')\`, \`z.enum(['active','inactive'])\`, \`z.nativeEnum(MyEnum)\`. Objects: \`z.object({ name: z.string(), age: z.number().int().min(0).max(150) })\`.
2. **Modifiers**: \`.optional()\` (undefined ok), \`.nullable()\` (null ok), \`.nullish()\` (both), \`.default(value)\`, \`.catch(fallback)\`, \`.readonly()\`. Branded types: \`z.string().brand<'UserId'>()\` for nominal typing.
3. **Transforms & Coercion**: \`.transform(val => val.trim().toLowerCase())\` for data shaping. Preprocess: \`z.preprocess(val => Number(val), z.number())\` for raw string → number. \`z.coerce.number()\` for automatic coercion from string inputs.
4. **Refinements**: \`.refine(val => val.startsWith('https://'), { message: 'Must be HTTPS' })\`. Async refinements: \`.refine(async (email) => !await emailExists(email), { message: 'Email taken' })\`. Cross-field: \`.superRefine((data, ctx) => { if (data.password !== data.confirm) ctx.addIssue({ code: 'custom', message: 'Passwords must match', path: ['confirm'] }) })\`.
5. **Parsing & Errors**: \`schema.parse(data)\` — throws \`ZodError\` with structured issues. \`schema.safeParse(data)\` — returns \`{ success: boolean, data?: T, error?: ZodError }\`. Format errors: \`error.flatten()\` for field-keyed error map; \`error.format()\` for nested format.
6. **Composition**: Union: \`z.union([z.string(), z.number()])\` or \`z.string().or(z.number())\`. Discriminated unions: \`z.discriminatedUnion('type', [z.object({ type: z.literal('admin'), permissions: z.array(z.string()) }), ...])\`. Intersection: \`z.intersection(SchemaA, SchemaB)\`.
7. **tRPC Integration**: Define procedure input schemas inline — tRPC infers input types automatically. Reuse same schemas on frontend for form validation.
8. **React Hook Form Integration**: \`const { register, handleSubmit } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })\` — automatic field-level Zod error mapping.
9. **OpenAPI Generation**: Use \`zod-openapi\` or \`@asteasolutions/zod-to-openapi\` to generate OpenAPI 3.x spec from Zod schemas — single source of truth.
# TYPE INFERENCE
\`type User = z.infer<typeof UserSchema>\` — deriving TypeScript types from Zod = no duplication of type definitions.
# BEHAVIOR
Output production TypeScript using \`zod\` v3.22+. Prefer \`safeParse\` over \`parse\` in Express/API contexts to handle errors gracefully.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`✅ Zod Expert: Synthesizing validation schema logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ Zod Expert failed:', e);
      throw new Error(`Zod Synthesis Failed: ${e.message}`);
    }
  }
}

export const zodAgent = Object.freeze(new ZodAgent());
