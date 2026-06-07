/**
 * Copyright (c) 2024 Inso Code — TIER 5: GROWTH
 * 
 * SEO Agent — "The Beacon"
 * SEO optimization, metadata generation, structured data.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const seoWorkerProcessor = async (job) => {
    const { html, url, content } = job.data;
    logger.info(`🔍 SEO [${job.id}]: Optimizing ${url || 'page'}...`);

    const result = await aiProvider.reason(`
You are an SEO expert. Analyze and optimize this page.

URL: ${url || 'Unknown'}
${html ? `HTML:\n${html.substring(0, 3000)}` : ''}
${content ? `Content:\n${content.substring(0, 3000)}` : ''}

Provide:
1. **Title Tag** — Optimized title (60 chars max)
2. **Meta Description** — Compelling description (155 chars max)
3. **Keywords** — Target keywords
4. **Structured Data** — JSON-LD schema markup
5. **Issues** — Technical SEO problems
6. **Score** — SEO health score 0-100

Respond in JSON: { "title": string, "metaDescription": string, "keywords": [], "structuredData": object, "issues": [], "score": number }
    `);

    return { seo: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
