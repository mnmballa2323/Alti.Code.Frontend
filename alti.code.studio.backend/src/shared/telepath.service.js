/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from './logger.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';
import fs from 'fs/promises';
import path from 'path';

export class TelepathService {
    constructor() {
        this.name = 'TheTelepath';
        this.telemetryBuffer = [];
        this.ghostCachePath = path.join(process.cwd(), '.alti-ghost-cache');
        logger.info('👁️‍🗨️ TelepathService: Zero-Latency Cursor Sync & Prediction Engine online.');
    }

    /**
     * Ingests a continuous stream of keystrokes/lines from the IDE.
     * @param {string} currentFilePath The file the human is currently editing
     * @param {string} typedContent The exact raw string that was just typed/pasted
     */
    async ingestTelemetry(currentFilePath, typedContent) {
        // Collect into local moving buffer
        this.telemetryBuffer.push({
            timestamp: Date.now(),
            file: currentFilePath,
            content: typedContent
        });

        // Keep buffer small (last 10 interactions)
        if (this.telemetryBuffer.length > 10) {
            this.telemetryBuffer.shift();
        }

        // Trigger predictive analysis in the background without awaiting (non-blocking)
        this._predictAndStageBackgroundWorker(currentFilePath);
    }

    async _predictAndStageBackgroundWorker(activeFile) {
        // Debounce or aggregate logic would go here in production
        const contextString = this.telemetryBuffer.map(b => b.content).join('\n');

        const prompt = `You are a Prescient AI living in the developer's IDE IDE cursor.
        The developer is currently editing: [${activeFile}].
        Over the last 15 seconds, they have typed/pasted the following:
        ====
        ${contextString}
        ====
        
        Predict exactly what companion architectural file they will need NEXT, but haven't written yet.
        For example, if they imported Stripe, they need a Stripe Webhook Route. If they imported Firebase, they need a Firebase Config.
        Analyze the telemetry and generate the predicted companion file.

        Return your answer as a precise JSON object with exactly two keys:
        - "predicted_file_path": The relative path of the file they need next.
        - "predicted_code": The complete, production-ready code for that file.
        
        Do not wrap the JSON in markdown \`\`\`. Return raw JSON ONLY.`;

        try {
            let rawPrediction = await GeminiAiService.generateContent(prompt);
            rawPrediction = rawPrediction.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
            const predictionData = JSON.parse(rawPrediction);

            await this._stageGhostFile(predictionData.predicted_file_path, predictionData.predicted_code);
        } catch (error) {
            // Silently fail, it's a background prediction
        }
    }

    async _stageGhostFile(predictedPath, predictedCode) {
        const fullGhostPath = path.join(this.ghostCachePath, predictedPath);

        await fs.mkdir(path.dirname(fullGhostPath), { recursive: true });
        await fs.writeFile(fullGhostPath, predictedCode, 'utf8');

        logger.info(`👁️‍🗨️ TelepathService: Predictively generated and staged ghostly companion file at [${predictedPath}]`);
    }

    async clearBuffer() {
        this.telemetryBuffer = [];
        try {
            await fs.rm(this.ghostCachePath, { recursive: true, force: true });
        } catch {
            // Ignore if directory does not exist
        }
    }
}

export const telepathService = new TelepathService();
