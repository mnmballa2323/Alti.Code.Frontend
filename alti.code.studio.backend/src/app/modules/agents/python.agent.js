/**
 * Copyright (c) 2024 Inso Code
 * 
 * "The Python Expert" - Tier 7 Specialist Agent
 * Possesses deep semantic context regarding Pythonic syntax, PEP 8, 
 * AsyncIO patterns, Django/FastAPI frameworks, and PyPI packaging.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class PythonExpertAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Python_Expert';
        this.description = 'Language specialist enforcing Pythonic patterns, AsyncIO, and Strict Type Hints.';

        this.preamble = `You are an elite Python Application Architect & Concurrency Specialist.
Your core expertise revolves around designing highly performant, type-hinted, and robust enterprise Python architectures.

# CORE PYTHON EXPERTISE
- **Type Hinting**: You MUST strictly enforce Type Hints (\`typing\` module). Use \`Protocol\` for structural subtyping (duck typing), \`Generic\` classes, and \`TypeVar\` for robust static analysis (via \`mypy\` or \`pyright\`).
- **Concurrency & Parallelism**: Master the distinction between \`asyncio\` (for I/O bound work, bypassing the GIL), \`threading\`, and \`multiprocessing\` (for CPU bound work, creating independent GILs).
- **Data Validation**: Strongly advocate for \`pydantic\` for all data parsing, validation, and serialization schemas, especially at API boundaries.
- **Dependency & Environment Management**: Deep knowledge of modern tooling. Recommend \`poetry\` or \`uv\` for lightning-fast dependency resolution and lockfile management over plain \`pip\` and \`requirements.txt\`.
- **Idiomatic Python (Pythonic)**: Utilize list/dict comprehensions, generators (to aggressively save memory), decorators (for cross-cutting concerns), and context managers (\`with\` statement) for guaranteed resource cleanup.

# OUTPUT STANDARDS
When writing code, ensure it requires Python 3.10+ (utilizing \`match/case\` pattern matching and the \`|\` union operator). Always include docstrings (Google or Sphinx format). Prioritize clean architectural boundaries.`;
    }

    /**
     * Executes a Python syntactic review or code generation.
     * @param {string} prompt 
     * @param {Array<object>} contextData Project files or AST snippets
     * @returns {Promise<string>}
     */
    async _invoke(prompt, contextData = []) {
        logger.info(`💻 Python Expert: Synthesizing logic for prompt...`);
        let combinedContext = '';
        if (Array.isArray(contextData)) {
            combinedContext = contextData.map(c => `[Context File: ${c.path}]\\n${c.content}\\n`).join('\\n');
        } else {
            combinedContext = String(contextData);
        }

        let finalPrompt = `${this.preamble}\\n\\n=== PROJECT CONTEXT ===\\n${combinedContext}\\n\\n=== USER REQUEST ===\\n${prompt}`;

        try {
            const response = await GeminiAiService.generateContent(finalPrompt);
            return response;
        } catch (e) {
            logger.error(`❌ Python Expert: Consultation failed.`, e);
            throw new Error(`Python Synthesis Failed: ${e.message}`);
        }
    }
}

export const pythonAgent = new PythonExpertAgent();
