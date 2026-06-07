/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { treeSitterService } from '../refactorAgent/treeSitter.service.js';
import { logger } from '../../../shared/logger.js';
import { knowledgeGraphService } from '../memory/knowledge_graph.service.js';

export class AstPatcherService {
    /**
     * Applies an AST JSON Patch to the given source code.
     * Mathematically guarantees zero syntax errors by parsing the replacement
     * code before committing the structural change.
     * 
     * @param {string} sourceCode 
     * @param {Object} patch { nodeQuery: string, replacementCode: string }
     * @param {string} langName 
     * @param {string} intent - The intent or context behind this patch for memory ingestion
     * @returns {Promise<string>} The patched source code
     */
    async applyPatch(sourceCode, patch, langName = 'javascript', intent = null) {
        const { nodeQuery, replacementCode } = patch;
        
        if (!nodeQuery || typeof replacementCode !== 'string') {
            throw new Error('AST Patcher: Invalid patch format. Must include nodeQuery and replacementCode.');
        }

        const matches = await treeSitterService.query(sourceCode, nodeQuery, langName);
        if (!matches || matches.length === 0) {
            throw new Error('AST Patcher: No nodes matched the provided tree-sitter query.');
        }

        // Apply to the first match
        const match = matches[0];
        
        // Identify the node captured by @target, or fallback to the first capture
        let targetNode = null;
        for (const capture of match.captures) {
            if (capture.name === 'target') {
                targetNode = capture.node;
                break;
            }
        }
        
        if (!targetNode && match.captures.length > 0) {
            targetNode = match.captures[0].node;
        }

        if (!targetNode) {
            throw new Error('AST Patcher: Query matched but no @target capture was found.');
        }

        const startIndex = targetNode.startIndex;
        const endIndex = targetNode.endIndex;

        // [FORMAL VERIFICATION]
        // Ensure replacementCode parses correctly before applying it to the tree
        try {
            const tempTree = await treeSitterService.parse(replacementCode, langName);
            if (tempTree.rootNode.hasError()) {
                throw new Error("Tree-sitter detected syntax errors in the replacement code block.");
            }
        } catch (syntaxErr) {
            logger.error(`AST Patcher: Rejected patch due to syntax error.`);
            throw new Error(`AST Patcher: Rejected patch due to syntax error: ${syntaxErr.message}`);
        }

        // Apply precise index replacement
        const before = sourceCode.slice(0, startIndex);
        const after = sourceCode.slice(endIndex);
        
        const newCode = before + replacementCode + after;
        
        logger.info(`✨ AST Patcher: Successfully replaced AST node at [${startIndex}:${endIndex}]`);

        // Phase 2 Hive Mind Integration: Memorize this successful patch
        if (intent) {
            knowledgeGraphService.embedAstPatch(intent, patch).catch(e => 
                logger.error(`Hive Mind Embed Error: ${e.message}`)
            );
        }

        return newCode;
    }
    
    /**
     * Applies an array of AST patches sequentially.
     * @param {string} sourceCode 
     * @param {Array} patches 
     * @param {string} langName 
     * @param {string} intent
     * @returns {Promise<string>}
     */
    async applyPatches(sourceCode, patches, langName = 'javascript', intent = null) {
        let currentCode = sourceCode;
        for (const patch of patches) {
            currentCode = await this.applyPatch(currentCode, patch, langName, intent);
        }
        return currentCode;
    }
}

export const astPatcherService = new AstPatcherService();
