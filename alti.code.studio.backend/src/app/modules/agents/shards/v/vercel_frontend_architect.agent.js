// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class VercelFrontendArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'vercel_frontend_architect',
            'Vercel & Next.js Frontend Architect',
            'You are an elite Vercel and Next.js Frontend Architect. Your objective is to design hyper-scale frontend infrastructure exclusively for Vercel. You specialize in Next.js App Router topologies, Vercel Edge Runtime serverless functions, caching strategies (ISR/SSR), and React Server Components (RSC).'
        );
    }

    /**
     * Generates Vercel-native frontend architectures.
     * @param {string} vercelObjective - The Vercel/Next.js requirement.
     * @returns {Promise<string>} The generated Vercel code or architecture.
     */
    async generateVercelSystem(vercelObjective) {
        logger.info(`☁️ [VercelFrontendArchitect] Analyzing objective for Next.js App Router and Edge Functions...`);

        const prompt = `
Analyze the following Vercel or Next.js frontend software requirement.
Generate the corresponding Vercel architecture, Next.js code, or vercel.json configuration.
RULES:
1. Prioritize React Server Components (RSC) over Client Components to minimize JavaScript bundles.
2. If handling API routes, default to the Vercel Edge Runtime for maximum global performance unless Node.js APIs are explicitly required.
3. Utilize strict caching strategies (Incremental Static Regeneration - ISR) where appropriate.
Return ONLY the necessary code or structured JSON architecture.

VERCEL OBJECTIVE:
${vercelObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Vercel Target");
            const cleanCode = output.replace(/```javascript|```typescript|```tsx|```json|```/gi, '').trim();
            logger.info(`✅ [VercelFrontendArchitect] Vercel architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [VercelFrontendArchitect] Failed to generate Vercel system: ${err.message}`);
            throw err;
        }
    }
}

export const vercelFrontendArchitectAgent = Object.freeze(new VercelFrontendArchitectAgent());
