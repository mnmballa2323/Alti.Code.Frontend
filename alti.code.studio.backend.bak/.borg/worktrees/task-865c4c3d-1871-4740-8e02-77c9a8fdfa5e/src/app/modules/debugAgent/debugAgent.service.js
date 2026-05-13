/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

const analyzeError = async (errorLog, stackTrace, userId = 'system', sessionId = 'debug-session') => {
    logger.info(`Starting debug analysis for error`);

    const prompt = `
    You are a Senior Debugging Expert.
    Analyze the following error and stack trace.
    
    Error: "${errorLog}"
    
    Stack Trace:
    \`\`\`
    ${stackTrace}
    \`\`\`
    
    Output Requirements:
    Provide a JSON object with the following fields:
    1. "analysis": A brief explanation of the root cause.
    2. "suggested_fix": A concrete code change or action to fix the issue.
    3. "confidence_score": A number between 0 and 1.
    
    Return ONLY valid JSON.
    `;

    try {
        const aiResponse = await GeminiAiService.geminiService(sessionId, prompt, userId, 'json');

        let result;
        try {
            // Clean markdown code blocks if present
            const cleanJson = aiResponse.reply.replace(/^```json\n/, '').replace(/\n```$/, '');
            result = JSON.parse(cleanJson);
        } catch (e) {
            logger.warn('Failed to parse AI debug response as JSON, using raw text', e);
            result = {
                analysis: aiResponse.reply,
                suggested_fix: 'See analysis',
                confidence_score: 0.5
            };
        }

        return {
            error: errorLog,
            analysis: result.analysis,
            suggested_fix: result.suggested_fix,
            confidence_score: result.confidence_score,
        };
    } catch (error) {
        logger.error('Debug analysis failed', error);
        throw error;
    }
};

export const DebugAgentService = {
    analyzeError,
};
