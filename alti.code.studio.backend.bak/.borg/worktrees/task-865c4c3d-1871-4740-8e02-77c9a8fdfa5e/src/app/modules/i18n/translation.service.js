/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class TranslationService {
    constructor() {
        // Simple in-memory cache to save tokens/latency
        // In production, use Redis
        this.cache = new Map();
    }

    /**
     * Translate text to target language
     * @param {string} text 
     * @param {string} targetLang e.g. 'es', 'fr', 'ja'
     * @returns {Promise<string>}
     */
    async translate(text, targetLang) {
        if (!text || !targetLang || targetLang === 'en') return text;

        const cacheKey = `${targetLang}:${text}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            logger.info(`🌐 Translating to ${targetLang}: "${text.substring(0, 50)}..."`);

            const prompt = `
                Translate the following software interface text to ${targetLang}. 
                Maintain technical terms (like "metrics", "logs", "deploy") if appropriate for the target technical audience.
                Do not add explanations or markdown. Just return the translated text.
                
                Text: "${text}"
            `;

            const translation = await GeminiAiService.generateContent(prompt);
            const cleaned = translation.trim().replace(/^"|"$/g, ''); // Remove quotes if AI adds them

            this.cache.set(cacheKey, cleaned);
            return cleaned;

        } catch (error) {
            logger.warn(`❌ Translation failed: ${error.message}. Returning original text.`);
            return text;
        }
    }
}

export const translationService = new TranslationService();
