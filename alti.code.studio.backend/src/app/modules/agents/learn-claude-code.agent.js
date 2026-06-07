/**
 * Copyright (c) 2024 Inso Code
 *
 * NANO CODE AGENT — Minimal Autonomous Coding Agent
 * Implements the core bash-loop pattern from shareAI-lab/learn-claude-code.
 * MIT License — https://github.com/shareAI-lab/learn-claude-code
 *
 * Tier 13 Specialist Agent — Autonomous Code Execution
 * "Bash is all you need" — A nano agent built from 0 to 1.
 * Uses the fundamental read/write/bash tool loop for autonomous coding tasks.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { nanoAgentService } from '../openclaw/nano-agent.service.js';
import { logger } from '../../../shared/logger.js';

class LearnClaudeCodeAgent extends BaseSpecialistAgent {
    constructor() {
        super('LearnClaudeCodeAgent', 'The Nano Code Executor', 'Tier 13');
        this.name = 'NanoCode_Autonomous_Agent';
        this.description = 'Minimal autonomous code agent using the read/write/bash tool loop (learn-claude-code pattern). Iteratively reads files, writes code, runs bash commands, and self-corrects until tasks complete. Ideal for: automated refactoring, file generation, test execution, script automation, and any task where autonomous fs/shell access is needed.';
        this.preamble = `You are the Nano Code Agent — a minimal, autonomous code executor.
You embody the core insight from "learn-claude-code": that a powerful coding agent needs only 4 primitives:

**Your 4 Tools (The Bash Manifesto):**
\`\`\`
read_file(path)           → Read any file from disk
write_file(path, content) → Write/create any file
bash(command)             → Execute shell commands
list_dir(path)            → Explore directory structure
\`\`\`

**Your Execution Loop:**
1. Read the task → understand exactly what's needed
2. Explore the codebase with list_dir/read_file
3. Plan the minimal set of changes required
4. Write code changes with write_file
5. Verify with bash (run tests, lint, etc.)
6. Iterate until done

**Your Principles:**
- Minimal: do only what's needed, no over-engineering
- Iterative: run → observe → correct → repeat
- Self-correcting: if bash returns an error, diagnose and fix
- Transparent: explain each tool call before making it
- Safe: never destroy data, always verify before overwriting

**Pattern from learn-claude-code:**
The nano-agent demonstrates that a coding agent fundamentally just needs:
a tight loop of tool calls, LLM reasoning between calls, and self-correction on errors.`;
    }

    async _invoke(prompt, contextBlock) {
        logger.info(`⚡ NanoCode Agent: Starting autonomous execution task...`);

        // Determine if this needs the full nano-agent loop or Gemini reasoning
        const needsExecution = /(?:run|execute|create file|write|fix|refactor|test|npm|python|bash|shell)/i.test(prompt);

        if (needsExecution) {
            logger.info('[nano-agent] Detected executable task — starting tool loop');
            const result = await nanoAgentService.run(prompt, {
                maxIterations: 12,
                systemPrompt: `${this.preamble}\n\nTask: ${prompt}\n\nContext: ${contextBlock || ''}`,
            });

            const summary = result.status === 'done'
                ? `✅ **Completed** (${result.iterations} iterations)\n\n${result.summary}`
                : `⚠️ **Status: ${result.status}** after ${result.iterations} iterations\n\nAgent history captured.`;

            return summary;
        }

        // For reasoning/planning tasks, use Gemini with the nano-agent preamble
        return GeminiAiService.generateContent(
            `${this.preamble}\n\nContext: ${contextBlock || ''}\n\nTask: ${prompt}`
        );
    }

    /** Expose available tools to the orchestrator */
    getTools() {
        return nanoAgentService.getTools();
    }
}

export const learnClaudeCodeAgent = new LearnClaudeCodeAgent();
