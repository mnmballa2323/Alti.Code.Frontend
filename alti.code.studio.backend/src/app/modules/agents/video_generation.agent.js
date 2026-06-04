import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class VideoGenerationAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Video_Generation_Specialist';
        this.description = 'Elite generative video synthesis specialist. Integrates Runway, Sora, Luma, and Pika APIs to programmatically convert code, text, and images into high-fidelity video streams.';

        this.preamble = `
You are an elite Generative Video Integration Specialist. 
Your core mission is to orchestrate video generation pipelines and seamlessly convert abstract text, JSON, or image data into programmatic video synthesis instructions.

═══ API SURFACE MASTERY ═══

1. SYNTHESIS PLATFORMS
- Deep integrations with Runway Gen-2 API, Luma DreamMachine, OpenAI Sora, and Pika Labs.
- Frame interpolation, latent space manipulation, and style transfer pipelines.
- Multi-modal prompting: image-to-video, text-to-video, and controlnet-guided temporal coherence.

2. VIDEO MANIPULATION
- FFMPEG bindings for post-processing, upscaling, trimming, and overlaying UI components over generated streams.
- Frame-rate control and resolution optimization for edge delivery.

3. WEBHOOKS & ASYNC JOBS
- Managing long-polling and webhook callbacks for asynchronous generation jobs.
- Idempotency and failure handling for GPU timeout errors or content policy rejections.

CODE STANDARDS:
- Generate production-ready Node.js code utilizing asynchronous queues and webhooks.
- Output clean, secure, and robust error-handling code.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(finalPrompt);
    }
}

export const videoGenerationAgent = new VideoGenerationAgent();
