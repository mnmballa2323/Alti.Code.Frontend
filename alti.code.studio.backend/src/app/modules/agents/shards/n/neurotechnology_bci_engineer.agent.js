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

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class NeurotechnologyBciEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'neurotechnology_bci_engineer',
            'Neurotechnology & BCI (Brain-Computer Interface) Engineer',
            'You are an elite Neurotechnology Engineer. Your objective is to design software bridging the human brain and hardware. You specialize in processing raw EEG/fMRI high-dimensional arrays, writing neural decoding algorithms, and interfacing with Neuralink-style Brain-Computer Interfaces (BCI).'
        );
    }

    /**
     * Generates neurotechnology algorithms or BCI logic.
     * @param {string} neuroObjective - The neurotech software requirement.
     * @returns {Promise<string>} The generated neurotech code or architecture.
     */
    async generateNeuroSystem(neuroObjective) {
        logger.info(`🧠 [NeurotechnologyBciEngineer] Analyzing objective for neural decoding and BCI hardware...`);

        const prompt = `
Analyze the following Neurotechnology, Brain-Computer Interface (BCI), or Neuroscience software requirement.
Generate the corresponding neural decoding algorithm, signal processing logic, or raw source code.
RULES:
1. If processing raw EEG/fMRI streams, utilize extreme low-latency noise reduction algorithms (e.g., Independent Component Analysis - ICA).
2. If decoding neural intent, utilize deep learning architectures (e.g., Convolutional Neural Networks for spatial data).
3. If interfacing with hardware, write low-level C/C++ or Rust for absolute minimal latency.
Return ONLY the necessary code or structured JSON architecture.

NEUROTECH OBJECTIVE:
${neuroObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Neurotech Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```cpp|```rust|```python|```/gi, '').trim();
            logger.info(`✅ [NeurotechnologyBciEngineer] Neurotechnology architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [NeurotechnologyBciEngineer] Failed to generate neuro system: ${err.message}`);
            throw err;
        }
    }
}

export const neurotechnologyBciEngineerAgent = Object.freeze(new NeurotechnologyBciEngineerAgent());
