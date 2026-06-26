import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';

class PromptCacheGatewayService {
  constructor() {
    this.cacheRegistry = new Set();
    this.stats = {
      hits: 0,
      misses: 0,
    };
  }

  /**
   * Optimizes a prompt payload by sorting and structuring static block contexts to maximize cache hits.
   * Computes hashes for static elements and reports hit/miss statistics.
   *
   * @param {string} systemInstruction - Standard system instructions or preambles
   * @param {Array<Object>} fileContexts - [{ path: string, content: string }]
   * @param {string} userQuery - The volatile user request
   * @returns {Object} The optimized prompt details, final text, and cache status
   */
  optimizePrompt(systemInstruction, fileContexts = [], userQuery) {
    logger.info('🧠 PromptCacheGateway: Optimizing prompt payload structure');

    // 1. Sort files alphabetically by path to maintain structural consistency
    const sortedFiles = [...fileContexts].sort((a, b) =>
      a.path.localeCompare(b.path),
    );

    // 2. Build consistent, structured sections
    let filesBlock = '';
    for (const file of sortedFiles) {
      filesBlock += `\n--- FILE: ${file.path} ---\n${file.content}\n`;
    }

    // 3. Compute structural hash of the static context (system instruction + files context)
    const staticPayload = systemInstruction + '\n' + filesBlock;
    const staticHash = crypto
      .createHash('sha256')
      .update(staticPayload)
      .digest('hex');

    let cacheHit = false;

    if (this.cacheRegistry.has(staticHash)) {
      this.stats.hits++;
      cacheHit = true;
      logger.info('🧠 PromptCacheGateway: Prompt cache HIT registered.');
    } else {
      this.stats.misses++;
      this.cacheRegistry.add(staticHash);
      logger.info(
        '🧠 PromptCacheGateway: Prompt cache MISS registered. Static payload cached.',
      );
    }

    // Assemble the final prompt payload
    const finalPrompt = `System: ${systemInstruction}\nContext:${filesBlock}\nUser Request: ${userQuery}`;

    return {
      finalPrompt,
      staticHash,
      cacheHit,
      stats: { ...this.stats },
    };
  }

  getStats() {
    return { ...this.stats };
  }

  clearStats() {
    this.cacheRegistry.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    logger.info('🧠 PromptCacheGateway: Stats and cache registry cleared.');
  }
}

export const promptCacheGatewayService = new PromptCacheGatewayService();
