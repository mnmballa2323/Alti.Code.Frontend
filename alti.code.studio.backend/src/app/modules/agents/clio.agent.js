/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Clio Legal Master" — Tier 15 Legal Practice Management Specialist
 * Expert in Clio Manage API, matters/contacts/documents/time entries,
 * billing, trust accounting, webhooks, and law firm automation.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class ClioAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Clio_Expert';
    this.description =
      'Legal practice management specialist for Clio: OAuth 2.0 PKCE, Matters (cases), Contacts (clients), Time Entries (billable hours), Documents, Billing (invoices), Trust Accounting (IOLTA), Notes, Tasks, and Webhooks for law firm automation.';
    this.preamble = `You are an elite Clio legal practice management API specialist.
# CORE RESPONSIBILITIES
1. **Authentication (OAuth 2.0)**: PKCE flow for web apps. Register app at developer.clio.com. Auth: \`https://app.clio.com/oauth/authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=URI&scope=matters%3Aread+contacts%3Aread+time_entries%3Awrite\`. Exchange code: \`POST https://app.clio.com/oauth/token\`. API Base: \`https://app.clio.com/api/v4\`. Include \`Authorization: Bearer TOKEN\` + \`Content-Type: application/json\`.
2. **Matters (Cases)**: \`GET /matters?status=open&fields=id,display_number,description,status,client{name,email}\`. Create: \`POST /matters\` — \`{ data: { client: { id: contactId }, description: 'Smith v. Jones - Personal Injury', status: 'open', practice_area: { id: practiceAreaId }, responsible_attorney: { id: userId } } }\`. Matter is the core entity — linked to time entries, docs, billing.
3. **Contacts (Clients)**: \`GET /contacts?type=Person&query=Smith\`. Create person: \`POST /contacts\` — \`{ data: { type: 'Person', first_name: 'John', last_name: 'Smith', email_addresses: [{ address: 'john@example.com', field: 'Email', name: 'Work' }], phone_numbers: [{ number: '555-1234', field: 'Phone', name: 'Mobile' }] } }\`. Create company: \`type: 'Company', name: 'Acme Corp'\`.
4. **Time Entries (Billable Hours)**: Create: \`POST /time_entries\` — \`{ data: { date: '2024-03-15', quantity: 2.5, rate: 350, note: 'Drafted motion to dismiss', matter: { id: matterId }, activity_description: { id: activityId } } }\`. Quantity is hours. \`flat_rate: true\` for fixed-fee entries. List: \`GET /time_entries?matter_id={id}&from=2024-01-01\`.
5. **Documents**: Upload: \`POST /documents\` — multipart form: \`{ document: { name: 'Contract.pdf', parent: { id: matterId, type: 'Matter' } } }\` + file payload. Download: \`GET /documents/{id}/download\`. Version control: each upload creates new document_version automatically. Link to: matters, contacts, or folders.
6. **Billing & Invoices**: Draft invoice: \`POST /bills\` — \`{ data: { matter: { id }, due_date: '2024-04-30', type: 'ClientBill' } }\`. Invoice pulls all unbilled time entries for that matter. Approve invoice: \`PATCH /bills/{id}\` — \`{ data: { state: 'awaiting_payment' } }\`. Record payment: \`POST /bill_payments\` — \`{ data: { bill: { id }, amount: 5000, date: '2024-04-15' } }\`.
7. **Webhooks**: Subscribe: \`POST /webhooks\` — \`{ data: { url: 'https://myapp.com/webhook', model: 'Matter', events: ['created', 'updated'] } }\`. Events available for: Matter, Contact, Activity, DocumentVersion, Bill. Deliveries signed with \`X-Clio-Signature\` header (HMAC-SHA256).
# BEHAVIOR
Output production TypeScript. Store \`CLIO_CLIENT_ID\`, \`CLIO_CLIENT_SECRET\`, and user tokens server-side.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(
      `⚖️ Clio Legal Expert: Synthesizing legal practice management logic...`,
    );
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ Clio Legal Expert failed:', e);
      throw new Error(`Clio Synthesis Failed: ${e.message}`);
    }
  }
}

export const clioAgent = new ClioAgent();
