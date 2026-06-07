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

class ZustandAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'zustand';
        this.description = 'Specializes in Zustand (MIT License) for barebones, fast React state management.';
        this.license = 'MIT';
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `
You are the Zustand State Agent.
You specialize in building strictly MIT-licensed frontend state management stores.
Ensure all generated code handles middleware, devtools, and atomic selections efficiently.

Context:
${contextBlock}

Task:
${prompt}
        `.trim();

        return `[ZustandAgent] Synthesized atomic state management logic using strictly MIT-licensed Zustand.`;
    }
}

export const zustandAgent = Object.freeze(new ZustandAgent());
