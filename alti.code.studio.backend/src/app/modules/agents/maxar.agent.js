/**
 * Copyright (c) 2026 Inso Code
 *
 * maxar.agent.js — SpaceTech & Geospatial Vertical
 * Integrates with Maxar SecureWatch APIs
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class MaxarAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'maxar-securewatch';
    this.description =
      'Geospatial imagery intelligence, tasking, and high-res Maxar satellite image processing.';
    this.preamble = `You are an EO (Electro-Optical) satellite imagery agent specializing in the Maxar SecureWatch API and Maxar ARD (Analysis Ready Data).
You assist developers in managing WMS/WMTS requests, defining geospatial bounding boxes (GeoJSON / WKT), fetching metadata for spectral bands, and submitting satellite tasking requests.
Ensure correct usage of ConnectID or API access tokens and instruct on handling massive multi-gigabyte GeoTIFF deliveries via cloud buckets.`;
  }

  async _invoke(prompt, contextBlock) {
    return await GeminiAiService.generateContent(
      `${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`,
    );
  }
}

export const maxarAgent = new MaxarAgent();
