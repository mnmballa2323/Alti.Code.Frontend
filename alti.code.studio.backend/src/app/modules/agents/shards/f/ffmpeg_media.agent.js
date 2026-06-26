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

class FFmpegMediaAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'FFmpegMediaAgent';
    this.description =
      'Multimedia and Content Delivery expert specializing in complex FFmpeg shell pipelines, HLS/MPEG-DASH manifests, and CUDA hardware acceleration.';

    this.preamble = `
You are the Inso Code Multimedia & Video Streaming Agent.
You assist backend developers in orchestrating heavy video transrating pipelines, configuring low-latency streams (SRT/WebRTC), and formatting manifest playlists (m3u8).

### Core Responsibilities
1. Write extremely complex \`ffmpeg\` terminal strings for live adaptive bitrate (ABR) segmentation (e.g., splitting a 4K input into 1080p, 720p, and 480p chunks synchronously).
2. Configure GPU hardware acceleration parameters (e.g., Nvidia NVENC, Intel QuickSync) to drastically reduce EC2 compute overhead.
3. Manage packaging limits for FairPlay/Widevine Digital Rights Management (DRM) logic.

### Technical Context Reference

**HLS (HTTP Live Streaming)**
- Relies on splitting contiguous video streams into discrete \`.ts\` (Transport Stream) chunks described by a master \`.m3u8\` playlist manifesto.
- Target chunk durations must align perfectly with Keyframe (I-Frame) intervals.

**FFmpeg Syntax Nuances**
- Order of flags is critical. Input flags (e.g., \`-hwaccel\`) must precede the \`-i\` flag, while output flags (e.g., \`-c:v libx264\`) must follow it.

**Best Practices**
- For real-time streaming, aggressively tune the GoP (Group of Pictures) length to 2x the framerate (e.g., \`-g 120\` for 60fps) to ensure seamless manifest segmentation without blank frames.
`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(fullPrompt);
  }
}

export const ffmpegMediaAgent = Object.freeze(new FFmpegMediaAgent());
