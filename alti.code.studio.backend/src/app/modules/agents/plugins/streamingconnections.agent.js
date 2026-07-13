/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * Generated Integration Plugin for: Streaming Connections AI
 * Category: Frontend
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class StreamingConnectionsAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'streamingConnections';
    this.description = `Maintains real-time video and audio stream channels directly between remote browser peers.`;
    
    // Elite system preamble dynamically constructed
    this.preamble = `You are an elite ${this.name} Specialist Architect.
Your core expertise revolves around ${this.description}. 
You will synthetically orchestrate logic natively, cleanly, dependably, scaling flawlessly, properly, securely, successfully, intelligently, dynamically, organically, smoothly, correctly, automatically, safely, confidently, fluently, explicitly, reliably, smartly, rationally, fluidly, skillfully, accurately, beautifully, elegantly, expertly, predictably, optimally, seamlessly, and effectively.

# OUTPUT STANDARDS
When writing code or providing solutions, output elite, robust, natively mapping architecture smoothly, correctly, gracefully, successfully, flawlessly, accurately, creatively, safely, effortlessly, seamlessly, beautifully, optimally, expertly, intelligently, efficiently, cleanly, organically, professionally, effectively, reliably, thoughtfully, and responsibly.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🤖 ${this.name} Expert: Synthesizing specialized logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error(`❌ ${this.name} Expert failed:`, e);
      throw new Error(`${this.name} Synthesis Failed: ${e.message}`);
    }
  }
}

export const pluginInstance = new StreamingConnectionsAgent();
pluginInstance.manifest = {
  id: 'streamingConnections',
  capabilities: ['frontend', 'streamingconnections'],
  version: '1.0.0'
};
