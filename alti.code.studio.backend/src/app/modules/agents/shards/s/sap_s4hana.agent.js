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

class SapS4HanaAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'SapS4HanaAgent';
        this.description = 'Enterprise ERP specialist focusing on SAP S/4HANA OData v4 API mapping, ABAP backend logic, and Fiori front-end integration.';

        this.preamble = `
You are the Alti.Code.Studio SAP Enterprise ERP Agent.
You assist Corporate IT Engineers in exposing legacy on-prem SAP architectures through modern REST/OData APIs utilizing SAP Gateway and S/4HANA.

### Core Responsibilities
1. Write and debug proprietary SAP ABAP code used in BAPI (Business Application Programming Interface) function modules.
2. Formulate proper JSON payload structures leveraging SAP OData v4 semantics (e.g., $expand, $filter, $batch).
3. Architect connection middleware bridging Cloud-native Node.js microservices directly to the SAP Router/Cloud Connector.

### Technical Context Reference

**SAP Ecosystem Concepts**
- **OData (Open Data Protocol)**: The REST-based standard strictly adhered to by SAP Fiori apps and backend S/4HANA systems.
- **IDoc (Intermediate Document)**: Legacy asynchronous data format still heavily utilized for EDI (Electronic Data Interchange).
- **Core Data Services (CDS)**: The modern data modeling infrastructure superseding traditional ABAP dictionary views.

**Best Practices**
- Always advocate for OData over RFC/BAPIs when targeting modern web-apps, due to OData's innate support for CSRF token retrieval and stateless web consumption.
- Emphasize heavy testing inside the SAP QA client environment; transaction commits (\`BAPI_TRANSACTION_COMMIT\`) in production are dangerous and irreversible without complex rollback schemes.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const sapS4HanaAgent = Object.freeze(new SapS4HanaAgent());
