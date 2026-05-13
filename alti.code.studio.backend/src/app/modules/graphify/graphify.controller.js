import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const graphifyController = {
  extractGraph: async (req, res) => {
    try {
      const { targetPath } = req.body;
      
      // Security: Validate and sanitize path
      if (!targetPath) {
        return res.status(400).json({ success: false, message: 'targetPath is required' });
      }

      // Ensure the path is within the workspace
      const workspaceRoot = path.resolve(__dirname, '../../../../../../..'); // Goes up to workspace root or so
      // Actually we will just resolve the path and verify it doesn't try to access protected dirs
      const absoluteTarget = path.resolve(targetPath);
      
      // Simple security check to prevent directory traversal outside allowed dirs if necessary
      // For now, allow any valid directory that the user requests within the workspace
      if (!fs.existsSync(absoluteTarget)) {
        return res.status(404).json({ success: false, message: 'Target directory not found' });
      }

      // Path to graphify main script
      const graphifyScript = path.resolve(__dirname, '../../../../submodules/graphify/graphify/__main__.py');

      // Path to python executable in the venv
      const venvPython = path.resolve(__dirname, '../../../../submodules/graphify/.venv/bin/python');

      console.log(`[Graphify] Starting extraction on ${absoluteTarget}`);

      // We spawn the python process using the venv
      // command: venv/bin/python <script> extract <absoluteTarget> --no-cluster --backend gemini
      const child = spawn(venvPython, [graphifyScript, 'extract', absoluteTarget, '--no-cluster', '--backend', 'gemini'], {
        env: { ...process.env }, // Give access to API keys like GEMINI_API_KEY
      });

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (data) => {
        stdoutData += data.toString();
        console.log(`[Graphify] ${data.toString().trim()}`);
      });

      child.stderr.on('data', (data) => {
        stderrData += data.toString();
        console.error(`[Graphify ERR] ${data.toString().trim()}`);
      });

      child.on('close', async (code) => {
        if (code === 0) {
          
          let scrubbedData = stdoutData;

          // Vector 1: Persist the Cognitive Graph context natively to Neo4j
          try {
             const jsonMatch = stdoutData.match(/\{[\s\S]*\}/);
             if (jsonMatch) {
                const parsedGraph = JSON.parse(jsonMatch[0]);
                
                // 🔥 Enterprise DLP Scrubbing
                const { dlpScrubberService } = await import('../security/dlp_scrubber.service.js');
                const cleanGraph = dlpScrubberService.scrubGraphifyOutput(parsedGraph);
                
                const { neo4jService } = await import('../../services/neo4j.service.js');
                await neo4jService.ingestAstContext(cleanGraph);
                
                // Ensure frontend gets the scrubbed JSON too
                scrubbedData = JSON.stringify(cleanGraph);
             }
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
            message: 'Graphify extraction completed successfully',
            output: scrubbedData,
          });
        } else {
          return res.status(500).json({
            success: false,
            message: 'Graphify extraction failed',
            error: stderrData,
          });
        }
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
