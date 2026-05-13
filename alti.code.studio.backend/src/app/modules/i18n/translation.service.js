/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

/** Maximum number of entries kept in the translation cache. */
const CACHE_MAX_SIZE = 512;

class TranslationService {
    constructor() {
        /** @type {Map<string, string>} LRU-style bounded translation cache */
        this._cache = new Map();
    }

    /**
     * Translate text to target language using Gemini AI.
     * Results are cached to save tokens and reduce latency.
     * Falls back to the original text on failure.
     *
     * @param {string} text       - Text to translate
     * @param {string} targetLang - BCP-47 language code, e.g. 'es', 'fr', 'ja'
     * @returns {Promise<string>}
     */
    async translate(text, targetLang) {
        if (!text || !targetLang || targetLang === 'en') return text;

        // Use a hash as the cache key so very long text doesn't create huge Map keys
        const hash = crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
        const cacheKey = `${targetLang}:${hash}`;

        const cached = this._cache.get(cacheKey);
        if (cached !== undefined) {
            logger.debug(`🌐 Translation cache HIT for [${targetLang}] "${text.substring(0, 30)}…"`);
            return cached;
        }

        try {
            logger.info(`🌐 Translating to [${targetLang}]: "${text.substring(0, 50)}…"`);

            const prompt = `
                Translate the following software interface text to ${targetLang}.
                Maintain technical terms (like "metrics", "logs", "deploy") if appropriate for the target technical audience.
                Do not add explanations or markdown. Just return the translated text.
                
                Text: "${text}"
            `;

            const translation = await GeminiAiService.generateContent(prompt);
            const cleaned = translation.trim().replace(/^"|"$/g, '');

            // Evict the oldest entry when cap is reached (LRU-style insertion order)
            if (this._cache.size >= CACHE_MAX_SIZE) {
                this._cache.delete(this._cache.keys().next().value);
            }
            this._cache.set(cacheKey, cleaned);

            return cleaned;

        } catch (error) {
            logger.warn(`❌ Translation failed for [${targetLang}]: ${error.message}. Returning original.`);
            return text;
        }
    }

    /**
     * Translate an object's string values to the target language.
     * Non-string values are left untouched.
     *
     * @param {object} obj
     * @param {string} targetLang
     * @returns {Promise<object>}
     */
    async translateObject(obj, targetLang) {
        if (!obj || typeof obj !== 'object' || targetLang === 'en') return obj;
        const translated = {};
        await Promise.all(
            Object.entries(obj).map(async ([key, value]) => {
                translated[key] = typeof value === 'string'
                    ? await this.translate(value, targetLang)
                    : value;
            })
        );
        return translated;
    }

    /** Current number of cached translations. */
    get cacheSize() {
        return this._cache.size;
    }

    /** Clear all cached translations. */
    clearCache() {
        this._cache.clear();
        logger.info('🌐 Translation cache cleared.');
    }

    /**
     * Translate multiple strings in parallel (up to 4 concurrent API calls).
     * @param {string[]} texts
     * @param {string} targetLang
     * @returns {Promise<string[]>}
     */
    async translateBatch(texts, targetLang) {
        if (!Array.isArray(texts) || texts.length === 0) return [];
        const CONCURRENCY = 4;
        const results = new Array(texts.length);
        for (let i = 0; i < texts.length; i += CONCURRENCY) {
            const batch = texts.slice(i, i + CONCURRENCY);
            const translated = await Promise.all(batch.map(t => this.translate(t, targetLang)));
            translated.forEach((t, j) => { results[i + j] = t; });
        }
        return results;
    }
}

export const translationService = new TranslationService();

