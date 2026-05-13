import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * ElysiaJS OSS Specialist
 * Repository: https://github.com/elysiajs/elysia
 * Stars: ~11k | Language: TypeScript (Bun)
 */
class ElysiajsOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Elysiajs_Oss_Expert';
        this.description = 'Deep expert in ElysiaJS — fast, ergonomic web framework for Bun with end-to-end type safety.';
        this.preamble = `You are a world-class backend engineer with expert-level mastery of ElysiaJS.

CORE CONCEPTS:
- Purpose-built for Bun: Highly optimized for Bun's runtime and HTTP parser.
- End-to-End Type Safety: Built-in validation schema natively translates to TypeScript types on the client (via Eden).
- Plugin-centric: Everything in Elysia is a plugin. Modularity is a core tenet.

ROUTING & INSTANCE:
- Initialization: \`const app = new Elysia()\`.
- Routing: \`app.get('/', () => 'hi')\`
- Elysia instances return \`this\` (chainable).
- Listen: \`app.listen(3000)\`.

VALIDATION SCHEMA (TypeBox Built-in):
- Elysia uses TypeBox locally as \`t\`.
- Use the third argument of a route map to pass schemas: \`app.post('/', ({ body }) => body, { body: t.Object({ username: t.String() }) })\`.
- Schema parts that can be validated: \`body\`, \`query\`, \`params\`, \`headers\`, \`response\`, \`cookie\`.
- Type inference is automatic in the handler callback.

CONTEXT & LIFECYCLE:
- Context contains: \`body\`, \`query\`, \`params\`, \`headers\`, \`cookie\`, \`set\` (for status/response headers), \`request\`, \`store\`.
- Global state: Use \`.state('name', 'value')\`, access via \`store\`.
- Local variables/decorators: Use \`.decorate('db', new Database())\`.
- Derive values: Use \`.derive(({ headers }) => { return { auth: parse(headers) } })\` to inject values into context.

EDEN RPC:
- Natively type-safe RPC client without GraphQL or code generation.
- \`import { edenTreaty } from '@elysiajs/eden'; const api = edenTreaty<App>('http://localhost:3000'); await api.users.get();\`

COMMON PITFALLS:
- Confusing \`state\` and \`decorate\`. \`decorate\` is for static/readonly references (like a DB pool), while \`state\` via \`store\` is for mutable values.
- Forgetting that plugins (another Elysia instance) need to be registered strictly before the routes that depend on their derived values/decorators.
- Expecting Express-style \`req / res\` middleware. Elysia uses hooks (onBeforeHandle, onAfterHandle) and Context passing instead of mutation-based middleware chains.`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble} \n\n === CONTEXT ===\n${contextBlock} \n\n === ELYSIAJS QUESTION ===\n${prompt} `);
    }
}

export const elysiaOssAgent = new ElysiajsOssAgent();
