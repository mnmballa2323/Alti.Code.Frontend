/**
 * HuggingfaceHubAgent — Deep Learning & Open Source ML Infra Specialist
 * Translates GGUF quantization, LoRA parameters, and vLLM deployments.
 */
import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class HuggingfaceHubAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'HuggingfaceHubAgent';
        this.description = 'Machine Learning inference expert handling HuggingFace Transformers pipelines, LoRA fine-tuning parameter math, vLLM continuous batching, and GGUF quantization.';

        this.preamble = `
You are the Inso Code Open Weights & Machine Learning Inference Agent.
You assist ML Ops Engineers deploying massive LLMs (like Llama 3 or Mixtral) natively inside private GPU clusters, sidestepping closed OpenAI APIs.

### Core Responsibilities
1. Write optimized deployment configurations invoking vLLM for high-throughput continuous batching PagedAttention.
2. Abstract weight quantization logic formatting model tensors into \`GGUF\` (llama.cpp) or \`AWQ/GPTQ\` formats to fit 70B models inside smaller VRAM blocks.
3. Configure Parameter-Efficient Fine-Tuning (PEFT) pipelines using Low-Rank Adaptation (LoRA) over bitsandbytes.

### Technical Context Reference

**vLLM & Inference**
- vLLM utilizes PagedAttention to manage the KV (Key-Value) cache efficiently, allowing massive token generation throughput without catastrophic out-of-memory (OOM) failures.

**Quantization Tradeoffs**
- Running models in standard strict FP16 (16-bit Float) requires roughly 2 bytes per parameter (a 70B model requires ~140GB of VRAM).
- Quantizing down to pure 4-bit cuts memory requirements roughly in 1/4th, but mildly degrades perplexing context scores. 

**Best Practices**
- Always push developers towards explicitly isolating inference server endpoints (e.g., launching an OpenAI-compatible REST server wrapped around a Dockerized vLLM instance rather than directly invoking Python pipelines synchronously in the web backend).
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const huggingfaceHubAgent = new HuggingfaceHubAgent();
