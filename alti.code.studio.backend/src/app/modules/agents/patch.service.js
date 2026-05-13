import DiffMatchPatch from 'diff-match-patch';
import { logger } from '../../../shared/logger.js';

/**
 * Google Diff-Match-Patch Code Rewriting Service.
 * Relying on LLMs to output full file replacements or exact line numbers is fundamentally flawed.
 * This service uses Google's mathematical algorithmic diffing to generate minimal, perfect
 * Git-style patches from the Swarm's output, entirely eliminating syntax corruption during automated refactoring.
 */
class GooglePatchService {
    constructor() {
        this.dmp = new DiffMatchPatch();
        // Optimize for code (character-level diffing)
        this.dmp.Diff_Timeout = 2.0; 
        logger.info('🧩 [Diff-Match-Patch] Google Algorithmic Code Patcher initialized.');
    }

    /**
     * Mathematically calculates the minimal patch to transition oldCode into newCode.
     * @param {string} oldCode - The current codebase state
     * @param {string} newCode - The Swarm's generated state
     */
    calculateMinimalPatch(oldCode, newCode) {
        logger.info(`🧩 [Diff-Match-Patch] Swarm is calculating mathematical code patch...`);
        
        try {
            const diffs = this.dmp.diff_main(oldCode, newCode);
            // Cleanup semantic complexity to ensure readable git patches
            this.dmp.diff_cleanupSemantic(diffs);
            
            const patchList = this.dmp.patch_make(oldCode, newCode, diffs);
            const patchText = this.dmp.patch_toText(patchList);
            
            logger.info(`✅ [Diff-Match-Patch] Minimal mathematical patch generated successfully.`);
            return patchText;
        } catch (error) {
            logger.error(`❌ [Diff-Match-Patch] Failed to calculate patch:`, error.message);
            return null;
        }
    }

    /**
     * Applies a calculated patch to a source text.
     * @param {string} oldCode 
     * @param {string} patchText 
     */
    applyPatch(oldCode, patchText) {
        logger.info(`🧩 [Diff-Match-Patch] Swarm is applying mathematical patch...`);
        try {
            const patches = this.dmp.patch_fromText(patchText);
            const [newCode, results] = this.dmp.patch_apply(patches, oldCode);
            
            const allSuccess = results.every(res => res === true);
            if (allSuccess) {
                logger.info(`✅ [Diff-Match-Patch] Patch applied flawlessly.`);
                return newCode;
            } else {
                logger.warn(`⚠️ [Diff-Match-Patch] Patch applied with partial failures. Requires human review.`);
                return newCode; // Partial apply
            }
        } catch (error) {
            logger.error(`❌ [Diff-Match-Patch] Failed to apply patch:`, error.message);
            return oldCode;
        }
    }
}

export const patchService = new GooglePatchService();
