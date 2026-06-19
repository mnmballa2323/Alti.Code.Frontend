import { logger } from '../../../shared/logger.js';
import { cacheService } from './cache.service.js';
import { aiProvider } from '../ai/ai.provider.js';

class ContextCompactionService {
    /**
     * Semantic compactor to keep LLM context windows optimal.
     * Summarizes long transcripts and caches them.
     *
     * @param {string} contextId - Unique identifier for the context (e.g. sprint ID)
     * @param {string} rawText - Long token-heavy text to compact
     * @param {number} threshold - Character threshold to trigger compaction
     * @returns {Promise<string>} The compacted summary or raw text if below threshold
     */
    async compactContext(contextId, rawText, threshold = 8000) {
        if (!rawText) return '';
        
        if (rawText.length < threshold) {
            logger.debug(`ContextCompaction: Text length (${rawText.length}) below threshold (${threshold}). Skipping compaction.`);
            return rawText;
        }

        logger.info(`🔄 ContextCompaction: Compacting token-heavy context for [${contextId}] (${rawText.length} chars)`);

        // Check cache first
        const cacheKey = `compaction:${contextId}`;
        await cacheService.init();
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            logger.info(`ContextCompaction: Cache HIT for [${contextId}]`);
            return cached;
        }

        const prompt = `You are a context compaction engine. Summarize the following execution trace or conversation history semantically.
Keep key decisions, filenames, modified lines, and final outcomes. Output must be a bulleted markdown block no longer than 400 words.

Raw Text:
${rawText}`;

        try {
            const compacted = await aiProvider.reason(prompt);
            await cacheService.set(cacheKey, compacted, 7200); // cache for 2 hours
            logger.info(`🔄 ContextCompaction: Successfully compacted context. Size reduced from ${rawText.length} to ${compacted.length} chars.`);
            return compacted;
        } catch (e) {
            logger.warn(`ContextCompaction: LLM compaction failed. Falling back to truncation. (${e.message})`);
            const fallback = rawText.slice(0, threshold) + '\n\n[TRUNCATED DUE TO CONTEXT SIZE]';
            return fallback;
        }
    }

    async getCompactedContext(contextId) {
        await cacheService.init();
        return await cacheService.get(`compaction:${contextId}`);
    }
}

export const contextCompactionService = new ContextCompactionService();
