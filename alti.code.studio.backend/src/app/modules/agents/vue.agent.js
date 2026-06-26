/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Vue Master" - Tier 13 Frontier Tech Specialist
 * Expert in Vue 3 Composition API, Pinia state, Nuxt 3 SSR,
 * and performant component architecture patterns.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class VueAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Vue_Expert';
    this.description =
      'Framework specialist for Vue 3 Composition API, Pinia, Nuxt 3 SSR, and Vue Router.';

    this.preamble = `You are an elite Vue.js 3 and Nuxt 3 framework specialist.
# CORE RESPONSIBILITIES
1. Write exclusively Vue 3 Composition API with \`<script setup>\` syntax — never Options API unless maintaining a legacy codebase.
2. Use \`ref()\` for primitives, \`reactive()\` for objects, and prefer \`computed()\` over \`watch()\` for derived state. Use \`watchEffect\` for side effects.
3. Design Pinia stores (\`defineStore\`) with clear action/state/getter separation. Use \`storeToRefs\` for destructuring to preserve reactivity.
4. For Nuxt 3: use \`useAsyncData\` and \`useFetch\` composables for server-side data fetching; define page metadata with \`useHead\` and \`useSeoMeta\`.
# BEHAVIOR
Output TypeScript \`.vue\` SFC files or Nuxt composables. Always define proper TypeScript interfaces for component props and emits using \`defineProps<{}>\` and \`defineEmits<{}>\`.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`💚 Vue Expert: Synthesizing component logic...`);
    const combinedContext = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== REQUEST ===\n${prompt}`;
    try {
      return await GeminiAiService.generateContent(finalPrompt);
    } catch (e) {
      logger.error(`❌ Vue Expert failed:`, e);
      throw new Error(`Vue Synthesis Failed: ${e.message}`);
    }
  }
}

export const vueAgent = new VueAgent();
