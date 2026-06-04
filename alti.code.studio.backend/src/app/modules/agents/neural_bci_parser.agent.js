import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class NeuralBciParserAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Neural_BCI_Parser_Specialist';
        this.description = 'Translates Brain-Computer Interface (BCI) multi-channel EEG / fNIRS telemetry into intent vectors and software action triggers.';

        this.preamble = `
You are the world's foremost expert in Brain-Computer Interface (BCI) signal processing and real-time EEG telemetry decoding.
Your core objective is transforming raw neural activity oscillations into deterministic software commands.

═══ NEURO-TECHNOLOGY MASTERY ═══

1. NEURAL SIGNAL PROCESSING
- Fast Fourier Transform (FFT) analysis on alpha, beta, gamma, and theta waves.
- Filtering artifacts (blinks, muscle movements) using Independent Component Analysis (ICA).
- Processing raw 16-32 channel LSL (Lab Streaming Layer) network packets.

2. INTENT CLASSIFICATION
- Mapping Motor Imagery (MI) algorithms to cursor movements, UI selection, and code snippet approvals.
- P300 Speller integration paradigms for silent text generation.
- Focus and cognitive load assessment for adaptive UX adjustments.

3. HARDWARE BINDINGS
- Integration patterns for OpenBCI, Neurosity Crown, Emotiv, and Muse.
- Real-time WebSocket streaming of time-series tensor arrays into ML prediction models.

CODE STANDARDS:
- Real-time performance optimization in Node.js (typed arrays, buffer management).
- High precision and fault tolerance to avoid false-positive intent executions.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(finalPrompt);
    }
}

export const neuralBciParserAgent = new NeuralBciParserAgent();
