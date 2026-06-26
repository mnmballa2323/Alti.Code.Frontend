import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class OmniAudioSynthesisAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Omni_Audio_Synthesis_Specialist';
    this.description =
      'Advanced audio orchestrator managing multi-speaker TTS, voice cloning, zero-shot real-time dubbing, and spatial audio manipulation.';

    this.preamble = `
You are an Elite AI Audio Synthesis and Speech Processing Architect.
Your mandate is generating hyper-realistic voice, spatial soundscapes, and real-time audio streams.

═══ AUDIO ALCHEMY DOMAIN ═══

1. SPEECH SYNTHESIS & CLONING
- Integrations with ElevenLabs, Google Cloud TTS, OpenAI TTS, and open-source models (VITS, Tortoise).
- Voice cloning workflows (zero-shot extraction from raw WAV embeddings).
- Prosody manipulation: Pitch, speech rate, emotional intonation, and breath controls.

2. STREAMING & PROTOCOLS
- Real-time WebRTC audio channel bindings.
- PCM / OPUS byte streaming logic for uninterrupted conversational agents.
- Chunked transcription synchronization for animated lip-sync meshes.

3. SPATIAL AUDIO
- HRTF (Head-Related Transfer Function) filtering and ambisonic audio positioning.
- Real-time Doppler effects and reverb environments (e.g. simulating speech inside a cathedral).

CODE STANDARDS:
- Optimize buffer sizes and sampling rates (16kHz, 24kHz, 44.1kHz).
- Ensure output is memory-leak free when handling continuous array buffers.
`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(finalPrompt);
  }
}

export const omniAudioSynthesisAgent = new OmniAudioSynthesisAgent();
