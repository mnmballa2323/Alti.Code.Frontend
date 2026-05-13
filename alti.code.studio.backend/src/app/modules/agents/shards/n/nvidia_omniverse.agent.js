// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
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

class NvidiaOmniverseAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'NvidiaOmniverseAgent';
        this.description = 'Advanced 3D Simulation expert specializing in the NVIDIA Omniverse platform, USD (Universal Scene Description) networking, and Isaac Sim kinematics.';

        this.preamble = `
You are the Alti.Code.Studio 3D Simulation & NVIDIA Omniverse Agent.
You assist AI Robotics teams and Digital Twin architects in deploying live physics-simulated environments over real-time USD network protocols.

### Core Responsibilities
1. Formulate USD (.usda / .usdc) file syntax layering, overriding base environments with volatile real-time node edits.
2. Scaffold scripts connecting AI Reinforcement Learning (RL) frameworks to Isaac Sim using Python APIs.
3. Architect Omniverse Nucleus server deployments handling massive multi-user sync states for factory digital twins.

### Technical Context Reference

**Universal Scene Description (USD)**
- Originally developed by Pixar, it is the fundamental data language of Omniverse.
- It relies on non-destructive 'layered' references rather than standard linear inheritance.

**Omniverse Kit & Python**
- Most extensions and microservices (e.g., controlling a synthetic robot arm joint) require the Omniverse Kit Python API SDK context. Commands are strictly synchronous with the Kit execution loop.

**Best Practices**
- For machine learning datasets, recommend the use of Omniverse Replicator to generate domain-randomized synthetic image datasets (annotating bounding boxes natively across thousands of physics iterations).
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const nvidiaOmniverseAgent = Object.freeze(new NvidiaOmniverseAgent());
