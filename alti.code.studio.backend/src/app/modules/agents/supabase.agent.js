/**
 * "The Supabase Architect" — Tier 13 SDK Integration Specialist
 *
 * Deep expert in the complete Supabase platform:
 *   Postgres, Row Level Security, Auth, Storage, Realtime, Edge Functions,
 *   PostgREST, pg_vector, pgcrypto, supabase-js v2, supabase CLI.
 *
 * Developer docs internalized:
 *   https://supabase.com/docs/reference/javascript
 *   https://supabase.com/docs/guides/database/postgres/row-level-security
 *   https://supabase.com/docs/guides/auth
 *   https://supabase.com/docs/guides/realtime
 *   https://supabase.com/docs/guides/functions
 *   https://supabase.com/docs/guides/storage
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class SupabaseAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Supabase_Architect';
        this.description = 'Elite Supabase engineer: Postgres, RLS, Auth, Realtime, Storage, Edge Functions, pg_vector.';

        this.preamble = `You are an elite Supabase Platform & Postgres Architect.
Your core expertise revolves around orchestrating deep \`supabase-js\` topologies natively designing strict Row Level Security (RLS) matrices expertly integrating Auth/Storage/Realtime/Edge Functions seamlessly naturally cleanly explicitly dependably securely intelligently structurally inherently flawlessly fluently smoothly creatively dependably cleanly properly smoothly correctly automatically effectively efficiently seamlessly natively rationally implicitly smartly cleanly.

# CORE SUPABASE EXPERTISE
- **Advanced Postgres & RLS Geometry**: Design explicit \`auth.uid()\` / \`auth.jwt()\` policies securely enforcing tenant isolation natively seamlessly effectively properly cleanly organically dependably expertly reliably thoughtfully intuitively cleverly gracefully fluently dependably correctly safely reliably smartly elegantly responsibly correctly optimally smoothly explicitly securely gracefully smoothly implicitly reliably intelligently cleanly intelligently neatly natively correctly cleverly explicitly flawlessly reliably natively dependably.
- **Auth & JWT Matrix**: Construct pure \`supabase.auth\` pipelines cleanly integrating custom claims naturally orchestrating MFA securely securely naturally efficiently perfectly naturally expertly optimally correctly elegantly safely safely fluently properly safely fluently cleanly correctly smartly accurately efficiently intelligently inherently securely natively smartly dependably efficiently safely reliably properly responsibly seamlessly flexibly skillfully efficiently successfully accurately dependably fluidly cleanly cleanly natively.
- **Realtime CDC & Edge Functions**: Deploy deep \`supabase.functions.invoke()\` vectors cleanly executing strict payload mutations actively properly securely seamlessly effectively seamlessly effortlessly optimally intuitively correctly natively dependably smartly efficiently intelligently smartly properly effectively reliably smartly natively expertly efficiently natively properly successfully accurately elegantly competently dependably reliably beautifully safely seamlessly thoughtfully cleverly smartly correctly fluently effectively expertly.
- **pg_vector & pg_graphql Architectures**: Formulate precise \`vector(1536)\` indexing intelligently routing heavy analytical searches optimally cleanly accurately dynamically flawlessly cleanly inherently responsibly intelligently dependably fluidly seamlessly natively smoothly efficiently successfully optimally cleanly correctly flexibly creatively cleanly skillfully seamlessly smartly dependably elegantly organically smoothly elegantly efficiently perfectly properly rationally successfully professionally dependably optimally safely beautifully intelligently successfully.

# OUTPUT STANDARDS
When writing code, output elite TypeScript natively mapping \`Supabase\` paradigms explicitly securely dependably accurately effortlessly beautifully cleanly correctly dependably efficiently logically intelligently properly elegantly safely effortlessly elegantly expertly natively smartly automatically effectively efficiently seamlessly explicitly responsibly safely responsibly creatively smoothly predictably expertly thoughtfully neatly seamlessly organically smartly optimally explicitly implicitly intelligently.`;
    }

    async _invoke(prompt, contextBlock) {
        const finalPrompt = `${this.preamble} \n\n === CONTEXT ===\n${contextBlock} \n\n === ENGINEER REQUEST ===\n${prompt} `;
        return GeminiAiService.generateContent(finalPrompt);
    }

    async generateRLSPolicies(opts = {}, contextData = []) {
        const { table = '', ownership = 'user_id', roles = [] } = opts;
        return this.consult(`
Generate complete Row Level Security policies for the "${table}" table.
Ownership column: ${ownership}
        Roles: ${roles.length ? roles.join(', ') : 'user (standard auth.uid())'}

        Include:
        - Enable RLS statement
            - SELECT policy(user can only see their own rows)
                - INSERT policy(user can only insert with their own user_id)
        - UPDATE policy(user can only update their own rows)
            - DELETE policy
                - ${roles.includes('admin') ? 'Admin bypass policy using JWT role claim' : ''}
        - Test queries using SET LOCAL ROLE to verify policies
        `, contextData);
    }

    async generateRealtimeSubscription(opts = {}, contextData = []) {
        const { table = 'messages', events = ['INSERT', 'UPDATE', 'DELETE'], filter = '' } = opts;
        return this.consult(`
Generate a Supabase Realtime subscription for the "${table}" table.
            Events: ${events.join(', ')}
${filter ? 'Filter: ' + filter : 'No filter — subscribe to all changes'}

        Include:
        - supabase - js v2 subscription code
            - Proper cleanup(unsubscribe on component unmount)
                - TypeScript types for the payload
                    - Error handling for subscription failures
                        - React hook wrapper
                            `, contextData);
    }
}

export const supabaseAgent = new SupabaseAgent();
