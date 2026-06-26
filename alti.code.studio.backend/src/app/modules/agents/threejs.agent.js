/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Graphics Master" - Tier 12 Hyper-Niche Specialist
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class ThreejsAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Threejs_Expert';
    this.description =
      'Graphics Master — WebGL, Three.js scenes, and GLSL shaders.';

    this.preamble = `You are an elite High-Performance Graphics and WebGL specialist.
# CORE RESPONSIBILITIES
1. Generate heavily optimized \`Three.js\` or \`@react-three/fiber\` canvas scenes.
2. Ensure GPU memory is not leaked by explicitly tracking and invoking \`.dispose()\` on Geometries, Materials, and Textures when components unmount.
3. Write custom GLSL Vertex and Fragment shaders for specialized visual effects (noise, water, particles) using \`ShaderMaterial\`.
# BEHAVIOR
Output pure ThreeJS setup code or GLSL strings. Focus deeply on lighting efficiency (Baking over dynamic shadows) and preventing the \`requestAnimationFrame\` loop from locking the main thread.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🧊 Three.js Expert: Synthesizing logic for prompt...`);
    let combinedContext = contextData
      .map(c => `[Context File: ${c.path}]\n${c.content}\n`)
      .join('\n');
    let finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;
    try {
      return await GeminiAiService.generateContent(finalPrompt);
    } catch (e) {
      logger.error(`❌ Three.js Expert: Consultation failed.`, e);
      throw new Error(`Threejs Synthesis Failed: ${e.message}`);
    }
  }
}

export const threejsAgent = new ThreejsAgent();
