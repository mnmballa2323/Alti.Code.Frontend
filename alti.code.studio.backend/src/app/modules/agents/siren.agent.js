/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import say from 'say';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class SirenAgent {
    constructor() {
        this.name = 'siren';
        this.description = 'Crisis Communication and Alerting Engine';
        this.capabilities = [
            'Synthesize Incident reports for DevOps channels',
            'Trigger PagerDuty / Slack mock webhooks',
            'Vocal Text-to-Speech (TTS) announcements'
        ];
        this.isSpeaking = false;
    }

    /**
     * Synthesizes a raw JSON RCA from the DetectiveAgent into an urgent broadcast.
     * @param {Object} rcaReport The Root Cause Analysis JSON object
     */
    async broadcastIncident(rcaReport) {
        logger.warn(`🚨 Siren Agent: Initiating SEV-1 Crisis Broadcast Protocol...`);

        try {
            const prompt = `
            You are a Crisis Communications AI for an elite engineering team.
            Translate the following technical payload (Root Cause Analysis or a Mandiant Threat Intelligence Report) into a stark, professional, and urgent PagerDuty/Slack Alert message.
            Keep it under 3 sentences. Be authoritative. If the threat involves 'MANDIANT SEV-1', start the message with "[CRITICAL SECURITY INCIDENT]".

            Incident Payload:
            ${JSON.stringify(rcaReport, null, 2)}
            `;

            const alertText = await GeminiAiService.generateContent(prompt);
            const cleanAlert = alertText.trim();

            logger.info(`\n================= PAGERDUTY / SLACK MOCK =================`);
            logger.info(`[SEV-1 ALERT] @devops-oncall\n${cleanAlert}`);
            logger.info(`==========================================================\n`);

            // Attempt to vocalize the alert (non-blocking)
            this.speak(`Attention engineering: ${cleanAlert}`).catch(() => { });

            return {
                status: 'BROADCAST_SENT',
                message: cleanAlert
            };

        } catch (error) {
            logger.error(`❌ Siren Agent Error constructing broadcast: ${error.message}`);
            throw error;
        }
    }

    /**
     * Speak the provided text (Legacy method retained for backward compatibility)
     * @param {string} text 
     */
    speak(text) {
        return new Promise((resolve, reject) => {
            if (!text) {
                return resolve();
            }

            this.isSpeaking = true;
            say.speak(text, null, 1.0, (err) => {
                this.isSpeaking = false;
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    stop() {
        say.stop();
        this.isSpeaking = false;
    }

    async process(state) {
        const rcaData = state.data?.rca || state.goal;
        if (!rcaData) {
            return { ...state, status: 'error', error: 'No RCA data provided to broadcast.' };
        }

        const result = await this.broadcastIncident(rcaData);

        return {
            ...state,
            status: 'success',
            results: [...(state.results || []), `Broadcast Sent: ${result.message}`]
        };
    }
}

export const sirenAgent = new SirenAgent();
