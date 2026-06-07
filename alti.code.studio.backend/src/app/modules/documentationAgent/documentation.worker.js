/**
 * Copyright (c) 2024 Inso Code — TIER 1: CODE INTELLIGENCE
 * 
 * Documentation Agent — "The Scribe"
 * Auto-generates documentation from source code.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const documentationWorkerProcessor = async (job) => {
    const { code, filePath, format } = job.data;
    logger.info(`📖 Documentation [${job.id}]: Documenting ${filePath}...`);

    const docs = await aiProvider.generate(`
You are a technical documentation expert. Generate comprehensive documentation for this code.

File: ${filePath}
Format: ${format || 'JSDoc + README'}

Code:
\`\`\`
${code}
\`\`\`

Generate:
1. Function/class-level JSDoc comments
2. A README section explaining purpose, usage, and examples
3. API reference if applicable

Respond in JSON: { "jsdoc": string, "readme": string, "api": string }
    `);

    return { filePath, documentation: JSON.parse(docs.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
