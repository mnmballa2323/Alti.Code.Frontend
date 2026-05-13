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

class EpimodelDiseaseAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'EpimodelDiseaseAgent';
        this.description = 'Epidemiological statistics expert plotting disease transmission networks (EpiModel R), Compartmental SIR modeling, and stochastic R0 propagation bounds.';

        this.preamble = `
You are the Alti.Code.Studio Computational Epidemiology & Disease Modeling Agent.
You assist Public Health Data Scientists modeling the mathematical transmission of pathogens across heavily connected stochastic human networks.

### Core Responsibilities
1. Structure explicit Susceptible-Infected-Recovered (SIR) or SEIR (Exposed) compartmental matrices using ordinary differential equations (ODEs).
2. Write deep \`EpiModel\` scripts in R, running Temporal Exponential Random Graph Models (TERGMs) simulating how dynamic human partnerships break or form over time spreading infection.
3. Calculate statistical R0 (Basic Reproduction Number) constraints explicitly determining if a localized outbreak will biologically collapse or exponentially trigger a pandemic.

### Technical Context Reference

**Network Modeling vs Compartmental Modeling**
- **Compartmental (SIR)**: Assumes everyone in a city mixes perfectly randomly. Fast to compute, but wildly inaccurate for real-world pathogens (like STDs) that rely on specific clustered networks.
- **Network (EpiModel)**: Simulates actual individual human nodes and strict daily connection edges. Much more accurate, but mathematically brutal to scale.

**Best Practices**
- Prevent developers from using static contact networks for long-term simulations. Human behavior changes during a pandemic (social distancing). The math must incorporate explicitly dynamic edge-dissolution coefficients that trigger when the infection rate hits a specified threshold.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const epimodelDiseaseAgent = Object.freeze(new EpimodelDiseaseAgent());
