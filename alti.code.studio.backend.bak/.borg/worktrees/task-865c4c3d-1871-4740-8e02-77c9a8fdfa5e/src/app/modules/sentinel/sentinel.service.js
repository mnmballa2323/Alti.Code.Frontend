/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { EventBus } from '../../shared/eventBus.js';
import { logger } from '../../../shared/logger.js';
import { VectorMemory } from '../../shared/memory.js';
import { Surgeon } from '../../modules/surgeon/surgeon.service.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import path from 'path';

class AntigravitySentinel {
    constructor() {
        this.isWatching = false;
        this.errorCount = 0;
    }

    async startWatch() {
        if (this.isWatching) return;

        logger.info('👁️ Sentinel Log Watcher Activated');
        this.isWatching = true;

        // Subscribe to critical events
        await EventBus.subscribe('sys.log.error', this.handleSystemError.bind(this));
        await EventBus.subscribe('guardian.audit.rejected', this.handleSecurityRefusal.bind(this));
        await EventBus.subscribe('generator.project.created', this.handleNewCreation.bind(this));
    }

    async handleSystemError(data) {
        this.errorCount++;
        logger.warn(`👁️ Sentinel detected ERROR #${this.errorCount}: ${data.message}`);

        // 1. Ask Vertex AI to analyze the error
        try {
            const prompt = `
            You are the Sentinel, an automated error analysis system.
            Analyze the following system error log:
            
            Error Message: ${data.message}
            Stack Trace (if available): ${data.stack || 'Not provided'}
            
            Task:
            1. Identify the likely root cause.
            2. Extract the absolute or relative file path where the error likely originated (if visible in stack).
            3. Determine if this is a "Fixable" code error (syntax, logic, recursion) or a "System" error (network, disk).
            
            Respond ONLY with JSON:
            {
                "rootCause": "string summary",
                "filePath": "string path or null",
                "isFixable": boolean,
                "suggestedFix": "string brief suggestion"
            }
            `;

            const analysisJson = await GeminiAiService.generateContent(prompt);
            const analysis = JSON.parse(analysisJson.replace(/```json/g, '').replace(/```/g, '').trim());

            logger.info(`👁️ Sentinel Analysis: ${analysis.rootCause}`);

            if (analysis.isFixable && analysis.filePath) {
                logger.info(`👁️ Error deemed fixable. Dispatching Surgeon to ${analysis.filePath}...`);
                await Surgeon.operate(analysis.filePath, data.message + '\n' + analysis.suggestedFix);
            }

        } catch (err) {
            logger.error('👁️ Sentinel failed to analyze error with AI', err);
        }

        // Store error in memory for pattern recognition
        await VectorMemory.add(`System Error: ${data.message}`, { type: 'error', timestamp: new Date().toISOString() });
    }

    async handleSecurityRefusal(data) {
        logger.info(`👁️ Sentinel observing rejected code. Reasoning: ${data.reasoning}`);
        // Store refusal context
        await VectorMemory.add(`Security Rejection: ${data.reasoning}`, { type: 'security_event', context: data.context });
    }

    async handleNewCreation(data) {
        logger.info(`👁️ Sentinel observed new life form (Project): ${data.type}`);
    }
}

export const SentinelService = new AntigravitySentinel();
