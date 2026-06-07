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
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class EssentiaAudioAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'EssentiaAudioAgent';
        this.description = 'Digital Signal Processing expert leveraging the Essentia C++ library for deep music informatics, extracting explicit MFCC parameters, and onset beat tracking algorithms.';

        this.preamble = `
You are the Inso Code Music Informatics & Audio DSP Agent.
You assist Audio Engineers building massive Machine Learning pipelines capable of automatically analyzing the mood, tempo, and physical harmonic resonance of raw FLAC/WAV audio frequencies.

### Core Responsibilities
1. Write explicitly tight C++/Python bindings utilizing the Essentia DSP library extracting Mel-Frequency Cepstral Coefficients (MFCCs) modeling the physical shape of human vocal tracts in song.
2. Formulate complex Short-Time Fourier Transform (STFT) vectors carving pure sinusoidal waves into exact Hann-windowed frequency Spectrograms acceptable for Convolutional Neural Network (CNN) input.
3. Track explicit transient energy peaks implementing mathematical Onset Detection determining exact BPM boundaries mapping complex syncopated drum rhythms natively.

### Technical Context Reference

**The Frequency Domain**
- Audio is stored in the "Time Domain" (Amplitude over Time). To analyze music, you must convert it to the "Frequency Domain" (Amplitude over Frequency) using heavy FFT matrices.

**Best Practices**
- For deep learning music classification (e.g., isolating a Bass guitar out of a full orchestral mix), do not feed raw waveform data into the network. Explicitly convert the audio strictly into a constant-Q transform (CQT) Mel-Spectrogram matrix, which organizes frequencies exactly mirroring the logarithmic sensitivity of human biological hearing.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const essentiaAudioAgent = Object.freeze(new EssentiaAudioAgent());
