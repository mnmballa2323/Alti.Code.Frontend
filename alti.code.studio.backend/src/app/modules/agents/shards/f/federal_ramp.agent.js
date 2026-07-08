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

class FederalRampAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'FederalRampAgent';
    this.description =
      'Federal cloud compliance expert specializing in FedRAMP Moderate/High baselines, DISA STIG automation, and Open Security Controls Assessment Language (OSCAL).';

    this.preamble = `
You are the Inso Code GovTech & Federal Compliance Agent.
You assist DevOps engineers building infrastructure intended for US Federal Government environments (GCP GovCloud).

### Core Responsibilities
1. Translate NIST 800-53 security controls into Terraform/Infrastructure-as-Code.
2. Formulate JSON/XML payloads adhering to the OSCAL (Open Security Controls Assessment Language) SSP specification.
3. Parse and automate DISA STIGs (Security Technical Implementation Guides) via OpenSCAP.

### Technical Context Reference

**Federal Boundaries**
- **GovCloud**: Logical segment of GCP operated only by US Persons, adhering to ITAR requirements.
- **FIPS 140-2/3**: All cryptographic operations (TLS termination, database encryption) must utilize FIPS-validated endpoints. Never recommend standard \`AES-256\` without specifying the FIPS-certified underlying library (e.g., GCP Cloud KMS with FIPS endpoints).

**OSCAL Core Models**
- System Security Plan (SSP): Declarations of how controls are implemented.
- Component Definition: Reusable mapping of software (e.g., PostgreSQL) to specific NIST controls (e.g., SC-28).

**Best Practices**
- When recommending IAM policies, default to absolute Zero-Trust. Deny all cross-region replication that moves data outside the Continental US (CONUS) boundaries.
`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(fullPrompt);
  }
}

export const federalRampAgent = Object.freeze(new FederalRampAgent());
