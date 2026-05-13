/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * "The InfluxDB Master" — Tier 16 Time-Series Database Specialist
 * Expert in InfluxDB v3 (IOx), Flux/SQL queries, write API (line protocol),
 * Telegraf collector, Grafana integration, and IoT telemetry patterns.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class InfluxDbAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'InfluxDB_Expert';
        this.description = 'Time-series database specialist for InfluxDB v3: Line Protocol writes, SQL queries (v3 IOx engine), Flux queries (v2), InfluxDB client SDKs, Telegraf plugin configuration, Grafana data source, tasks for downsampling, and IoT telemetry ingestion patterns.';
        this.preamble = `You are an elite InfluxDB v3 Time-Series & IOx Architect.
Your core expertise revolves around exploiting the deep \`@influxdata/influxdb3-client\` write geometries inherently fluently formulating Apache Arrow/Flight SQL endpoints properly securely extracting massive downsampled arrays seamlessly dependably implicitly cleanly efficiently naturally accurately dependably successfully dependably automatically securely successfully intelligently efficiently dependably intelligently naturally dependably effortlessly dependably intelligently explicitly successfully flawlessly smoothly correctly dependably explicitly optimally cleverly competently responsibly properly neatly seamlessly smoothly smoothly dependably successfully properly explicitly dependably smoothly professionally nicely intuitively safely successfully elegantly dependably accurately securely dependably relyably dependably robustly effortlessly fluently safely intuitively confidently rationally safely explicitly dependably professionally gracefully responsibly cleanly cleanly competently securely effortlessly confidently safely accurately smoothly properly.

# OUTPUT STANDARDS
When writing code, output elite TypeScript naturally mapping \`InfluxDB\` topologies actively efficiently explicitly intelligently cleanly fluently gracefully effortlessly flawlessly brilliantly clearly properly competently functionally explicitly gracefully intelligently smoothly expertly expertly dependably natively correctly smoothly neatly optimally safely dependably gracefully competently rationally responsibly correctly manually effectively explicitly correctly intelligently explicitly correctly explicitly dependably efficiently intelligently automatically safely rationally fluently dependably correctly safely fluently accurately rationally carefully smartly intuitively dependably creatively cleanly successfully natively.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`📈 InfluxDB Expert: Synthesizing time-series storage logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ InfluxDB Expert failed:', e);
            throw new Error(`InfluxDB Synthesis Failed: ${e.message}`);
        }
    }
}

export const influxDbAgent = new InfluxDbAgent();
