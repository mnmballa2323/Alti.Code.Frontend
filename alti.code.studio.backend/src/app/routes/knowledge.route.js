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
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// PHASE 9: GOD-TIER ACTIVE RAG WEBHOOKS
// ============================================================================

router.post('/webhook/pr-review', async (req, res) => {
    try {
        const { gitDiff } = req.body;
        if (!gitDiff) return res.status(400).json({ error: "gitDiff is required" });
        const review = await knowledgeRagService.autonomousCodeReview(gitDiff);
        res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/webhook/crash-runbook', async (req, res) => {
    try {
        const { crashLog } = req.body;
        if (!crashLog) return res.status(400).json({ error: "crashLog is required" });
        const runbook = await knowledgeRagService.generateIntelligentRunbook(crashLog);
        res.status(200).json(runbook);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/webhook/self-heal', async (req, res) => {
    try {
        const { mergeDiff } = req.body;
        if (!mergeDiff) return res.status(400).json({ error: "mergeDiff is required" });
        const healingResult = await knowledgeRagService.selfHealDocumentation(mergeDiff);
        res.status(200).json(healingResult);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
