import express from 'express';
import { knowledgeRagService } from '../modules/knowledge/knowledge.rag.service.js';
import { logger } from '../../../shared/logger.js';

const router = express.Router();

/**
 * Ingests a new document via AWS Bedrock (Claude Opus + Titan)
 */
router.post('/ingest', async (req, res) => {
    try {
        const { documentText, documentName } = req.body;
        if (!documentText || !documentName) {
            return res.status(400).json({ success: false, error: "Missing document content or name." });
        }
        
        const result = await knowledgeRagService.ingestDocument(documentText, documentName);
        res.status(200).json(result);
    } catch (error) {
        logger.error(`[KnowledgeRoute] Ingestion Error:`, error);
        res.status(500).json({ success: false, error: 'Failed to ingest document.' });
    }
});

/**
 * Queries the Tri-Cloud RAG via Vertex + Azure
 */
router.post('/query', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, error: "Prompt is required." });
        }

        const answer = await knowledgeRagService.queryKnowledgeBase(prompt);
        res.status(200).json({ success: true, answer });
    } catch (error) {
        logger.error(`[KnowledgeRoute] Query Error:`, error);
        res.status(500).json({ success: false, error: 'Failed to query Knowledge Base.' });
    }
});

export default router;
