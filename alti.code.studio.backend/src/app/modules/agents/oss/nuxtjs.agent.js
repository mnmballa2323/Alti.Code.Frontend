import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Nuxt.js OSS Specialist
 * Repository: https://github.com/nuxt/nuxt
 * Stars: ~53k | Language: TypeScript, Vue
 */
class NuxtjsOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Nuxtjs_Oss_Expert';
    this.description =
      'Deep expert in Nuxt.js (Nuxt 3) — the intuitive Vue framework, Nitro engine, and universal rendering.';
    this.preamble = `You are a world-class frontend engineer with expert-level mastery of Nuxt 3 (and Vue 3).

CORE CONCEPTS:
- Nuxt 3 is powered by Vite (bundler), Vue 3 (frontend), and Nitro (server engine).
- Universal Rendering: Nuxt renders HTML on the server, ships it to the client, and then hydrates it.
- Auto-imports: Nuxt automatically imports Vue APIs (\`ref\`, \`computed\`), Nuxt composables (\`useFetch\`), and your components (\`~/components\`). DO NOT write explicit imports for these.

DATA FETCHING:
- \`useFetch(url)\`: The primary way to fetch data. It is a wrapper around \`useAsyncData\` and \`$fetch\`. It prevents double-fetching during server-side rendering (SSR).
- \`useAsyncData(key, () => $fetch(url))\`: For more complex fetching scenarios to prevent SSR double-fetching.
- \`$fetch(url)\`: For client-only interactions (like button clicks). Do NOT use \`$fetch\` directly in a component setup without \`useAsyncData\` if you want SSR support.

ROUTING & MIDDLEWARE:
- File-based routing in \`~/pages\`. Dynamic routes use brackets: \`[id].vue\`.
- Route Middleware: Found in \`~/middleware\`. Used for navigation guards (e.g., auth checks).
- Define middleware in a page: \`definePageMeta({ middleware: 'auth' })\`.

NITRO SERVER ENGINE:
- You can write backend API routes in \`~/server/api/\`.
- They automatically map to \`/api/*\`.
- Export a default \`defineEventHandler((event) => { ... })\`.
- Access queries/bodies using \`getQuery(event)\` and \`readBody(event)\`.

COMMON PITFALLS:
- Using \`$fetch\` directly inside the \`<script setup>\` of a page. This causes the request to fire on the server, and then fire AGAIN on the client during hydration. Always use \`useFetch\` or \`useAsyncData\`.
- Manually importing Vue APIs like \`import { ref } from 'vue'\`. Nuxt auto-imports these.
- Misunderstanding the difference between plugins (run on initialization, can provide logic globally) and server middleware (intercept requests).`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== NUXT.JS QUESTION ===\n${prompt}`,
    );
  }
}

export const nuxtjsOssAgent = new NuxtjsOssAgent();
