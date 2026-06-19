import { logger } from '../../../shared/logger.js';

class ContextPrunerService {
    /**
     * Prunes code content by stripping comments, collapsing blank lines,
     * and resolving unused whitespaces to optimize prompt context window usage.
     *
     * @param {string} codeContent - The raw JS/TS code content
     * @returns {Object} The pruned code content and metrics on size reduction
     */
    pruneCode(codeContent) {
        if (!codeContent) {
            return { prunedCode: '', originalSize: 0, prunedSize: 0, savingsPercent: 0 };
        }

        const originalSize = codeContent.length;

        // Regex to match block comments: /* ... */
        const blockCommentRegex = /\/\*[\s\S]*?\*\//g;
        // Regex to match single line comments: // ... (making sure we don't strip http:// or file:// protocol urls)
        const singleLineCommentRegex = /(?:^|[^\s:])\s*\/\/[^\n]*/g;

        let pruned = codeContent;

        // 1. Strip block comments
        pruned = pruned.replace(blockCommentRegex, '');

        // 2. Strip single line comments
        pruned = pruned.replace(singleLineCommentRegex, (match) => {
            // Preserve the leading character if it's not part of the comment
            const firstChar = match.charAt(0);
            return firstChar === '/' || firstChar === ' ' || firstChar === '\t' ? '' : firstChar;
        });

        // 3. Remove trailing whitespaces on lines
        pruned = pruned.split('\n')
            .map(line => line.trimEnd())
            .join('\n');

        // 4. Collapse consecutive empty lines (more than 1 empty line) into a single empty line
        pruned = pruned.replace(/\n\s*\n\s*\n/g, '\n\n');

        const prunedSize = pruned.length;
        const savingsPercent = originalSize > 0 
            ? parseFloat(((originalSize - prunedSize) / originalSize * 100).toFixed(2))
            : 0;

        logger.info(`✂️ ContextPruner: Pruned code. Size reduced from ${originalSize} to ${prunedSize} chars (${savingsPercent}% savings).`);

        return {
            prunedCode: pruned,
            originalSize,
            prunedSize,
            savingsPercent
        };
    }
}

export const contextPrunerService = new ContextPrunerService();
