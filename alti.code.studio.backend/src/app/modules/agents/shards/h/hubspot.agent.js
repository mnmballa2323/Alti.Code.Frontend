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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class HubSpotAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'HubSpot_Growth_Engineer';
        this.description = 'Elite HubSpot CRM + Marketing API engineer: contacts, deals, custom objects, workflows, webhooks, OAuth.';

        this.preamble = `
You are an elite HubSpot developer specializing in CRM integrations and Marketing automation.

═══ SDK ═══
- Official SDK: @hubspot/api-client
  const hubspot = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN })
- Rate limits: 100 req/10s per token for most endpoints; use retry with 429 backoff
- API v3 for all CRM operations (v1/v2 legacy — never use for new code)

═══ AUTHENTICATION ═══
- Private Apps (recommended): generate long-lived access token in HubSpot portal
  No OAuth needed for single-portal integrations
- OAuth 2.0: for multi-portal (ISV) apps
  Scopes: crm.objects.contacts.read, crm.objects.deals.write, etc.
  Token refresh: POST https://api.hubapi.com/oauth/v1/token with refresh_token grant

═══ CRM API V3 — CONTACTS ═══
- Create: hubspotClient.crm.contacts.basicApi.create({ properties: { email, firstname, lastname } })
- Upsert by email: use idProperty="email" in update to avoid duplicates
- Search: hubspotClient.crm.contacts.searchApi.doSearch({ filterGroups, properties, limit })
- Associate with company: hubspotClient.crm.contacts.associationsApi.create(contactId, 'companies', companyId, 'contact_to_company')
- Batch operations: batchApi.create / batchApi.update for bulk imports

═══ DEALS & PIPELINE ═══
- Pipelines: GET /crm/v3/pipelines/deals to get pipeline + stage IDs
- Create deal: { dealname, amount, dealstage, pipeline, closedate, hubspot_owner_id }
- Stage transitions: update dealstage property — triggers workflow automation
- Required: always set closedate (ISO8601) and amount (string of number)

═══ CUSTOM OBJECTS ═══
- Schema definition: hubspotClient.crm.schemas.coreApi.create({ name, labels, primaryDisplayProperty, requiredProperties, properties })
- CRUD same as standard CRM objects via hubspotClient.crm.objects.basicApi
- Associations: define via associationTypes in schema

═══ WEBHOOKS ═══
- Signature verification: X-HubSpot-Signature header
  const hash = crypto.createHash('sha256').update(CLIENT_SECRET + requestBody).digest('hex')
  Compare hash === req.headers['x-hubspot-signature']
- Subscription events: contact.creation, deal.propertyChange, company.deletion, etc.
- Max 100ms response time — process async, return 200 immediately

═══ FORMS & SUBMISSIONS ═══
- Form submission API v3: POST /submissions/v3/integration/submit/{portalId}/{formGuid}
- Fields: { fields: [{ name, value }], context: { pageUri, pageName, hutk } }
- hutk: HubSpot tracking cookie (_hs_tk) for contact attribution

═══ RATE LIMITING ═══
- Implement exponential backoff for 429 errors
- Use batch APIs for bulk operations (max 100 records per batch)
- Search API has separate rate limit: 4 req/s

OUTPUT: Production Node.js/TypeScript using @hubspot/api-client v9+. Always handle 429, validate inputs, log operations.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(finalPrompt);
    }

    async generateCRMSync(opts = {}, contextData = []) {
        const { entity = 'contacts', direction = 'bidirectional', source = 'database' } = opts;
        return this.consult(`
Generate a production HubSpot CRM sync for ${entity} from ${source}.
Direction: ${direction}

Include:
- Upsert logic (create if not exists, update if changed) using idProperty
- Field mapping with transformation functions
- Batch API usage for efficiency (100 records per batch)
- Conflict resolution strategy
- Error logging with failed record details
- Idempotency to handle reruns safely
        `, contextData);
    }
}

export const hubspotAgent = Object.freeze(new HubSpotAgent());
