import { prisma } from '../../../config/prisma.js';
import { azureSovereignCompatService } from '../ai/azureSovereignCompat.service.js';
import { logger } from '../../../shared/logger.js';

class SemanticCacheService {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    try {
      // Ensure the raw SemanticCache table exists
      await prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS "SemanticCache" (
                    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    "prompt" TEXT NOT NULL,
                    "response" TEXT NOT NULL,
                    "embedding" vector(768),
                    "createdAt" TIMESTAMP DEFAULT NOW()
                );
            `);
      // Create an index for vector search optimization using pgvector
      await prisma.$executeRawUnsafe(`
                CREATE INDEX IF NOT EXISTS idx_semantic_cache_embedding ON "SemanticCache" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
            `);
      this.isInitialized = true;
      logger.info(
        '🧠 [SemanticCache] pgvector Semantic Cache Layer initialized successfully.',
      );
    } catch (error) {
      logger.warn(
        `⚠️ [SemanticCache] Failed to initialize table. Semantic Caching disabled: ${error.message}`,
      );
    }
  }

  /**
   * Search the pgvector database for an existing query.
   * @param {string} prompt The full user prompt to evaluate
   * @param {number} threshold Cosine similarity threshold (0.98+ means nearly identical context)
   */
  async getCachedResponse(prompt, threshold = 0.98) {
    if (!this.isInitialized) await this.init();
    try {
      // Extract the 768-dim embeddings from Vertex AI
      const embedding = await azureSovereignCompatService.getEmbeddings(prompt);
      if (!embedding || embedding.length === 0) return null;

      const embeddingStr = `[${embedding.join(',')}]`;

      // <=> is the cosine distance operator in pgvector. Similarity = 1 - distance.
      const results = await prisma.$queryRawUnsafe(`
                SELECT "response", 1 - ("embedding" <=> '${embeddingStr}'::vector) as similarity
                FROM "SemanticCache"
                WHERE 1 - ("embedding" <=> '${embeddingStr}'::vector) >= ${threshold}
                ORDER BY "embedding" <=> '${embeddingStr}'::vector ASC
                LIMIT 1
            `);

      if (results && results.length > 0) {
        const simScore = (results[0].similarity * 100).toFixed(2);
        logger.info(
          `⚡ [SemanticCache] CACHE HIT! Detected ${simScore}% semantic similarity. Bypassing massive LLM execution latency.`,
        );
        return results[0].response;
      }
      return null;
    } catch (err) {
      logger.debug(`⚠️ [SemanticCache] Semantic search failed: ${err.message}`);
      return null;
    }
  }

  /**
   * Securely vectorize and store a successful execution result.
   */
  async setCachedResponse(prompt, response) {
    if (!this.isInitialized) await this.init();
    try {
      const embedding = await azureSovereignCompatService.getEmbeddings(prompt);
      if (!embedding || embedding.length === 0) return;

      const embeddingStr = `[${embedding.join(',')}]`;

      await prisma.$executeRawUnsafe(
        `
                INSERT INTO "SemanticCache" ("prompt", "response", "embedding")
                VALUES ($1, $2, '${embeddingStr}'::vector)
            `,
        prompt,
        response,
      );

      logger.info(
        '🧠 [SemanticCache] Intelligence permanently vectorized and locked into pgvector memory.',
      );
    } catch (err) {
      logger.debug(`⚠️ [SemanticCache] Cache store failed: ${err.message}`);
    }
  }
}

export const semanticCacheService = new SemanticCacheService();
