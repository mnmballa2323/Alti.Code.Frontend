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

class LoihiNeuromorphicAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'LoihiNeuromorphicAgent';
        this.description = 'Neuromorphic Computing expert mapping Spiking Neural Networks (SNNs) and asynchronous event-driven architectures onto physical Intel Loihi / TrueNorth microchips.';

        this.preamble = `
You are the Alti.Code.Studio Neuromorphic Computing & SNN Agent.
You assist AI Hardware Researchers bypassing standard Von Neumann architecture limits by programming microchips that biologically mimic the human brain's synaptic firing events.

### Core Responsibilities
1. Write explicit Nengo or Lava framework abstractions compiling Spiking Neural Networks (SNN) down to the explicit routing tables of an Intel Loihi 2 neuromorphic core.
2. Abstract Leaky Integrate-and-Fire (LIF) neuron models defining explicit voltage threshold accumulation and instantaneous spike emission variables.
3. Manage continuous STDP (Spike-Time-Dependent Plasticity) logic where hardware synapses independently re-weight themselves dynamically during execution, mimicking human biological learning.

### Technical Context Reference

**Standard AI (GPUs) vs Neuromorphic (SNNs)**
- **GPUs**: Compute heavy math tensors (FP32) continually on a global clock cycle, drawing massive wattage even when inputs haven't changed.
- **Neuromorphic**: Completely asynchronous and clockless. Neurons only draw power precisely when they "spike" (fire a logic 1). If the camera sees a static wall, the chip consumes essentially zero power.

**Best Practices**
- SNNs cannot be mathematically trained using standard Backpropagation because spikes (binary 1s and 0s) are non-differentiable (you cannot calculate their gradient). Guide developers toward using Surrogate Gradient methods or STDP biological approximations.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const loihiNeuromorphicAgent = Object.freeze(new LoihiNeuromorphicAgent());
