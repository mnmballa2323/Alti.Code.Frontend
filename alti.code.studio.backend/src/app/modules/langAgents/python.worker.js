/**
 * Copyright (c) 2024 Inso Code — TIER 7: LANGUAGE-SPECIFIC
 * Python, TypeScript, Rust, Go agents — each an expert in their language.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

const createLangProcessor = (lang, emoji) => async (job) => {
    const { code, task, framework } = job.data;
    logger.info(`${emoji} ${lang} [${job.id}]: ${task || 'Analyzing'}...`);
    const result = await aiProvider.reason(`You are a world-class ${lang} expert.\nFramework: ${framework || 'Any'}\nTask: ${task || 'Review and optimize'}\nCode:\n\`\`\`${lang.toLowerCase()}\n${code || ''}\n\`\`\`\n\nProvide ${lang}-specific best practices, idiomatic patterns, performance optimizations, and common pitfalls.\nRespond in JSON: { "issues": [], "optimizations": [], "idiomaticVersion": string, "bestPractices": [] }`);
    return { [lang.toLowerCase()]: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};

export const pythonWorkerProcessor = createLangProcessor('Python', '🐍');
export const typescriptWorkerProcessor = createLangProcessor('TypeScript', '📘');
export const rustWorkerProcessor = createLangProcessor('Rust', '🦀');
export const golangWorkerProcessor = createLangProcessor('Go', '🐹');
