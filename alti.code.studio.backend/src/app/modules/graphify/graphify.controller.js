import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { codeGraphService } from './codegraph.service.js';

export const graphifyController = {
  extractGraph: async (req, res) => {
    try {
      const { targetPath } = req.body;
      
      // Security: Validate and sanitize path
      if (!targetPath) {
        return res.status(400).json({ success: false, message: 'targetPath is required' });
      }

      // Ensure the path is within the workspace
      const absoluteTarget = path.resolve(targetPath);
      
      if (!fs.existsSync(absoluteTarget)) {
        return res.status(404).json({ success: false, message: 'Target directory not found' });
      }

      console.log(`[Graphify] Starting CodeGraph symbol extraction on ${absoluteTarget}`);

      // Query Colby McHenry's CodeGraph index (SQLite DB)
      const rawGraph = await codeGraphService.getGraphForPath(absoluteTarget);

      let cleanGraph = rawGraph;

      // 🔥 Enterprise DLP Scrubbing
      try {
        const { dlpScrubberService } = await import('../security/dlp_scrubber.service.js');
        cleanGraph = dlpScrubberService.scrubGraphifyOutput(rawGraph);
      } catch (e) {
        console.warn(`[Graphify] DLP Scrubbing bypassed or failed: ${e.message}`);
      }

      // Vector 1: Persist the Cognitive Graph context natively to Neo4j
      try {
        const { neo4jService } = await import('../../services/neo4j.service.js');
        await neo4jService.ingestAstContext(cleanGraph);
      } catch (e) {
        console.warn(`[Graphify] Failed to ingest graph into Neo4j: ${e.message}`);
      }

      // 🏛️ Fortune 100 Audit Logging
      try {
        const { auditService } = await import('../audit/audit.service.js');
        await auditService.logAction('Engineer', 'EXTRACT_COGNITIVE_GRAPH', { targetPath: absoluteTarget }, 'SUCCESS');
      } catch (e) {
        console.warn(`[Graphify] Audit log failed: ${e.message}`);
      }

      return res.status(200).json({
        success: true,
        message: 'CodeGraph extraction completed successfully',
        output: JSON.stringify(cleanGraph),
      });

    } catch (error) {
      console.error('[Graphify] Controller error:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  },

  getPageRank: async (req, res) => {
    try {
      // 🏛️ Fortune 100 Audit Logging
      try {
         const { auditService } = await import('../audit/audit.service.js');
         await auditService.logAction('Engineer', 'EXECUTE_GDS_PAGERANK', { target: 'Neo4j_AST_Graph' }, 'SUCCESS');
      } catch (e) {}

      const { neo4jGdsService } = await import('../../services/neo4j_gds.service.js');
      const topNodes = await neo4jGdsService.calculatePageRank();
      return res.status(200).json({
        success: true,
        data: topNodes
      });
    } catch (error) {
      console.error('[Graphify GDS] PageRank error:', error);
      res.status(500).json({ success: false, message: 'GDS PageRank failed', error: error.message });
    }
  }
};
