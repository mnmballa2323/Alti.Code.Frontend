import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';
import { logger } from '../../../shared/logger.js';
import { sentinelService } from '../security/sentinel.service.js';

/**
 * Google Diff-Match-Patch (Apache 2.0) Service.
 * Provides highly robust, character-level textual diffing and fuzzy-patching.
 * Used to cryptographically audit the exact character mutations performed by the Gemini Swarm.
 */
class GoogleDiffPatchService {
    constructor() {
        this.dmp = new DiffMatchPatch();
    }

    /**
     * Computes the semantic diff between two strings and generates a standardized patch.
     * @param {string} oldCode - The original file content
     * @param {string} newCode - The AI-generated file content
     * @returns {string} The computed patch in text format
     */
    computePatch(oldCode, newCode) {
        const diffs = this.dmp.diff_main(oldCode, newCode);
        // Semantic cleanup groups tiny character edits into readable logical blocks
        this.dmp.diff_cleanupSemantic(diffs);
        const patches = this.dmp.patch_make(oldCode, diffs);
        return this.dmp.patch_toText(patches);
    }

    /**
     * Applies an AI-generated patch to a source file using robust fuzzy matching.
     */
    applyPatch(oldCode, patchText) {
        const patches = this.dmp.patch_fromText(patchText);
        const [newCode, results] = this.dmp.patch_apply(patches, oldCode);
        
        const success = results.every(r => r === true);
        if (!success) {
            logger.warn('⚠️ [DiffMatchPatch] Some AI patch hunks failed to apply cleanly due to source drift.');
            // Report failed patch application to Sentinel
            sentinelService.reportEvent('AI_PATCH_FAILURE', 'MEDIUM', { patchText });
        }

        return { newCode, success };
    }
}

export const patchService = new GoogleDiffPatchService();
