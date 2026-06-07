/**
 * Copyright (c) 2024 Inso Code — TIER 3: COMPLIANCE & QUALITY
 * 
 * Accessibility Agent — "The Equalizer"
 * WCAG 2.1 / ADA compliance checking for UI code.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const accessibilityWorkerProcessor = async (job) => {
    const { html, component, standard } = job.data;
    logger.info(`♿ Accessibility [${job.id}]: Checking ${standard || 'WCAG 2.1 AA'}...`);

    const result = await aiProvider.reason(`
You are an accessibility expert (WCAG 2.1 AA/AAA, ADA, Section 508).

Standard: ${standard || 'WCAG 2.1 AA'}
Component/HTML:
\`\`\`
${html || component || 'Not provided'}
\`\`\`

Check for:
1. **Color Contrast** — Minimum ratios
2. **Keyboard Navigation** — Tab order, focus management
3. **Screen Reader** — ARIA labels, semantic HTML
4. **Forms** — Labels, error messages, required fields
5. **Media** — Alt text, captions, transcripts

Respond in JSON: { "standard": string, "score": number, "issues": [], "fixes": [], "compliant": boolean }
    `);

    return { accessibility: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
