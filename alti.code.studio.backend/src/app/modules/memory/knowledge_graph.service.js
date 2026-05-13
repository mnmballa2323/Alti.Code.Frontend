/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { ChromaClient } from 'chromadb';
import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';

class KnowledgeGraphService {
    constructor() {
        // Defaults to local ChromaDB Docker container or hosted instance
        this.client = new ChromaClient({ path: process.env.CHROMA_URL || "http://localhost:8000" }); 
        this.collectionName = "ast_hive_memory";
        this.collection = null;
    }

    /**
     * Connects to the ChromaDB cluster and ensures the AST index exists.
     */
    async init() {
        try {
            logger.info('🧠 Hive Mind: Initializing ChromaDB Vector Knowledge Graph...');
            this.collection = await this.client.getOrCreateCollection({
                name: this.collectionName,
                metadata: { "description": "Persistent Swarm AST Patch Memory" }
            });
            logger.info('🧠 Hive Mind: Vector Knowledge Graph Connected & Synced.');
        } catch (err) {
            logger.warn(`⚠️ Hive Mind Initialization Failed (Is Chroma running?): ${err.message}`);
            // We fail gracefully. If Chroma isn't running, the Swarm just operates in "amnesia" mode 
            // relying on standard LLM generation instead of Vector RAG.
            this.collection = null; 
        }
    }

    /**
     * Embeds a successfully validated AST patch into the Vector Database.
     * @param {string} bugContext - The original bug or feature intent
     * @param {Object} patchData - The JSON structure of the applied patch
     */
    async embedAstPatch(bugContext, patchData) {
        if (!this.collection) return;

        const id = crypto.randomUUID();
        // The document text combines the intent and the exact patch structure
        const documentText = `INTENT: ${bugContext}\nPATCH: ${JSON.stringify(patchData)}`;

        try {
            logger.debug(`🧠 Hive Mind: Memorizing patch [${id}]...`);
            await this.collection.add({
                ids: [id],
                documents: [documentText],
                metadatas: [{ timestamp: Date.now(), type: 'ast_patch', intent: bugContext.substring(0, 50) }]
            });
            logger.info(`🧠 Hive Mind: Successfully committed patch [${id}] to Vector Memory.`);
        } catch (err) {
            logger.error(`❌ Hive Mind: Failed to embed patch: ${err.message}`);
        }
    }

    /**
     * Recalls an exact or highly similar patch from the Vector Database.
     * @param {string} currentBugContext 
     * @returns {Promise<string|null>} Historical patch document or null if no strong match.
     */
    async recallSimilarFix(currentBugContext) {
        if (!this.collection) return null;

        try {
            const results = await this.collection.query({
                queryTexts: [currentBugContext],
                nResults: 1 // Fetch only the most identical historical memory
            });

            // Distances usually range 0.0 to 1.0 depending on the distance metric.
            // A threshold of 0.2 indicates a very strong semantic match.
            const distance = results.distances?.[0]?.[0];
            if (distance !== undefined && distance < 0.25) {
                logger.info(`🧠 Hive Mind: PRE-COGNITIVE RECALL TRIGGERED! Found historical match (Distance: ${distance.toFixed(3)})`);
                return results.documents[0][0]; // Return the raw stored document
            }
            
            logger.debug(`🧠 Hive Mind: No strong historical memories found for current context. Proceeding to autonomous generation.`);
            return null;
        } catch (err) {
            logger.warn(`🧠 Hive Mind: Recall failed or timed out: ${err.message}`);
            return null;
        }
    }
}

export const knowledgeGraphService = new KnowledgeGraphService();
