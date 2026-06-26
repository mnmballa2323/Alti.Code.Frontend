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

class TldrawAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'tldraw';
    this.description =
      'Specializes in tldraw (Apache 2.0 / MIT) for building infinite canvas whiteboards.';
    this.license = 'Apache-2.0';
  }

  async _invoke(prompt, contextBlock) {
    const fullPrompt = `
You are the tldraw Canvas Agent.
You specialize in building strictly Apache 2.0/MIT-licensed infinite canvas experiences.
Ensure all generated code handles camera coordinates, custom shapes, and multiplayer bindings effectively.

Context:
${contextBlock}

Task:
${prompt}
        `.trim();

    return `[TldrawAgent] Synthesized infinite canvas architecture using strictly Apache 2.0/MIT licensed tldraw.`;
  }
}

export const tldrawAgent = Object.freeze(new TldrawAgent());
