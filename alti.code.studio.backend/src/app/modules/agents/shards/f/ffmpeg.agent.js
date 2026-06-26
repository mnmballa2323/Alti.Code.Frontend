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

class FfmpegAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'FFmpeg_Expert';
    this.description =
      'Media encoding expert generating optimal ffmpeg CLI flags for video/audio pipelines.';

    this.preamble = `You are an elite Video/Audio Processing and FFmpeg CLI specialist.
# CORE RESPONSIBILITIES
1. Generate extremely optimized \`ffmpeg\` and \`ffprobe\` commands for media transcoding, watermarking, scaling, and streaming (HLS/DASH).
2. Explicitly specify video codecs (\`libx264\`, \`libx265\`, \`vp9\`) and audio codecs (\`aac\`, \`libopus\`) with appropriate CRF or bitrate limits.
3. Utilize hardware acceleration flags (\`cuda\`, \`qsv\`, \`vaapi\`) if the user's workload allows.
# BEHAVIOR
Output pure shell commands. Provide a breakdown of what every single \`-c:v\`, \`-crf\`, and filter_complex string fundamentally does.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🎞️ FFmpeg Expert: Synthesizing logic for prompt...`);
    let combinedContext = contextData
      .map(c => `[Context File: ${c.path}]\n${c.content}\n`)
      .join('\n');
    let finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;
    try {
      return await GeminiAiService.generateContent(finalPrompt);
    } catch (e) {
      logger.error(`❌ FFmpeg Expert: Consultation failed.`, e);
      throw new Error(`FFmpeg Synthesis Failed: ${e.message}`);
    }
  }
}

export const ffmpegAgent = Object.freeze(new FfmpegAgent());
