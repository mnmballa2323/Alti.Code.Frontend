import { logger } from '../../../shared/logger.js';
import { aiProvider } from '../ai/ai.provider.js';

class GitConflictResolverService {
  /**
   * Resolves git merge conflicts in a file contents block using LLM synthesis.
   * @param {string} fileContent - The raw file content containing conflict markers
   * @param {string} filename - The name/path of the file being resolved
   * @returns {Promise<string>} The resolved file content with conflict markers replaced
   */
  async resolveConflicts(fileContent, filename) {
    if (!fileContent) return '';

    // Check if conflict markers exist
    if (
      !fileContent.includes('<<<<<<<') ||
      !fileContent.includes('=======') ||
      !fileContent.includes('>>>>>>>')
    ) {
      logger.debug(
        `GitConflictResolver: No conflict markers found in [${filename}]. Skipping.`,
      );
      return fileContent;
    }

    logger.info(
      `⚔️ GitConflictResolver: Resolving merge conflicts for [${filename}]`,
    );

    // Find conflict chunks
    const conflictRegex =
      /<<<<<<<[^=======]*\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>>[^\n]*/g;
    let resolved = fileContent;
    let match;

    // Reset regex index
    conflictRegex.lastIndex = 0;

    while ((match = conflictRegex.exec(fileContent)) !== null) {
      const fullMarkerBlock = match[0];
      const ours = match[1];
      const theirs = match[2];

      logger.info(
        `GitConflictResolver: Found conflict block in [${filename}]. Running AI merge...`,
      );

      const prompt = `You are an expert Git Conflict Resolver Agent.
Your task is to merge the following Git conflict block cleanly.
Filename: ${filename}

Ours (Current Branch):
${ours}

Theirs (Incoming Branch):
${theirs}

Merge the changes logically, preserving functionality from both sides where they do not conflict, resolving any syntactic overlap, and ensuring valid code syntax.
Return ONLY the resolved code block. Do NOT include markdown fences, explaining text, or git markers.`;

      try {
        const response = await aiProvider.reason(prompt);
        const cleanMerge = response
          .trim()
          .replace(/^```[a-zA-Z]*\n/, '')
          .replace(/\n```$/, '');
        resolved = resolved.replace(fullMarkerBlock, cleanMerge);
        logger.info(
          `GitConflictResolver: Successfully merged block in [${filename}]`,
        );
      } catch (e) {
        logger.error(
          `GitConflictResolver: Failed to merge block in [${filename}]. Falling back to ours.`,
          e,
        );
        resolved = resolved.replace(fullMarkerBlock, ours); // fallback to ours to prevent compile error
      }
    }

    return resolved;
  }
}

export const gitConflictResolverService = new GitConflictResolverService();
