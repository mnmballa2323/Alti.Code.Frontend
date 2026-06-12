import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class MimoCheckpointService {
    constructor() {
        this.checkpointPath = path.join(process.cwd(), 'docs', 'checkpoint.md');
    }

    /**
     * Checks if the accumulated context size exceeds thresholds,
     * and compacts it by spawning a writer subagent.
     * 
     * @param {Array<string>} contextArray - The current accumulated context strings.
     * @param {number} thresholdChars - Character threshold to trigger compaction. Default: 150,000 (~30k tokens)
     * @returns {Promise<Array<string>>} - The compacted context array.
     */
    async checkAndCompact(contextArray, thresholdChars = 150000) {
        const totalSize = contextArray.join('\n').length;
        logger.info(`[MimoCheckpoint] Current context size: ${totalSize} chars. Threshold: ${thresholdChars} chars.`);

        if (totalSize < thresholdChars) {
            return contextArray;
        }

        logger.warn(`[MimoCheckpoint] ⚠️ Context size exceeded threshold! Running out-of-band writer subagent for compaction...`);

        try {
            const prompt = `
You are the out-of-band Memory Checkpoint Writer subagent for Alti.Code.Studio.
The current agent execution context has reached limit thresholds. You must compact this history.

Analyze the current context details (which contain parent agent tasks, results, tool outputs, and telemetry logs)
and compile a high-fidelity Milestone Checkpoint containing:
1. **Milestones Achieved**: What has been successfully completed.
2. **Current State**: Summary of modified files, configuration parameters, and verified facts.
3. **Pending Tasks**: What remains to be done.

Output the checkpoint in clean, professional markdown format. Do not wrap the output in markdown code blocks like \`\`\`markdown, just return the raw markdown directly.

=== CURRENT LARGE CONTEXT ===
${contextArray.join('\n\n')}
`;

            const checkpointMarkdown = await GeminiAiService.generateContent(prompt);
            const cleanedCheckpoint = checkpointMarkdown.trim().replace(/^```markdown\n|```$/g, '');

            // Ensure destination directory exists and write checkpoint file
            await fs.mkdir(path.dirname(this.checkpointPath), { recursive: true });
            await fs.writeFile(this.checkpointPath, cleanedCheckpoint, 'utf8');
            logger.info(`[MimoCheckpoint] ✅ Milestone checkpoint written to: ${this.checkpointPath}`);

            // Compact context array: replace all historical entries with the new checkpoint reference
            const compactedContext = [
                `[MIMO_ACTIVE_CHECKPOINT] The context has been compacted due to token budget limits. Refer to the active milestone checkpoint below:\n\n${cleanedCheckpoint}`
            ];

            return compactedContext;

        } catch (error) {
            logger.error(`[MimoCheckpoint] Compaction failed: ${error.message}. Returning original context.`);
            return contextArray;
        }
    }
}

export const mimoCheckpointService = new MimoCheckpointService();
export default mimoCheckpointService;
