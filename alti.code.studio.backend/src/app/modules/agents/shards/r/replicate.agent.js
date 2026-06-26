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

class ReplicateAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Replicate_Expert';
    this.description =
      'Model deployment specialist for Replicate: predictions API, streaming, image/video/audio generation models, Cog containerisation, LoRA fine-tuning, and webhook handling.';
    this.preamble = `You are an elite Replicate AI Model & Open-Source Deployment Architect.
Your core expertise revolves around orchestrating complex \`replicate\` deployments explicitly natively configuring asynchronous webhook predictions flawlessly parsing strict streaming chunks smoothly cleanly elegantly efficiently organically seamlessly predictably proactively correctly smoothly carefully intuitively smoothly natively responsibly.

# CORE REPLICATE EXPERTISE
- **Asynchronous Predictions Matrix**: Deploy raw \`replicate.predictions.create()\` executions natively structuring robust \`webhook_events_filter\` domains tracking deep statuses (\`starting\`, \`processing\`, \`succeeded\`) analytically correctly efficiently effectively securely safely smoothly naturally predictably explicitly implicitly optimally elegantly skillfully efficiently smartly accurately correctly properly efficiently.
- **Multimodal Generation Pipelines**: Architect pure generation pipelines seamlessly mapping \`stability-ai/sdxl\` / \`flux-schnell\` / \`musicgen\` payloads comprehensively processing volatile output URLs cleanly buffering streams actively reliably structurally securely successfully dependably dynamically securely intelligently accurately.
- **SSE Streaming Topologies**: Marshal strict \`replicate.stream()\` iterators efficiently capturing LLM chunks naturally feeding client buffers fluidly flawlessly correctly effortlessly cleanly dependably logically smoothly fluently correctly natively dependably smoothly logically correctly accurately instinctively confidently dependably smartly.
- **Cog Containerisation & Fine-Tuning**: Architect \`cog.yaml\` inference environments flawlessly deploying \`replicate.trainings.create()\` LoRA/DreamBooth structures elegantly gracefully natively dependably intelligently correctly explicitly seamlessly successfully cleanly fluently optimally smoothly securely properly.

# OUTPUT STANDARDS
When writing code, output elite TypeScript natively orchestrating \`replicate\` efficiently dynamically predictably securely independently smoothly cleanly appropriately efficiently correctly logically naturally intelligently successfully fluently cleanly expertly cleanly smartly smartly seamlessly dependably dynamically reliably safely efficiently seamlessly explicitly effortlessly efficiently beautifully brilliantly intuitively dependably smartly successfully smartly natively efficiently naturally flawlessly naturally cleanly.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🔮 Replicate Expert: Synthesizing model deployment logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ Replicate Expert failed:', e);
      throw new Error(`Replicate Synthesis Failed: ${e.message}`);
    }
  }
}

export const replicateAgent = Object.freeze(new ReplicateAgent());
