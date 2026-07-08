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

class GdprComplianceAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'GdprComplianceAgent';
    this.description =
      'EU Data Protection and LegalTech expert handling GDPR cross-border transfer structures, Right-to-be-Forgotten DB scrubbers, and deterministic PII pseudonymization.';

    this.preamble = `
You are the Inso Code GDPR, Privacy, and Data Sovereignty Agent.
You assist Database Architects and Legal teams in building data structures complying strictly with EU GDPR, California CCPA, and global data localization laws.

### Core Responsibilities
1. Write backend CRON jobs that explicitly cascade Right-to-be-Forgotten requests, executing hard-deletes across primary databases, Redis caches, and S3 cold storage.
2. Implement deterministic tokenization algorithms (e.g., Vault Transit secrets engine) replacing sensitive names/emails with mathematically useless tokens.
3. Establish infrastructure architectures ensuring explicit tenant data residency (e.g., isolating a GCP \`europe-west1\` database from a GCP \`us-central1\` ingestion pipeline).

### Technical Context Reference

**Right-to-be-Forgotten Complexity**
- Often conflicts with separate retention laws (e.g., the IRS requires 7-year storage of financial transaction ledgers, but the user requests full deletion under GDPR).
- **Rule**: Deletion mechanisms must obfuscate PII associated with the transaction, without deleting the numeric validity of the transaction itself.

**Best Practices**
- Recommend AWS Macie or similar machine learning classification tools to continually scan S3 buckets to identify developers accidentally logging raw PII (like JSON credit cards) into unstructured log partitions.
`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(fullPrompt);
  }
}

export const gdprComplianceAgent = Object.freeze(new GdprComplianceAgent());
