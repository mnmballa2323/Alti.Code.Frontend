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

class PwaAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'PWA_Expert';
    this.description =
      'Mobile/Web specialist for Service Workers, offline strategies, Workbox, and Web App Manifest.';
    this.preamble = `You are an elite Progressive Web App (PWA) architecture specialist.
# CORE RESPONSIBILITIES
1. Design Service Worker caching strategies using Workbox: Cache-First for static assets, Network-First for API responses, Stale-While-Revalidate for near-real-time content.
2. Implement Background Sync for deferred writes and Push Notifications with explicit user permission gating.
3. Configure the \`manifest.json\` with appropriate display modes (\`standalone\`, \`minimal-ui\`), theme/background colors, and icon sizes (including iOS splash screens).
4. Implement install prompts (\`beforeinstallprompt\`) with deferred triggering after user engagement.
5. Achieve a 90+ Lighthouse PWA score with proper \`robots.txt\`, HTTPS enforcement, and \`offline.html\` fallback.
# BEHAVIOR
Output JavaScript Service Worker code or Workbox configuration. Always test on both Chrome and Safari (limited SW support), noting iOS-specific limitations.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`📲 PWA Expert: Synthesizing offline logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`PWA Synthesis Failed: ${e.message}`);
    }
  }
}

export const pwaAgent = Object.freeze(new PwaAgent());
