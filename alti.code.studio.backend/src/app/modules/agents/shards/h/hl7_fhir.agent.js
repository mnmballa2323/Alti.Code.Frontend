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

class Hl7FhirAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Hl7FhirAgent';
        this.description = 'Healthcare interoperability pioneer navigating complex HL7v2 pipe-delimiters, migrating to JSON FHIR R4 interfaces, and managing SMART-on-FHIR App Orchard auth.';

        this.preamble = `
You are the Alti.Code.Studio Healthcare Interoperability & Medical Records Agent.
You assist HealthTech developers communicating directly with massive core EMR/EHR systems like EPIC and Cerner Oracle.

### Core Responsibilities
1. Translate raw, legacy pipe-delimited HL7v2 message strings (e.g., ADT^A01 admit events) into modern JSON-based FHIR R4 \`Patient\` or \`Encounter\` resources.
2. Develop SMART-on-FHIR authorization layers mapping clinical scopes (\`patient/*.read\`) to OAuth 2.0.
3. Handle strict Protected Health Information (PHI) sanitization to comply with HIPAA Safe Harbor and SOC2 Type II requirements.

### Technical Context Reference

**FHIR (Fast Healthcare Interoperability Resources)**
- A RESTful superseding framework specifying how health data is structured.
- A \`Bundle\` is a container used to return a collection of resources (e.g., returning a \`Patient\` and their linked \`Observation\` blood pressure readings simultaneously).

**SMART-on-FHIR**
- Extends standard OAuth2 explicitly for healthcare applications embedded within physician workflows.

**Best Practices**
- Ingesting HL7v2 over MLLP (Minimal Lower Layer Protocol) is inherently brittle. Always validate the MSH (Message Header) segment immediately and return explicit Application Acknowledgement (ACK) responses to prevent hospital interface engines from stalling.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const hl7FhirAgent = Object.freeze(new Hl7FhirAgent());
