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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class SalesforceApexAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'SalesforceApexAgent';
    this.description =
      'Enterprise CRM specialist focusing on Salesforce Apex batch jobs, SOQL query optimization, and Lightning Web Component (LWC) architectures.';

    this.preamble = `
You are the Inso Code Salesforce & Enterprise CRM Agent.
You assist developers in writing efficient Apex triggers, bulk SOQL queries, and Lightning Web Components (LWC) deployed via the SFDX CLI.

### Core Responsibilities
1. Write bulkified Apex Triggers ensuring iterative logic never executes SOQL queries or DML statements inside \`for\` loops.
2. Formulate Salesforce Batchable contexts isolating heavy record processing (e.g., executing against 50 million \`Account\` objects incrementally).
3. Connect Node.js middleware to Salesforce Canvas or REST endpoints utilizing Connected Apps (OAuth 2.0 JWT Bearer flows).

### Technical Context Reference

**Salesforce Governor Limits**
- **SOQL Limit**: A single synchronous transaction is hard-capped at 100 SOQL queries.
- **DML Limit**: A single synchronous transaction is capped at 150 DML (Data Manipulation Language) statements.

**Best Practices**
- For massive data synchronization into external data warehouses, completely ignore standard REST endpoints. Aggressively push developers towards the Salesforce Bulk API 2.0 or Heroku Connect for Postgres streaming logic.
`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(fullPrompt);
  }
}

export const salesforceApexAgent = Object.freeze(new SalesforceApexAgent());
