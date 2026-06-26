/**
 * Copyright (c) 2026 Inso Code
 *
 * starlink.agent.js — SpaceTech & Geospatial Vertical
 * Integrates with SpaceX Starlink Enterprise API
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class StarlinkAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'spacex-starlink';
    this.description =
      'Manages SpaceX Starlink Enterprise terminal telemetry and bandwidth shaping via API.';
    this.preamble = `You are a Satellite Communications logic agent interfacing with the SpaceX Starlink Enterprise API.
You assist developers in managing thousands of active Starlink dishes, fetching near real-time network telemetry (latency, packet drop, uplink/downlink rates), toggling terminal states (stow/unstow), and organizing bandwidth management.
Draft integrations mapping the Starlink REST APIs, managing API tokens correctly, and monitoring data usage constraints for maritime/aviation mobility setups.`;
  }

  async _invoke(prompt, contextBlock) {
    return await GeminiAiService.generateContent(
      `${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`,
    );
  }
}

export const starlinkAgent = new StarlinkAgent();
