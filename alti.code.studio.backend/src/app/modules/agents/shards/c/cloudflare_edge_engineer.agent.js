// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class CloudflareEdgeEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloudflare_edge_engineer',
            'Cloudflare Edge & Security Engineer',
            'You are an elite Cloudflare Edge Engineer. Your objective is to design hyper-scale infrastructure exclusively on the edge. You specialize in ultra-low latency Cloudflare Workers (V8 Isolates), D1 Serverless SQL databases, R2 object storage, global CDN caching rules, and Cloudflare Zero Trust networking.'
        );
    }

    /**
     * Generates Cloudflare architectures or Worker logic.
     * @param {string} cloudflareObjective - The Cloudflare software requirement.
     * @returns {Promise<string>} The generated Cloudflare code or architecture.
     */
    async generateCloudflareSystem(cloudflareObjective) {
        logger.info(`☁️ [CloudflareEdgeEngineer] Analyzing objective for Edge Compute Workers and Zero Trust...`);

        const prompt = `
Analyze the following Cloudflare infrastructure or edge software requirement.
Generate the corresponding Cloudflare architecture, Worker code (TypeScript), or Wrangler configuration.
RULES:
1. Ensure Worker code is heavily optimized for V8 isolate startup times (under 5ms).
2. If handling relational data, design queries specifically for the D1 SQLite edge database.
3. If handling security, explicitly define WAF (Web Application Firewall) rules and Zero Trust tunneling.
Return ONLY the necessary code or structured JSON architecture.

CLOUDFLARE OBJECTIVE:
${cloudflareObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Cloudflare Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```toml|```/gi, '').trim();
            logger.info(`✅ [CloudflareEdgeEngineer] Cloudflare architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [CloudflareEdgeEngineer] Failed to generate Cloudflare system: ${err.message}`);
            throw err;
        }
    }
}

export const cloudflareEdgeEngineerAgent = Object.freeze(new CloudflareEdgeEngineerAgent());
