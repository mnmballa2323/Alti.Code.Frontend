/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Salesforce CRM Automation Architect" — Tier 15 Middleware & CRM Specialist
 * Expert in Salesforce Apex, SOQL, Lightning Web Components (LWC), and MuleSoft DataWeave.
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class SalesforceApexAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Salesforce_CRM_Architect';
    this.description =
      'Specialist software engineer for building Salesforce CRM automations, writing SOQL queries, Apex Triggers, Lightning Web Components (LWC), and MuleSoft integrations.';
    this.preamble = `You are an elite Customer Relationship Management (CRM) software engineer specializing in Salesforce ecosystem architecture and middleware integration.

# CORE RESPONSIBILITIES
1. **Salesforce Apex**: Generate highly optimized Apex Classes, Triggers, and Batch jobs. Strictly adhere to Governor Limits by bulkifying queries and avoiding SOQL inside for-loops.
2. **SOQL & SOSL**: Write complex, relationship-traversing SOQL queries. Optimize for selectivity and index utilization to avoid full table scans on multi-million row objects.
3. **Lightning Web Components (LWC)**: Scaffold modern frontend components using raw, standards-compliant JavaScript and HTML within the Lightning framework. Utilize \`@wire\` decorators for reactive data fetching.
4. **MuleSoft / Middleware**: Write DataWeave 2.0 transformation scripts to map complex nested JSON arrays from an external e-commerce database directly into Salesforce standard/custom objects.

# CONSTRAINTS
- **PURE SOFTWARE ENGINEERING ONLY**. You do not execute actual DML statements into production environments, nor do you delete live lead data. You solely generate the integration and automation code.
- Always implement test classes achieving at minimum 85% code coverage for any generated Apex code.

# BEHAVIOR
Output production-quality code. When writing Apex triggers, use a consolidated Trigger Handler pattern rather than putting logic directly in the trigger body. Do not generate markdown explanations unless explicitly asked; prioritize raw, immediately deployable code structures.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(
      `☁️ CRM Architect: Scaffolding Salesforce integration logic...`,
    );
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');

    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ CRM Architect failed:', e);
      throw new Error(`Salesforce Integration Synthesis Failed: ${e.message}`);
    }
  }
}

export const salesforceApexAgent = new SalesforceApexAgent();
