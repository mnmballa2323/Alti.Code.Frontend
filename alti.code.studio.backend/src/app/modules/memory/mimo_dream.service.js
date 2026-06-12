import fs from 'fs/promises';
import path from 'path';
import { agentMemoryService } from './agentmemory.service.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class MimoDreamService {
    constructor() {
        this.memoryMdPath = path.join(process.cwd(), 'docs', 'MEMORY.md');
    }

    /**
     * Periodic/triggerable memory compaction and self-evolution.
     * Consolidates episodic memories into long-term system rules.
     * 
     * @param {string} project - The project to compile memory for.
     */
    async dream(project = 'alti-code-studio') {
        logger.info(`[MimoDream] 🌙 Starting self-evolution/dream cycle for project: ${project}...`);
        
        try {
            // 1. Retrieve raw recent observations and decisions
            if (!agentMemoryService.isReady) {
                logger.warn('[MimoDream] ⚠️ agentmemory service is offline. Using local fallback.');
            }

            const searchResults = agentMemoryService.isReady
                ? await agentMemoryService.smartSearch({ query: 'architectural rules patterns guidelines decisions', project, limit: 30 })
                : { results: [] };

            const memories = (searchResults?.results || []).map(r => r.content || r.text || '');
            if (memories.length === 0) {
                logger.info('[MimoDream] 😴 No new memories found to consolidate. Dream cycle finished.');
                return { success: true, changes: 0, verifiedPaths: [] };
            }

            logger.info(`[MimoDream] Found ${memories.length} recent episodic memories for processing.`);

            // 2. Path and Fact Verification
            const { verifiedMemories, verifiedPaths } = await this.verifyFilePathsAndFacts(memories);

            // 3. Read existing MEMORY.md
            let existingMemoryContent = '';
            try {
                existingMemoryContent = await fs.readFile(this.memoryMdPath, 'utf8');
            } catch {
                logger.warn('[MimoDream] docs/MEMORY.md not found. A new one will be created.');
            }

            // 4. Synthesize & Deduplicate via LLM
            const newMemoryProfile = await this.synthesizeAndDeduplicate(existingMemoryContent, verifiedMemories);

            // 5. Update docs/MEMORY.md
            const docsDir = path.dirname(this.memoryMdPath);
            await fs.mkdir(docsDir, { recursive: true });
            await fs.writeFile(this.memoryMdPath, newMemoryProfile, 'utf8');

            logger.info('[MimoDream] ✅ docs/MEMORY.md successfully updated with consolidated insights.');
            return {
                success: true,
                changes: memories.length,
                verifiedPaths
            };

        } catch (error) {
            logger.error(`[MimoDream] ❌ Self-evolution cycle failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Cross-reference memories with the live codebase filesystem to verify they are still valid.
     */
    async verifyFilePathsAndFacts(memories) {
        const verifiedMemories = [];
        const verifiedPaths = [];

        for (const memory of memories) {
            // Regex to extract absolute or relative paths from memory texts
            const pathRegex = /(?:[a-zA-Z]:)?[/\\a-zA-Z0-9_\-.]+\.[a-zA-Z0-9_\-]+/g;
            const matches = memory.match(pathRegex) || [];
            let isValid = true;

            for (const filePath of matches) {
                // Ignore general extensions/types or system paths
                if (filePath.endsWith('.js') || filePath.endsWith('.yaml') || filePath.endsWith('.json') || filePath.endsWith('.md')) {
                    // Try to see if it is a real file inside our workspace
                    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
                    try {
                        await fs.stat(absolutePath);
                        if (!verifiedPaths.includes(filePath)) {
                            verifiedPaths.push(filePath);
                        }
                    } catch {
                        // File does not exist anymore. Flag the fact as outdated
                        logger.debug(`[MimoDream] ⚠️ Outdated path reference found in memory: ${filePath}. Skipping memory.`);
                        isValid = false;
                        break;
                    }
                }
            }

            if (isValid) {
                verifiedMemories.push(memory);
            }
        }

        return { verifiedMemories, verifiedPaths };
    }

    /**
     * Coalesce recent memories with existing MEMORY.md, deduplicating via LLM.
     */
    async synthesizeAndDeduplicate(existingContent, recentMemories) {
        const prompt = `
You are the active Memory Consolidation agent ("The Dreamer") for Alti.Code.Studio.
Your task is to merge recent episodic memories and architectural decisions into the existing docs/MEMORY.md file.

Rules:
1. De-duplicate: If a recent memory covers information already in MEMORY.md, merge or discard the duplicate.
2. Group: Organize the insights under appropriate headers (e.g. Architectural Patterns, Known Issues / Technical Debt, Submodule References).
3. Do not lose existing critical rules, unless they contradict newer facts.
4. Output ONLY the complete updated Markdown content of the MEMORY.md file. Do not include markdown code block formatting (such as \`\`\`markdown) in your response, just return the raw markdown text directly.

=== EXISTING docs/MEMORY.md ===
${existingContent}

=== NEW RECENT MEMORIES ===
${recentMemories.map((m, idx) => `${idx + 1}. ${m}`).join('\n')}

=== UPDATED docs/MEMORY.md ===
`;

        try {
            const response = await GeminiAiService.generateContent(prompt);
            return response.trim().replace(/^```markdown\n|```$/g, '');
        } catch (error) {
            logger.error(`[MimoDream] LLM synthesis failed: ${error.message}. Falling back to appending.`);
            // Fallback: simple text append
            return `${existingContent}\n\n## 🧠 Consolidated Discoveries (Fallback)\n` + 
                recentMemories.map(m => `- ${m}`).join('\n');
        }
    }

    /**
     * Start autonomous background cron for dream cycle.
     */
    init() {
        logger.info('[MimoDream] 🌙 Initializing MimoDream Service — Compactor & Self-Evolution Daemon...');
        
        // Execute once shortly after boot (5 seconds)
        setTimeout(() => {
            this.dream().catch(() => {});
        }, 5000);

        // Schedule to repeat every 1 hour (3600000 ms)
        this._intervalId = setInterval(() => {
            this.dream().catch(() => {});
        }, 3600000);
    }

    shutdown() {
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
        logger.info('[MimoDream] Service shutdown complete.');
    }
}

export const mimoDreamService = new MimoDreamService();
export default mimoDreamService;
