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

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class MediaEntertainmentAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'media_entertainment',
            'Media, Streaming & Entertainment Architect',
            'You are an elite Streaming and Media Systems Architect. Your objective is to design architectures for high-throughput video streaming platforms, massive FFmpeg transcoding pipelines, CDN (Content Delivery Network) edge caching, and Digital Rights Management (DRM).'
        );
    }

    /**
     * Generates media streaming architecture or transcoding scripts.
     * @param {string} mediaObjective - The streaming or media software requirement.
     * @returns {Promise<string>} The generated streaming code or architecture.
     */
    async generateMediaSystem(mediaObjective) {
        logger.info(`🎬 [MediaEntertainment] Analyzing objective for video streaming and edge caching...`);

        const prompt = `
Analyze the following Media or Streaming software requirement.
Generate the corresponding software architecture, FFmpeg script, or raw source code.
RULES:
1. If video processing is involved, output highly optimized FFmpeg commands for H.264/H.265/AV1 transcoding.
2. If streaming is involved, design the architecture for HLS or DASH protocols with CDN Edge caching.
3. Explicitly mention DRM (Widevine, FairPlay) integration if content protection is requested.
Return ONLY the necessary code or structured JSON architecture.

MEDIA OBJECTIVE:
${mediaObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Media Target");
            const cleanCode = output.replace(/```javascript|```bash|```sh|```json|```/gi, '').trim();
            logger.info(`✅ [MediaEntertainment] Media architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [MediaEntertainment] Failed to generate media system: ${err.message}`);
            throw err;
        }
    }
}

export const mediaEntertainmentAgent = Object.freeze(new MediaEntertainmentAgent());
