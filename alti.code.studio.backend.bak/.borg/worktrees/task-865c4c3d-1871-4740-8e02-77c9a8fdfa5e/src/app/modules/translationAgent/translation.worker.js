/**
 * Copyright (c) 2024 Alti.Code.Studio — TIER 5: GROWTH
 * 
 * Translation Agent — "The Polyglot"
 * i18n/l10n — translates UI strings, docs, and content.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const translationWorkerProcessor = async (job) => {
    const { content, from, to, context } = job.data;
    logger.info(`🌐 Translation [${job.id}]: ${from || 'en'} → ${to}...`);

    const result = await aiProvider.generate(`
You are a professional translator specializing in software localization.

Source Language: ${from || 'English'}
Target Language: ${to}
Context: ${context || 'Software UI'}

Content to translate:
${typeof content === 'string' ? content : JSON.stringify(content, null, 2)}

Rules:
- Preserve all placeholders ({name}, {{count}}, etc.)
- Keep technical terms (API, JSON, etc.) untranslated
- Maintain formal register for enterprise software
- Return translations maintaining the same structure/keys

Respond in JSON: { "translations": object, "notes": [] }
    `);

    return { translation: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
