/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class SentinelAgent {
    constructor() {
        this.name = 'sentinel';
        this.description = 'Omnipresent SRE Observer and Anomaly Detector';
        this.capabilities = [
            'Monitor live application logs and telemetry buffers',
            'Detect emerging architectural anomalies (e.g., latency spikes, 500 error storms)',
            'Trigger PagerDuty / Siren alarms proactively'
        ];
    }

    /**
     * Ingests an array of recent log entries or traces and evaluates them for system health.
     * @param {Array<Object>} logStream Array of log objects or trace strings
     */
    async evaluateHealth(logStream = []) {
        logger.info(`👁️ Sentinel Agent: Scanning incoming telemetry stream (${logStream.length} entries)...`);

        if (!logStream || logStream.length === 0) {
            return { status: 'HEALTHY', message: 'No telemetry data to analyze. System assumed healthy.' };
        }

        try {
            const prompt = `
            You are "The Sentinel", an Elite Google Cloud Security & Reliability Engineer running an autonomous monitoring watchdog.
            Analyze the following recent system logs/telemetry for ANY signs of anomalies, performance degradation, failure cascades, OR Mandiant Indicators of Compromise (IoCs) such as unauthorized data egress, identity proxy bypass, or zero-day exploitation traces.
            
            Telemetry Data:
            ${JSON.stringify(logStream, null, 2)}
            
            Evaluate the severity of the system state.
            Return a pure JSON object structured exactly like this:
            {
                "status": "HEALTHY" | "WARNING" | "CRITICAL" | "MANDIANT SEV-1",
                "confidence": number (0-100),
                "summary": "Brief 1-sentence analysis",
                "recommendedAction": "What to do next"
            }
            Do not include markdown code block syntax formatting.
            `;

            const rawResponse = await GeminiAiService.generateContent(prompt);
            const analysis = JSON.parse(rawResponse.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim());

            if (analysis.status === 'CRITICAL' || analysis.status === 'WARNING' || analysis.status === 'MANDIANT SEV-1') {
                if (analysis.status === 'MANDIANT SEV-1') {
                    logger.error(`🚨🚨🚨 COMMAND CENTER ALERT [MANDIANT SEV-1]: ${analysis.summary}`);
                } else {
                    logger.warn(`🚨 Sentinel Alert [${analysis.status}]: ${analysis.summary}`);
                }
                // In a true live system, this would trigger the DetectiveAgent and SirenAgent via Swarm bus.
            } else {
                logger.info(`✅ Sentinel Agent: System operating within normal parameters.`);
            }

            return analysis;

        } catch (error) {
            logger.error(`❌ Sentinel Agent Error parsing telemetry: ${error.message}`);
            throw error;
        }
    }

    async process(state) {
        const telemetry = state.data?.content || state.data?.logs || [];

        let targetLogs = telemetry;
        // Fallback to checking the system's observability service recent traces if not provided
        if ((!telemetry || telemetry.length === 0) && global.observabilityService) {
            targetLogs = global.observabilityService.getRecentTraces();
        }

        const evaluation = await this.evaluateHealth(targetLogs);

        return {
            ...state,
            status: 'success',
            results: [...(state.results || []), `Health Status: ${evaluation.status} - ${evaluation.summary}`]
        };
    }
}

export const sentinelAgent = new SentinelAgent();
