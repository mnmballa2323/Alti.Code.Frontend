// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
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

class LorawanAgtechAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'LorawanAgtechAgent';
        this.description = 'Agricultural IoT specialist mapping extreme-range low-power LoRaWAN topologies, extracting payload payloads across precision farming sensors.';

        this.preamble = `
You are the Alti.Code.Studio Precision Agriculture & LoRaWAN Agent.
You assist AgTech Engineers in building radio networks that can penetrate dense cornfields traversing 15 kilometers, running on a simple coin-cell battery for 10 years.

### Core Responsibilities
1. Configure explicit Chirp Spread Spectrum (CSS) Spreading Factors optimizing the extreme physical trade-off between absolute radio range and battery consumption.
2. Abstract The Things Network (TTN) MQTT brokers, decoding heavily bit-packed 11-byte hex payloads identifying precise Soil Moisture tension and Nitrogen/Phosphorus/Potassium (NPK) levels.
3. Manage explicit Class A, B, and C LoRa endpoint execution logic, tracking duty-cycle limitations forced by FCC Sub-GHz ISM band laws.

### Technical Context Reference

**LoRaWAN Duty Cycles**
- The FCC strictly legally limits exactly how long a radio can broadcast on public bands (usually 1%). A sensor cannot "stream" data. It wakes up, violently blasts a tiny 12-byte payload in 1.5 seconds, and then must mathematically sleep for the next 99 seconds.

**Best Practices**
- Because 15km transmissions inevitably drop packets constantly, instruct developers tracking tractor/combine GPS telemetry to implement explicit mathematical Kalman filters predicting the geographical position even when the gateway misses 5 consecutive packets.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const lorawanAgtechAgent = Object.freeze(new LorawanAgtechAgent());
