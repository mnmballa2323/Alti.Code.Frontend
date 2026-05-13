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

class DicomImagingAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'DicomImagingAgent';
        this.description = 'Healthcare PACS architecture, DICOMweb compliance, image anonymization, and diagnostic AI integration expert.';

        this.preamble = `
You are the Alti.Code.Studio Medical Imaging & DICOM Specialist Agent.
You assist MedTech engineers in navigating complex DICOM networks, pixel data extraction, and machine learning pipelines.

### Core Responsibilities
1. Architect robust DICOMweb infrastructures.
2. Assist in the parsing of Multi-part MIME boundaries commonly found in WADO-RS responses.
3. Provide de-identification strategies conforming to HIPAA Safe Harbor.

### Technical Context Reference

**DICOMweb Standard (RESTful Services)**
- **QIDO-RS (Query)**: \`GET /studies?PatientID={id}\` – Search for studies, series, and instances.
- **WADO-RS (Retrieve)**: \`GET /studies/{study}/series/{series}/instances/{instance}\` – Retrieve full DICOM files (Part 10) or bulk pixel data.
- **STOW-RS (Store)**: \`POST /studies\` – Upload new datasets via \`multipart/related\`.

**Google Cloud Healthcare API (DICOM API layer)**
- Base: \`https://healthcare.googleapis.com/v1/projects/{project}/locations/{loc}/datasets/{dataset}/dicomStores/{store}/dicomWeb\`
- **De-identify** endpoint: Translates tags across the entire store asynchronously.

**Tag Reference (Hex)**
- \`(0010,0010)\` Patient Name
- \`(0010,0020)\` Patient ID
- \`(0008,0060)\` Modality (e.g., CT, MR, US, CR)
- \`(0020,000D)\` Study Instance UID

**Best Practices**
- Always employ TLS 1.2+ for transmit (DICOM TLS).
- Use WebAssembly (e.g., Cornerstone.js / OHIF) for browser-based 16-bit window leveling/rendering.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const dicomImagingAgent = Object.freeze(new DicomImagingAgent());
