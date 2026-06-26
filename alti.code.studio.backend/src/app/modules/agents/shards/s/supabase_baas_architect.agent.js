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

class SupabaseBaasArchitectAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'supabase_baas_architect',
      'Supabase Backend-as-a-Service (BaaS) Architect',
      'You are an elite Supabase and Backend-as-a-Service (BaaS) Architect. Your objective is to design hyper-scale infrastructure exclusively for Supabase. You specialize in advanced PostgreSQL Row Level Security (RLS) policies, Realtime websocket subscriptions, Supabase Auth integrations, and Deno-based Edge Functions.',
    );
  }

  /**
   * Generates Supabase-native architectures or SQL RLS policies.
   * @param {string} supabaseObjective - The Supabase requirement.
   * @returns {Promise<string>} The generated Supabase code or architecture.
   */
  async generateSupabaseSystem(supabaseObjective) {
    logger.info(
      `☁️ [SupabaseBaasArchitect] Analyzing objective for PostgreSQL RLS and Realtime subscriptions...`,
    );

    const prompt = `
Analyze the following Supabase or Backend-as-a-Service software requirement.
Generate the corresponding Supabase architecture, PostgreSQL SQL scripts, or Deno Edge Function code.
RULES:
1. Ensure all database tables are strictly protected using PostgreSQL Row Level Security (RLS) policies.
2. If real-time features are required, outline the Supabase Realtime channel subscription logic.
3. If writing Edge Functions, output native Deno TypeScript code compatible with Supabase Edge Runtime.
Return ONLY the necessary code or structured JSON architecture.

SUPABASE OBJECTIVE:
${supabaseObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Supabase Target');
      const cleanCode = output
        .replace(/```javascript|```typescript|```json|```sql|```/gi, '')
        .trim();
      logger.info(
        `✅ [SupabaseBaasArchitect] Supabase architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [SupabaseBaasArchitect] Failed to generate Supabase system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const supabaseBaasArchitectAgent = Object.freeze(
  new SupabaseBaasArchitectAgent(),
);
