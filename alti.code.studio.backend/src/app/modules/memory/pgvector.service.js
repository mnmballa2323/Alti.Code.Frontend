import prisma from '../../../config/prisma.js';
import { gcpSovereignCompatService } from '../ai/gcpSovereignCompat.service.js';
import { logger } from '../../../shared/logger.js';

class PgVectorService {
  /**
   * Chunk a code file using a sliding window approach for better semantic retention.
   * @param {string} codeContent
   * @returns {string[]}
   */
  chunkCode(codeContent) {
    const lines = codeContent.split('\n');
    const chunks = [];
    const windowSize = 50; // lines
    const overlap = 10;

    for (let i = 0; i < lines.length; i += windowSize - overlap) {
      const chunk = lines.slice(i, i + windowSize).join('\n');
      if (chunk.trim().length > 10) {
        chunks.push(chunk);
      }
    }
    return chunks;
  }

  /**
   * Ingests a code file into the GodMode AgentMemory using pgvector embeddings.
   * @param {string} userId
   * @param {string} agentId
   * @param {string} codeContent
   */
  async ingestCodeFile(userId, agentId, codeContent) {
    if (!userId || !agentId || !codeContent) {
      throw new Error('Missing required fields for GodMode ingestion.');
    }

    const chunks = this.chunkCode(codeContent);
    logger.info(
      `🧠 [GodMode] Chunked code file into ${chunks.length} segments.`,
    );

    let successCount = 0;

    for (const chunk of chunks) {
      try {
        // Get 768-dimensional embedding from Vertex AI
        const embedding =
          await gcpSovereignCompatService.getEmbeddings(chunk);
        const embeddingStr = `[${embedding.join(',')}]`;

        // Insert into Prisma's AgentMemory table using raw SQL
        await prisma.$executeRawUnsafe(
          `
                    INSERT INTO "AgentMemory" ("id", "userId", "agentId", "content", "embedding", "createdAt")
                    VALUES (gen_random_uuid(), '${userId}', '${agentId}', $1, '${embeddingStr}'::vector, NOW())
                `,
          chunk,
        );

        successCount++;
      } catch (err) {
        logger.error(`❌ [GodMode] Failed to ingest chunk: ${err.message}`);
      }
    }

    logger.info(
      `✅ [GodMode] Successfully ingested ${successCount}/${chunks.length} chunks into AgentMemory.`,
    );
    return successCount;
  }

  /**
   * Semantic code search using pgvector.
   * @param {string} query
   * @param {string} userId
   * @param {number} topK
   */
  async searchMemory(query, userId, topK = 5) {
    try {
      const embedding = await gcpSovereignCompatService.getEmbeddings(query);
      const embeddingStr = `[${embedding.join(',')}]`;

      // Query AgentMemory using cosine distance (<=>)
      const results = await prisma.$queryRawUnsafe(`
                SELECT "id", "agentId", "content", 1 - ("embedding" <=> '${embeddingStr}'::vector) as similarity
                FROM "AgentMemory"
                WHERE "userId" = '${userId}'
                ORDER BY "embedding" <=> '${embeddingStr}'::vector
                LIMIT ${topK}
            `);

      return results;
    } catch (err) {
      logger.error(`❌ [GodMode] Semantic search failed: ${err.message}`);
      return [];
    }
  }
}

export const pgvectorService = new PgVectorService();
