import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logger } from '../../../shared/logger.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CodeGraphService {
    constructor() {
        this.workspaceRoot = this.findWorkspaceRoot(__dirname);
        this.bundledNodePath = this.findBundledNode();
        logger.info(`🔷 [CodeGraphService] Initialized. Workspace: ${this.workspaceRoot}, Bundled Node: ${this.bundledNodePath}`);
    }

    /**
     * Traverses parent directories to locate the workspace root containing .codegraph
     */
    findWorkspaceRoot(startDir) {
        let current = path.resolve(startDir);
        while (current !== path.dirname(current)) {
            if (fs.existsSync(path.join(current, '.codegraph'))) {
                return current;
            }
            current = path.dirname(current);
        }
        // Fallback to standard 6 levels up from this file
        return path.resolve(__dirname, '../../../../../../');
    }

    /**
     * Dynamic platform-specific bundled Node binary locator
     */
    findBundledNode() {
        const target = `${process.platform}-${process.arch}`;
        // Resolve path to the optional platform-specific codegraph package
        const platformDir = path.join(this.workspaceRoot, `alti.code.studio.backend/node_modules/@colbymchenry/codegraph-${target}`);
        const nodeExecutable = process.platform === 'win32' ? 'node.exe' : 'node';
        const binPath = path.join(platformDir, nodeExecutable);
        
        if (fs.existsSync(binPath)) {
            return binPath;
        }

        // Check globally or top level package location
        const topPlatformDir = path.join(this.workspaceRoot, `node_modules/@colbymchenry/codegraph-${target}`);
        const topBinPath = path.join(topPlatformDir, nodeExecutable);
        if (fs.existsSync(topBinPath)) {
            return topBinPath;
        }

        logger.warn(`⚠️ [CodeGraphService] Bundled Node 24 not found for target ${target}. Falling back to system node.`);
        return 'node';
    }

    /**
     * Programmatically queries the local CodeGraph SQLite DB to retrieve file & symbol topology
     * @param {string} targetPath - Relative or absolute target path to filter symbols
     * @param {number} [limit=150] - Max file nodes to retrieve
     * @returns {Promise<Object>} Formatted AST graph { nodes, links } matching visual contract
     */
    async getGraphForPath(targetPath, limit = 150) {
        try {
            // 1. Resolve targetPath to an absolute path
            const absoluteTarget = path.resolve(targetPath);
            
            // 2. Map absoluteTarget to a relative path from the workspace root
            let relativeTarget = path.relative(this.workspaceRoot, absoluteTarget);
            
            // Normalize slashes for SQLite compatibility (always forward slash on unix/index paths)
            relativeTarget = relativeTarget.replace(/\\/g, '/');

            // If empty (e.g. queried the root), make sure it is empty or has a wildcard
            if (relativeTarget === '.' || relativeTarget === './') {
                relativeTarget = '';
            }

            logger.info(`🔷 [CodeGraphService] Querying graph for relative target: "${relativeTarget}" (limit: ${limit})`);

            // 3. Spawn the optimized query_runner.js using the bundled Node 24 binary synchronously
            const runnerScript = path.join(__dirname, 'query_runner.js');
            const result = spawnSync(
                this.bundledNodePath, 
                [runnerScript, relativeTarget, limit.toString()],
                { 
                    cwd: path.join(this.workspaceRoot, 'alti.code.studio.backend'),
                    encoding: 'utf-8',
                    maxBuffer: 1024 * 1024 * 10 // 10MB
                }
            );

            if (result.error) {
                throw result.error;
            }

            const stdout = result.stdout || '';
            const stderr = result.stderr || '';

            if (stderr && stderr.trim().length > 0) {
                logger.warn(`⚠️ [CodeGraphService] query_runner warnings: ${stderr}`);
            }

            // 4. Parse the formatted JSON response
            const parsedGraph = JSON.parse(stdout.trim());
            logger.info(`✅ [CodeGraphService] Retrieved ${parsedGraph.nodes.length} nodes and ${parsedGraph.links.length} edges successfully.`);
            
            return parsedGraph;

        } catch (error) {
            logger.error(`❌ [CodeGraphService] Graph extraction failed: ${error.message}`);
            // Return safe fallback empty graph structure instead of crashing
            return { nodes: [], links: [] };
        }
    }
}

export const codeGraphService = new CodeGraphService();
